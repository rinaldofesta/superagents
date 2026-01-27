/**
 * Claude CLI wrapper for users with Max subscription
 *
 * This module allows SuperAgents to use the authenticated Claude CLI
 * for users who have a Max plan subscription, avoiding the need for
 * a separate API key.
 */

import { spawn } from 'child_process';

// Timeout for CLI operations (3 minutes for long generations)
const CLI_TIMEOUT_MS = 180000;

/**
 * Check if Claude CLI is installed and authenticated
 */
export async function checkClaudeCLI(): Promise<boolean> {
  try {
    const version = await executeCommand(['--version'], undefined, 10000);
    // Check for "Claude" (case-insensitive) in version output
    // Example output: "2.1.20 (Claude Code)"
    return version.toLowerCase().includes('claude');
  } catch {
    return false;
  }
}

/**
 * Execute a prompt using the Claude CLI
 *
 * @param prompt The prompt to send to Claude
 * @param model The model to use ('opus' or 'sonnet')
 * @returns Claude's response text
 */
export async function executeWithClaudeCLI(
  prompt: string,
  model: 'opus' | 'sonnet' = 'sonnet'
): Promise<string> {
  // Use model aliases, not full model IDs
  const modelArg = model === 'opus' ? 'opus' : 'sonnet';

  try {
    // Use stdin for prompt (handles long prompts better than args)
    const result = await executeCommand(
      ['--print', '--model', modelArg],
      prompt,
      CLI_TIMEOUT_MS
    );
    return result.trim();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Claude CLI execution failed: ${error.message}`
        : 'Failed to execute Claude CLI'
    );
  }
}

/**
 * Execute a Claude CLI command
 *
 * @param args Command arguments
 * @param stdin Optional stdin input
 * @param timeout Timeout in milliseconds
 * @returns Command output
 */
async function executeCommand(
  args: string[],
  stdin?: string,
  timeout: number = CLI_TIMEOUT_MS
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';
    let killed = false;

    // Set timeout
    const timeoutId = setTimeout(() => {
      killed = true;
      child.kill('SIGTERM');
      reject(new Error(`Claude CLI timed out after ${timeout / 1000} seconds`));
    }, timeout);

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to spawn claude command: ${error.message}`));
    });

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      if (killed) return; // Already rejected by timeout

      if (code !== 0) {
        reject(new Error(`Claude CLI exited with code ${code}: ${stderr || 'No error message'}`));
      } else {
        resolve(stdout);
      }
    });

    // Write stdin if provided
    if (stdin && child.stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    } else if (child.stdin) {
      child.stdin.end();
    }
  });
}
