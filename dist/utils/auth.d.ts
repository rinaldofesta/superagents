/**
 * Anthropic authentication utilities
 *
 * SuperAgents supports three authentication methods:
 * 1. OAuth - Browser-based login with Anthropic (recommended)
 * 2. Claude Plan - Use authenticated Claude CLI (for Max subscription users)
 * 3. API Key - Direct Anthropic API key
 */
export type AuthMethod = 'oauth' | 'claude-plan' | 'api-key';
export interface AuthResult {
    method: AuthMethod;
    apiKey?: string;
    accessToken?: string;
}
/**
 * Authenticate user with Anthropic
 * Priority: OAuth tokens > API key in env > Claude CLI > prompt user
 */
export declare function authenticateWithAnthropic(): Promise<AuthResult>;
//# sourceMappingURL=auth.d.ts.map