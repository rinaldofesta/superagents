/**
 * Anthropic authentication utilities
 *
 * SuperAgents supports two authentication methods:
 * 1. Claude Plan - Use authenticated Claude CLI (for Max subscription users)
 * 2. API Key - Direct Anthropic API key
 */
export type AuthMethod = 'claude-plan' | 'api-key';
export interface AuthResult {
    method: AuthMethod;
    apiKey?: string;
}
/**
 * Authenticate user with Anthropic
 * Offers two methods: Claude Plan (CLI) or API Key
 */
export declare function authenticateWithAnthropic(): Promise<AuthResult>;
//# sourceMappingURL=auth.d.ts.map