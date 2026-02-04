/**
 * Anthropic authentication utilities
 *
 * SuperAgents supports three authentication methods:
 * 1. OAuth - Browser-based login with Anthropic (recommended)
 * 2. Claude Plan - Use authenticated Claude CLI (for Max subscription users)
 * 3. API Key - Direct Anthropic API key
 */

import * as p from '@clack/prompts';
import pc from 'picocolors';

import { orange } from '../cli/colors.js';
import { checkClaudeCLI } from './claude-cli.js';
import { loadStoredTokens, performOAuthLogin } from './oauth.js';

export type AuthMethod = 'oauth' | 'claude-plan' | 'api-key';

export interface AuthResult {
  method: AuthMethod;
  apiKey?: string;       // Only set for 'api-key' method
  accessToken?: string;  // Only set for 'oauth' method
}

/**
 * Authenticate user with Anthropic
 * Priority: OAuth tokens > API key in env > Claude CLI > prompt user
 */
export async function authenticateWithAnthropic(): Promise<AuthResult> {
  const spinner = p.spinner();
  spinner.start('Checking authentication...');

  // Priority 1: Check for existing OAuth tokens
  const storedTokens = await loadStoredTokens();
  if (storedTokens) {
    spinner.stop(pc.green('✓') + ' Authenticated via saved login');
    return { method: 'oauth', accessToken: storedTokens.accessToken };
  }

  // Priority 2: Check for API key in environment
  const envApiKey = process.env.ANTHROPIC_API_KEY;
  const hasApiKey = envApiKey && envApiKey.startsWith('sk-ant-');

  // Priority 3: Check if Claude CLI is available
  const hasClaudeCLI = await checkClaudeCLI();

  spinner.stop();

  // Build available options based on what's detected
  type AuthOption = 'oauth' | 'claude-plan' | 'api-key' | 'api-key-prompt' | 'cancel';
  const options: { value: AuthOption; label: string; hint: string }[] = [
    {
      value: 'oauth',
      label: 'Log in with Claude (Recommended)',
      hint: 'Opens browser for one-click authentication'
    }
  ];

  // Show what's available
  const availableNotes: string[] = [];

  if (hasApiKey) {
    availableNotes.push(`${pc.green('✓')} ANTHROPIC_API_KEY found in environment`);
    options.push({
      value: 'api-key',
      label: 'Use API Key from environment',
      hint: 'ANTHROPIC_API_KEY detected'
    });
  }

  if (hasClaudeCLI) {
    availableNotes.push(`${pc.green('✓')} Claude CLI detected`);
    options.push({
      value: 'claude-plan',
      label: 'Use Claude CLI',
      hint: 'Uses your Max subscription'
    });
  }

  options.push({
    value: 'api-key-prompt',
    label: 'Enter API Key manually',
    hint: 'Paste your Anthropic API key'
  });

  options.push({
    value: 'cancel',
    label: 'Set up later',
    hint: 'Exit and configure authentication'
  });

  // Display available options note
  if (availableNotes.length > 0) {
    p.note(
      availableNotes.join('\n') + '\n\n' +
      'Choose how you want to authenticate:',
      'Authentication'
    );
  } else {
    p.note(
      `${orange('Log in with Claude')} opens your browser for quick authentication.\n` +
      `${pc.dim('Or enter an API key from:')} ${pc.underline('https://console.anthropic.com/settings/keys')}`,
      'Authentication'
    );
  }

  const choice = await p.select<{ value: AuthOption; label: string; hint: string }[], AuthOption>({
    message: 'How would you like to authenticate?',
    options,
    initialValue: 'oauth'
  });

  if (p.isCancel(choice) || choice === 'cancel') {
    p.cancel('Authentication cancelled');
    process.exit(0);
  }

  // Handle OAuth login
  if (choice === 'oauth') {
    try {
      const tokens = await performOAuthLogin();
      return { method: 'oauth', accessToken: tokens.accessToken };
    } catch (error) {
      p.log.error(error instanceof Error ? error.message : 'OAuth login failed');
      p.log.info('Falling back to other authentication methods...');

      // Offer alternative methods
      if (hasApiKey) {
        try {
          await validateApiKey(envApiKey!);
          p.log.success('Using ANTHROPIC_API_KEY from environment');
          return { method: 'api-key', apiKey: envApiKey! };
        } catch {
          // Fall through to manual entry
        }
      }

      if (hasClaudeCLI) {
        p.log.success('Using Claude CLI');
        return { method: 'claude-plan' };
      }

      return await promptForApiKey();
    }
  }

  // Handle Claude CLI
  if (choice === 'claude-plan') {
    return { method: 'claude-plan' };
  }

  // Handle environment API key
  if (choice === 'api-key') {
    spinner.start('Validating API key...');
    try {
      await validateApiKey(envApiKey!);
      spinner.stop(pc.green('✓') + ' API key validated');
      return { method: 'api-key', apiKey: envApiKey! };
    } catch (error) {
      spinner.stop(pc.red('✗') + ' API key invalid');
      p.log.error('The ANTHROPIC_API_KEY in your environment is invalid');
      return await promptForApiKey();
    }
  }

  // Handle manual API key entry
  return await promptForApiKey();
}

/**
 * Prompt user to enter API key manually
 */
async function promptForApiKey(): Promise<AuthResult> {
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
  }) as string;

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
  } catch (error) {
    spinner.stop(pc.red('✗') + ' Invalid API key');
    throw new Error(
      error instanceof Error
        ? `API key validation failed: ${error.message}`
        : 'Invalid API key'
    );
  }
}


/**
 * Validate API key by making a minimal API request
 */
async function validateApiKey(apiKey: string): Promise<void> {
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
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('API key validation failed');
  }
}
