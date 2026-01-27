/**
 * Claude CLI wrapper for users with Max subscription
 *
 * This module allows SuperAgents to use the authenticated Claude CLI
 * for users who have a Max plan subscription, avoiding the need for
 * a separate API key.
 */
import { spawn } from 'child_process';
/**
 * Check if Claude CLI is installed and authenticated
 */
export async function checkClaudeCLI() {
    try {
        const version = await executeCommand(['--version']);
        // Check for "Claude" (case-insensitive) in version output
        // Example output: "2.1.20 (Claude Code)"
        return version.toLowerCase().includes('claude');
    }
    catch {
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
export async function executeWithClaudeCLI(prompt, model = 'sonnet') {
    const modelArg = model === 'opus' ? 'claude-opus-4-5-20251101' : 'claude-sonnet-4-5-20250929';
    try {
        const result = await executeCommand(['--print', '--model', modelArg], prompt);
        return result.trim();
    }
    catch (error) {
        throw new Error(error instanceof Error
            ? `Claude CLI execution failed: ${error.message}`
            : 'Failed to execute Claude CLI');
    }
}
/**
 * Execute a Claude CLI command
 *
 * @param args Command arguments
 * @param stdin Optional stdin input
 * @returns Command output
 */
async function executeCommand(args, stdin) {
    return new Promise((resolve, reject) => {
        const child = spawn('claude', args, {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        let stdout = '';
        let stderr = '';
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
            reject(new Error(`Failed to spawn claude command: ${error.message}`));
        });
        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
            }
            else {
                resolve(stdout);
            }
        });
        // Write stdin if provided
        if (stdin && child.stdin) {
            child.stdin.write(stdin);
            child.stdin.end();
        }
    });
}
//# sourceMappingURL=claude-cli.js.map