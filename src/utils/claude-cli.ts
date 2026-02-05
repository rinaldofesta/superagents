/**
 * Claude CLI wrapper for users with Max subscription
 *
 * This module allows SuperAgents to use the authenticated Claude CLI
 * for users who have a Max plan subscription, avoiding the need for
 * a separate API key.
 */

import { spawn } from "child_process";

// Timeout for CLI operations (3 minutes for long generations)
const CLI_TIMEOUT_MS = 180000;

/**
 * Clean Claude CLI response by removing XML-like tags and preamble text
 * This handles cases where Claude CLI outputs thinking blocks or tool syntax
 */
function cleanClaudeResponse(response: string): string {
  let cleaned = response;

  // Split by code blocks to preserve them
  const codeBlockRegex = /```[\s\S]*?```/g;
  const codeBlocks: string[] = [];
  let codeBlockIndex = 0;

  // Store code blocks temporarily
  cleaned = cleaned.replace(codeBlockRegex, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlockIndex++}__`;
  });

  // Remove thinking blocks (various formats)
  cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "");
  cleaned = cleaned.replace(/<thinking[\s\S]*?\/>/gi, "");

  // Remove function_calls blocks
  cleaned = cleaned.replace(/<function_calls>[\s\S]*?<\/function_calls>/gi, "");

  // Remove invoke blocks (both self-closing and with content)
  cleaned = cleaned.replace(/<invoke[^>]*>[\s\S]*?<\/invoke>/gi, "");
  cleaned = cleaned.replace(/<invoke[^>]*\/>/gi, "");

  // Remove parameter blocks
  cleaned = cleaned.replace(/<parameter[^>]*>[\s\S]*?<\/parameter>/gi, "");

  // Remove other common internal tags
  cleaned = cleaned.replace(/<\/?function_calls>/gi, "");
  cleaned = cleaned.replace(/<\/?invoke>/gi, "");
  cleaned = cleaned.replace(/<\/?parameter>/gi, "");
  cleaned = cleaned.replace(/<\/?thinking>/gi, "");

  // Remove common preamble phrases that Claude might add
  // These match patterns like "I'll read... before generating" or "Let me read... to understand"
  const preamblePatterns = [
    /I'll read the key source files[\s\S]*?before generating/i,
    /Let me read these files[\s\S]*?to understand/i,
    /Let me get more context[\s\S]*?on the project/i,
    /Now I have a good understanding[\s\S]*?Let me create/i,
    /Now I'll create[\s\S]*?file:/i,
  ];

  for (const pattern of preamblePatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  // Restore code blocks
  codeBlocks.forEach((block, index) => {
    cleaned = cleaned.replace(`__CODE_BLOCK_${index}__`, block);
  });

  // Remove multiple consecutive blank lines (more than 2)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Check if Claude CLI is installed and authenticated
 * Makes a quick API call to verify the user is actually logged in
 */
export async function checkClaudeCLI(): Promise<boolean> {
  try {
    // First check if CLI is installed
    const version = await executeCommand(["--version"], undefined, 5000);
    if (!version.toLowerCase().includes("claude")) {
      return false;
    }

    // Make a minimal test call to verify authentication
    // Simple prompt, short timeout - fast fail if not authenticated
    const result = await executeCommand(
      [
        "--print",
        "--no-session-persistence",
      ],
      "Reply with just 'ok'",
      10000, // 10 second timeout
    );

    // If we got any response without error, user is authenticated
    return result.length > 0;
  } catch {
    // Any error means not authenticated or CLI issue
    return false;
  }
}

/**
 * Execute a prompt using the Claude CLI
 *
 * @param prompt The prompt to send to Claude
 * @param model The model to use ('opus' or 'sonnet')
 * @returns Claude's response text (cleaned of internal thinking/tool syntax)
 */
export async function executeWithClaudeCLI(
  prompt: string,
  model: "opus" | "sonnet" = "sonnet",
): Promise<string> {
  // Use model aliases, not full model IDs
  const modelArg = model === "opus" ? "opus" : "sonnet";

  try {
    // Use stdin for prompt (handles long prompts better than args)
    // Add flags to avoid picking up local context:
    // --no-session-persistence: don't save/resume sessions
    // --setting-sources user: only use user settings, not project/.claude
    const result = await executeCommand(
      [
        "--print",
        "--model",
        modelArg,
        "--no-session-persistence",
        "--setting-sources",
        "user",
        "--tools",
        "", // Disable all tools - just return text
      ],
      prompt,
      CLI_TIMEOUT_MS,
    );

    // Clean the response to remove any internal thinking blocks or tool syntax
    return cleanClaudeResponse(result);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Claude CLI execution failed: ${error.message}`
        : "Failed to execute Claude CLI",
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
  timeout: number = CLI_TIMEOUT_MS,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";
    let killed = false;

    // Set timeout
    const timeoutId = setTimeout(() => {
      killed = true;
      child.kill("SIGTERM");
      reject(new Error(`Claude CLI timed out after ${timeout / 1000} seconds`));
    }, timeout);

    if (child.stdout) {
      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });
    }

    child.on("error", (error) => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to spawn claude command: ${error.message}`));
    });

    child.on("close", (code) => {
      clearTimeout(timeoutId);
      if (killed) return; // Already rejected by timeout

      if (code !== 0) {
        reject(
          new Error(
            `Claude CLI exited with code ${code}: ${stderr || "No error message"}`,
          ),
        );
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
