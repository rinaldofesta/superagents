/**
 * OAuth 2.0 + PKCE implementation for Anthropic authentication
 *
 * Provides native browser-based OAuth flow:
 * 1. Generate PKCE code_verifier and code_challenge
 * 2. Start local HTTP callback server
 * 3. Open browser to Anthropic authorization endpoint
 * 4. Receive authorization code via callback
 * 5. Exchange code for access/refresh tokens
 * 6. Store tokens securely
 */
/**
 * OAuth token structure
 */
export interface OAuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    scopes: string[];
}
/**
 * Load stored tokens from the credentials file
 * Returns null if no tokens exist or if they're expired
 */
export declare function loadStoredTokens(): Promise<OAuthTokens | null>;
/**
 * Refresh tokens using the refresh token
 */
export declare function refreshTokens(refreshToken: string): Promise<OAuthTokens>;
/**
 * Clear stored OAuth tokens (logout)
 */
export declare function clearStoredTokens(): Promise<void>;
/**
 * Perform the full OAuth 2.0 + PKCE login flow
 *
 * 1. Generate PKCE challenge
 * 2. Start local callback server
 * 3. Open browser for authorization
 * 4. Wait for callback with authorization code
 * 5. Exchange code for tokens
 * 6. Store tokens securely
 */
export declare function performOAuthLogin(): Promise<OAuthTokens>;
/**
 * Check if user has valid stored OAuth credentials
 */
export declare function hasValidOAuthCredentials(): Promise<boolean>;
//# sourceMappingURL=oauth.d.ts.map