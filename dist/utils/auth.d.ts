/**
 * Anthropic authentication utilities
 *
 * SuperAgents supports two authentication methods:
 * 1. Claude CLI - Use Claude CLI with browser login (for Max subscription users)
 * 2. API Key - Direct Anthropic API key
 *
 * The "Log in with Claude" option uses Claude CLI's built-in OAuth flow,
 * which handles browser authentication properly with a registered client.
 */
export type AuthMethod = 'claude-plan' | 'api-key';
export interface AuthResult {
    method: AuthMethod;
    apiKey?: string;
}
/**
 * Authenticate user with Anthropic
 * Priority: Authenticated CLI > API key in env > Offer login options
 */
export declare function authenticateWithAnthropic(): Promise<AuthResult>;
//# sourceMappingURL=auth.d.ts.map