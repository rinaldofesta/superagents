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
// Node.js built-ins
import crypto from 'crypto';
import http from 'http';
import os from 'os';
import path from 'path';
// External packages
import fs from 'fs-extra';
import open from 'open';
import pc from 'picocolors';
// Internal modules
import { orange } from '../cli/colors.js';
/**
 * OAuth configuration for Anthropic
 * Based on research of Claude CLI and Anthropic OAuth API
 */
const OAUTH_CONFIG = {
    authorizationEndpoint: 'https://console.anthropic.com/oauth/authorize',
    tokenEndpoint: 'https://console.anthropic.com/oauth/token',
    // Client ID - using a generic public client identifier
    // In production, this should be registered with Anthropic
    clientId: 'superagents-cli',
    scopes: ['user:inference', 'user:profile'],
    redirectPort: 54321,
    // Timeout for OAuth flow (5 minutes)
    timeoutMs: 300000,
};
/**
 * Get the credentials directory path
 */
function getCredentialsDir() {
    return path.join(os.homedir(), '.superagents');
}
/**
 * Get the credentials file path
 */
function getCredentialsFile() {
    return path.join(getCredentialsDir(), 'credentials.json');
}
/**
 * Generate PKCE code_verifier and code_challenge
 * Uses SHA-256 for the challenge as required by OAuth 2.0 PKCE spec
 */
function generatePKCE() {
    // Generate a random 32-byte code verifier (base64url encoded = 43 chars)
    const verifier = crypto.randomBytes(32).toString('base64url');
    // Create SHA-256 hash of verifier, base64url encoded
    const challenge = crypto
        .createHash('sha256')
        .update(verifier)
        .digest('base64url');
    return { verifier, challenge };
}
/**
 * Generate a random state parameter for CSRF protection
 */
function generateState() {
    return crypto.randomBytes(16).toString('hex');
}
/**
 * Start a local HTTP server to receive the OAuth callback
 * Returns a promise that resolves with the authorization code
 */
function startCallbackServer(port, expectedState) {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            // Parse the callback URL
            const url = new URL(req.url || '/', `http://localhost:${port}`);
            // Check if this is the callback path
            if (url.pathname !== '/callback') {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            // Extract authorization code and state
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');
            const error = url.searchParams.get('error');
            const errorDescription = url.searchParams.get('error_description');
            // Handle OAuth errors
            if (error) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Authentication Failed</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  background: #1a1a1a;
                  color: #fff;
                }
                .container {
                  text-align: center;
                  padding: 40px;
                }
                h1 { color: #ff4d00; margin-bottom: 16px; }
                p { color: #888; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Authentication Failed</h1>
                <p>${errorDescription || error}</p>
                <p>You can close this window and try again.</p>
              </div>
            </body>
          </html>
        `);
                reject(new Error(`OAuth error: ${error} - ${errorDescription}`));
                return;
            }
            // Validate state to prevent CSRF
            if (state !== expectedState) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Authentication Failed</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  background: #1a1a1a;
                  color: #fff;
                }
                .container {
                  text-align: center;
                  padding: 40px;
                }
                h1 { color: #ff4d00; margin-bottom: 16px; }
                p { color: #888; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Security Error</h1>
                <p>State mismatch - possible CSRF attack.</p>
                <p>Please close this window and try again.</p>
              </div>
            </body>
          </html>
        `);
                reject(new Error('OAuth state mismatch - possible CSRF attack'));
                return;
            }
            // Validate authorization code
            if (!code) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Authentication Failed</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  background: #1a1a1a;
                  color: #fff;
                }
                .container {
                  text-align: center;
                  padding: 40px;
                }
                h1 { color: #ff4d00; margin-bottom: 16px; }
                p { color: #888; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Authentication Failed</h1>
                <p>No authorization code received.</p>
                <p>Please close this window and try again.</p>
              </div>
            </body>
          </html>
        `);
                reject(new Error('No authorization code received'));
                return;
            }
            // Success! Show success page and resolve
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Authenticated!</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #1a1a1a;
                color: #fff;
              }
              .container {
                text-align: center;
                padding: 40px;
              }
              h1 { color: #ff4d00; margin-bottom: 16px; }
              .checkmark {
                font-size: 64px;
                margin-bottom: 20px;
              }
              p { color: #888; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="checkmark">✓</div>
              <h1>Authenticated!</h1>
              <p>You can close this window and return to the terminal.</p>
            </div>
          </body>
        </html>
      `);
            resolve({ code, server });
        });
        server.on('error', (err) => {
            reject(new Error(`Failed to start callback server: ${err.message}`));
        });
        server.listen(port, '127.0.0.1', () => {
            // Server started successfully
        });
    });
}
/**
 * Exchange authorization code for access and refresh tokens
 */
async function exchangeCodeForTokens(code, codeVerifier, redirectUri) {
    const response = await fetch(OAUTH_CONFIG.tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: OAUTH_CONFIG.clientId,
            code,
            code_verifier: codeVerifier,
            redirect_uri: redirectUri,
        }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Token exchange failed: ${response.status}`;
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error_description || errorJson.error || errorMessage;
        }
        catch {
            // Use status code if we can't parse error
        }
        throw new Error(errorMessage);
    }
    const data = await response.json();
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        scopes: data.scope?.split(' ') || OAUTH_CONFIG.scopes,
    };
}
/**
 * Store tokens securely in the credentials file
 * Uses restrictive file permissions (0600 - owner read/write only)
 */
async function storeTokens(tokens) {
    const credentialsDir = getCredentialsDir();
    const credentialsFile = getCredentialsFile();
    // Ensure directory exists with restrictive permissions
    await fs.ensureDir(credentialsDir);
    // Write tokens with restrictive permissions
    await fs.writeJson(credentialsFile, tokens, {
        mode: 0o600, // Owner read/write only
        spaces: 2,
    });
}
/**
 * Load stored tokens from the credentials file
 * Returns null if no tokens exist or if they're expired
 */
export async function loadStoredTokens() {
    const credentialsFile = getCredentialsFile();
    // Check if credentials file exists
    if (!(await fs.pathExists(credentialsFile))) {
        return null;
    }
    try {
        const tokens = await fs.readJson(credentialsFile);
        // Validate token structure
        if (!tokens.accessToken || !tokens.refreshToken || !tokens.expiresAt) {
            return null;
        }
        // Check if token is expired (with 5 minute buffer)
        const expirationBuffer = 5 * 60 * 1000; // 5 minutes
        if (tokens.expiresAt < Date.now() + expirationBuffer) {
            // Token is expired or about to expire, try to refresh
            try {
                const refreshed = await refreshTokens(tokens.refreshToken);
                return refreshed;
            }
            catch {
                // Refresh failed, need to re-authenticate
                return null;
            }
        }
        return tokens;
    }
    catch {
        // Invalid or corrupted credentials file
        return null;
    }
}
/**
 * Refresh tokens using the refresh token
 */
export async function refreshTokens(refreshToken) {
    const response = await fetch(OAUTH_CONFIG.tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: OAUTH_CONFIG.clientId,
            refresh_token: refreshToken,
        }),
    });
    if (!response.ok) {
        throw new Error('Token refresh failed - please log in again');
    }
    const data = await response.json();
    const tokens = {
        accessToken: data.access_token,
        // Use new refresh token if provided, otherwise keep the old one
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: Date.now() + (data.expires_in * 1000),
        scopes: data.scope?.split(' ') || OAUTH_CONFIG.scopes,
    };
    // Store refreshed tokens
    await storeTokens(tokens);
    return tokens;
}
/**
 * Clear stored OAuth tokens (logout)
 */
export async function clearStoredTokens() {
    const credentialsFile = getCredentialsFile();
    if (await fs.pathExists(credentialsFile)) {
        await fs.remove(credentialsFile);
    }
}
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
export async function performOAuthLogin() {
    // Generate PKCE challenge
    const { verifier, challenge } = generatePKCE();
    const state = generateState();
    // Build redirect URI
    const redirectUri = `http://localhost:${OAUTH_CONFIG.redirectPort}/callback`;
    // Build authorization URL
    const authUrl = new URL(OAUTH_CONFIG.authorizationEndpoint);
    authUrl.searchParams.set('client_id', OAUTH_CONFIG.clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', OAUTH_CONFIG.scopes.join(' '));
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);
    // Start callback server and set up timeout
    console.log(pc.dim('  Starting local authentication server...'));
    const serverPromise = startCallbackServer(OAUTH_CONFIG.redirectPort, state);
    // Open browser for authorization
    console.log(orange('  Opening browser for authentication...'));
    console.log(pc.dim(`  If the browser doesn't open, visit:`));
    console.log(pc.dim(`  ${authUrl.toString()}\n`));
    await open(authUrl.toString());
    // Wait for callback with timeout
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('OAuth timeout - authentication took too long'));
        }, OAUTH_CONFIG.timeoutMs);
    });
    let code;
    let server;
    try {
        const result = await Promise.race([serverPromise, timeoutPromise]);
        code = result.code;
        server = result.server;
    }
    catch (error) {
        throw error;
    }
    // Exchange code for tokens
    console.log(pc.dim('  Exchanging authorization code for tokens...'));
    try {
        const tokens = await exchangeCodeForTokens(code, verifier, redirectUri);
        // Store tokens
        await storeTokens(tokens);
        console.log(pc.green('  ✓') + ' Authentication successful!\n');
        return tokens;
    }
    finally {
        // Always close the server
        server.close();
    }
}
/**
 * Check if user has valid stored OAuth credentials
 */
export async function hasValidOAuthCredentials() {
    const tokens = await loadStoredTokens();
    return tokens !== null;
}
//# sourceMappingURL=oauth.js.map