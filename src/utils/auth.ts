/**
 * Anthropic authentication utilities
 *
 * SuperAgents supports two authentication methods:
 * 1. Claude Plan - Use authenticated Claude CLI (for Max subscription users)
 * 2. API Key - Direct Anthropic API key
 */

import * as p from '@clack/prompts';
import pc from 'picocolors';

import { orange } from '../cli/colors.js';
import { checkClaudeCLI } from './claude-cli.js';

export type AuthMethod = 'claude-plan' | 'api-key';

export interface AuthResult {
  method: AuthMethod;
  apiKey?: string;  // Only set for 'api-key' method
}

/**
 * Authenticate user with Anthropic
 * Offers two methods: Claude Plan (CLI) or API Key
 */
export async function authenticateWithAnthropic(): Promise<AuthResult> {
  const spinner = p.spinner();
  spinner.start('Checking authentication options...');

  // Check for existing API key in environment
  const envApiKey = process.env.ANTHROPIC_API_KEY;
  const hasApiKey = envApiKey && envApiKey.startsWith('sk-ant-');

  // Check if Claude CLI is available
  const hasClaudeCLI = await checkClaudeCLI();

  spinner.stop();

  // If both are available, let user choose
  if (hasApiKey && hasClaudeCLI) {
    p.note(
      `${pc.green('✓')} Found ANTHROPIC_API_KEY in environment\n` +
      `${pc.green('✓')} Found authenticated Claude CLI\n\n` +
      `Choose your preferred authentication method:`,
      'Authentication Options Available'
    );

    const choice = await p.select<{ value: AuthMethod; label: string; hint: string }[], AuthMethod>({
      message: 'How would you like to authenticate?',
      options: [
        {
          value: 'claude-plan',
          label: 'Claude Plan (use authenticated Claude CLI)',
          hint: 'Uses your Max subscription'
        },
        {
          value: 'api-key',
          label: 'API Key (use ANTHROPIC_API_KEY)',
          hint: 'Direct API usage'
        }
      ],
      initialValue: 'claude-plan'
    });

    if (p.isCancel(choice)) {
      p.cancel('Authentication cancelled');
      process.exit(0);
    }

    if (choice === 'claude-plan') {
      return { method: 'claude-plan' };
    } else {
      // Validate the API key
      try {
        await validateApiKey(envApiKey!);
        p.log.success('Using ANTHROPIC_API_KEY from environment');
        return { method: 'api-key', apiKey: envApiKey! };
      } catch (error) {
        p.log.error('ANTHROPIC_API_KEY found but invalid');
        return await promptForApiKey();
      }
    }
  }

  // Only Claude CLI available
  if (hasClaudeCLI) {
    p.note(
      `${pc.green('✓')} Found authenticated Claude CLI\n\n` +
      `Using your Claude Max subscription via the CLI.`,
      'Claude Plan Authentication'
    );
    return { method: 'claude-plan' };
  }

  // Only API key available
  if (hasApiKey) {
    spinner.start('Validating API key...');
    try {
      await validateApiKey(envApiKey!);
      spinner.stop(pc.green('✓') + ' Using ANTHROPIC_API_KEY from environment');
      return { method: 'api-key', apiKey: envApiKey! };
    } catch (error) {
      spinner.stop(pc.yellow('⚠') + ' ANTHROPIC_API_KEY found but invalid');
    }
  }

  // Nothing available - prompt user
  p.note(
    `${pc.yellow('No authentication found.')}\n\n` +
    `SuperAgents supports two authentication methods:\n\n` +
    `${orange('1. Claude Plan')} (Recommended for Max subscribers)\n` +
    `   ${pc.dim('• Install Claude CLI:')} ${pc.underline('https://claude.ai/download')}\n` +
    `   ${pc.dim('• Authenticate with:')} ${pc.bold('claude auth login')}\n\n` +
    `${orange('2. API Key')}\n` +
    `   ${pc.dim('• Get key from:')} ${pc.underline('https://console.anthropic.com/settings/keys')}\n` +
    `   ${pc.dim('• Set environment variable:')} ${pc.bold('ANTHROPIC_API_KEY=sk-ant-...')}`,
    'Authentication Required'
  );

  const choice = await p.select({
    message: 'Choose authentication method:',
    options: [
      {
        value: 'api-key' as const,
        label: 'Enter API Key now',
        hint: 'I have an Anthropic API key'
      },
      {
        value: 'cancel' as const,
        label: 'Set up later',
        hint: 'Exit and configure authentication'
      }
    ]
  });

  if (p.isCancel(choice) || choice === 'cancel') {
    p.cancel('Authentication cancelled');
    process.exit(0);
  }

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
