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
import { spawn } from 'child_process';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { orange } from '../cli/colors.js';
import { checkClaudeCLI } from './claude-cli.js';
/**
 * Check if Claude CLI is installed (regardless of auth status)
 */
async function isClaudeCLIInstalled() {
    return new Promise((resolve) => {
        const child = spawn('claude', ['--version'], {
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        child.on('error', () => resolve(false));
        child.on('close', (code) => resolve(code === 0));
    });
}
/**
 * Install Claude CLI silently via npm
 * Returns true if installation succeeded
 */
async function installClaudeCLI() {
    const INSTALL_TIMEOUT_MS = 60000; // 60 seconds
    return new Promise((resolve) => {
        const child = spawn('npm', ['install', '-g', '@anthropic-ai/claude-code'], {
            stdio: ['pipe', 'pipe', 'pipe'], // Silent - no output to user
        });
        const timeoutId = setTimeout(() => {
            child.kill('SIGTERM');
            resolve(false);
        }, INSTALL_TIMEOUT_MS);
        child.on('error', () => {
            clearTimeout(timeoutId);
            resolve(false);
        });
        child.on('close', (code) => {
            clearTimeout(timeoutId);
            resolve(code === 0);
        });
    });
}
/**
 * Run claude setup-token to authenticate via browser
 * This opens the browser for OAuth and returns when complete
 */
async function runClaudeLogin() {
    return new Promise((resolve) => {
        // Show pre-flight message so users know to come back
        p.note(`A browser window will open for you to sign in.\n\n` +
            `${pc.bold('After you sign in:')}\n` +
            `  Come back here — setup continues automatically.`, '🌐  Next Step');
        const child = spawn('claude', ['setup-token'], {
            stdio: 'inherit', // Use parent's stdio for interactive auth
        });
        child.on('error', (err) => {
            console.log(pc.red(`\n  Login failed: ${err.message}\n`));
            resolve(false);
        });
        child.on('close', (code) => {
            resolve(code === 0);
        });
    });
}
/**
 * Authenticate user with Anthropic
 * Priority: Authenticated CLI > API key in env > Offer login options
 */
export async function authenticateWithAnthropic() {
    const spinner = p.spinner();
    // Check for API key in environment first (fast)
    const envApiKey = process.env.ANTHROPIC_API_KEY;
    const hasApiKey = envApiKey && envApiKey.startsWith('sk-ant-');
    // Check if Claude CLI is installed (fast)
    const cliInstalled = await isClaudeCLIInstalled();
    // If CLI is installed, check if user is already logged in
    let cliAuthenticated = false;
    if (cliInstalled) {
        spinner.start('Checking if you\'re already signed in...');
        cliAuthenticated = await checkClaudeCLI();
        spinner.stop();
    }
    // If Claude CLI is authenticated, use it automatically
    if (cliAuthenticated) {
        p.log.success('Already signed in with Claude');
        return { method: 'claude-plan' };
    }
    // If API key exists and is valid, offer it as default
    if (hasApiKey) {
        spinner.start('Validating API key...');
        try {
            await validateApiKey(envApiKey);
            spinner.stop(pc.green('✓') + ' Using ANTHROPIC_API_KEY from environment');
            return { method: 'api-key', apiKey: envApiKey };
        }
        catch {
            spinner.stop(pc.yellow('⚠') + ' ANTHROPIC_API_KEY found but invalid');
        }
    }
    const options = [
        {
            value: 'login',
            label: 'Log in with Claude',
            hint: 'Easiest option — opens your browser'
        },
        {
            value: 'api-key-prompt',
            label: 'I have an API key',
            hint: 'For developers with Anthropic accounts'
        },
        {
            value: 'cancel',
            label: 'Set up later',
            hint: 'Exit and configure later'
        }
    ];
    // User-friendly note content (no technical jargon)
    const noteContent = `${orange('Log in with Claude')} is the easiest way to get started.\n` +
        `${pc.dim('Works with any Claude subscription (Pro, Max, or Teams).')}\n\n` +
        `${pc.dim('Already have an API key? Choose "Enter API Key" below.')}`;
    p.note(noteContent, '🔐  Authentication');
    const choice = await p.select({
        message: 'How would you like to sign in?',
        options,
        initialValue: 'login'
    });
    if (p.isCancel(choice) || choice === 'cancel') {
        p.cancel('Authentication cancelled');
        process.exit(0);
    }
    // Handle browser login via Claude CLI
    if (choice === 'login') {
        // Auto-install Claude CLI if not present (silent, clean spinner)
        if (!cliInstalled) {
            const installSpinner = p.spinner();
            installSpinner.start('Setting up Claude login...');
            const installed = await installClaudeCLI();
            if (!installed) {
                installSpinner.stop(pc.yellow('⚠') + ' Setup needs one extra step');
                p.note(`Run this command, then try again:\n\n` +
                    `  ${pc.bold('npm install -g @anthropic-ai/claude-code')}`, 'Quick Fix');
                const fallback = await p.select({
                    message: 'What would you like to do?',
                    options: [
                        { value: 'api-key', label: 'Enter API Key instead', hint: 'Use your Anthropic API key' },
                        { value: 'cancel', label: 'Exit', hint: 'Run the command and try again' }
                    ]
                });
                if (p.isCancel(fallback) || fallback === 'cancel') {
                    p.cancel('No problem! Run superagents again after the setup.');
                    process.exit(0);
                }
                return await promptForApiKey();
            }
            installSpinner.stop(pc.green('✓') + ' Ready');
        }
        const success = await runClaudeLogin();
        if (success) {
            // Verify authentication worked
            const isNowAuthenticated = await checkClaudeCLI();
            if (isNowAuthenticated) {
                p.log.success('Logged in successfully!');
                return { method: 'claude-plan' };
            }
        }
        // Login failed or was cancelled
        p.log.warn('Looks like the login didn\'t finish — no worries, you can try again');
        const fallback = await p.select({
            message: 'What would you like to do?',
            options: [
                { value: 'api-key', label: 'Enter API Key instead', hint: 'Use your Anthropic API key' },
                { value: 'retry', label: 'Try login again', hint: 'Opens browser' },
                { value: 'cancel', label: 'Exit', hint: 'Try again later' }
            ]
        });
        if (p.isCancel(fallback) || fallback === 'cancel') {
            p.cancel('Authentication cancelled');
            process.exit(0);
        }
        if (fallback === 'retry') {
            const retrySuccess = await runClaudeLogin();
            if (retrySuccess && await checkClaudeCLI()) {
                p.log.success('Logged in successfully!');
                return { method: 'claude-plan' };
            }
            p.log.warn('Login didn\'t complete — let\'s try another way');
        }
        return await promptForApiKey();
    }
    // Handle manual API key entry
    return await promptForApiKey();
}
/**
 * Prompt user to enter API key manually
 */
async function promptForApiKey() {
    const apiKey = await p.password({
        message: 'Enter your Anthropic API key',
        validate: (value) => {
            if (!value || value.trim().length === 0) {
                return 'API key is required';
            }
            if (!value.startsWith('sk-ant-')) {
                return 'Invalid API key format (should start with sk-ant-)';
            }
            return undefined;
        }
    });
    if (p.isCancel(apiKey)) {
        p.cancel('Authentication cancelled');
        process.exit(0);
    }
    // Validate the API key
    const spinner = p.spinner();
    spinner.start('Validating API key...');
    try {
        await validateApiKey(apiKey);
        spinner.stop(pc.green('✓') + ' API key validated');
        return {
            method: 'api-key',
            apiKey: apiKey.trim()
        };
    }
    catch (error) {
        spinner.stop(pc.red('✗') + ' Invalid API key');
        throw new Error(error instanceof Error
            ? `API key validation failed: ${error.message}`
            : 'Invalid API key');
    }
}
/**
 * Validate API key by making a minimal API request
 */
async function validateApiKey(apiKey) {
    // Dynamically import Anthropic to avoid circular dependencies
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });
    try {
        // Make a minimal test request
        await client.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
        });
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('API key validation failed');
    }
}
//# sourceMappingURL=auth.js.map