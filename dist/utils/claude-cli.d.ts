/**
 * Claude CLI wrapper for users with Max subscription
 *
 * This module allows SuperAgents to use the authenticated Claude CLI
 * for users who have a Max plan subscription, avoiding the need for
 * a separate API key.
 */
/**
 * Check if Claude CLI is installed and authenticated
 */
export declare function checkClaudeCLI(): Promise<boolean>;
/**
 * Execute a prompt using the Claude CLI
 *
 * @param prompt The prompt to send to Claude
 * @param model The model to use ('opus' or 'sonnet')
 * @returns Claude's response text
 */
export declare function executeWithClaudeCLI(prompt: string, model?: 'opus' | 'sonnet'): Promise<string>;
//# sourceMappingURL=claude-cli.d.ts.map