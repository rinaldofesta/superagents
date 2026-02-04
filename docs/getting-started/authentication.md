# Authentication

SuperAgents supports two authentication methods for Claude API access.

## Authentication Methods

| Method | Setup | Best For |
|--------|-------|----------|
| Claude Plan | No configuration needed | Claude Max subscribers |
| API Key | Set environment variable | Anthropic API customers |

Choose the method that matches your subscription.

## Claude Plan (Claude Max)

If you have a Claude Max subscription, SuperAgents can use Claude CLI for authentication.

### Prerequisites

1. Active Claude Max subscription
2. Claude CLI installed (SuperAgents checks automatically)

### Setup

No manual setup needed. When you run SuperAgents:

```bash
superagents
```

Select "Claude Plan" when prompted:

```
? How would you like to authenticate?
  ● Claude Plan (Claude Max subscription)
  ○ API Key
```

SuperAgents uses the Claude CLI for API access. Your subscription limits apply.

### Verification

Test that Claude CLI is working:

```bash
claude --version
```

If this command fails, install Claude CLI first.

## API Key (Anthropic API)

If you have an Anthropic API key, use this method.

### Get an API Key

1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign in or create an account
3. Navigate to API Keys
4. Create a new key (starts with `sk-ant-`)
5. Copy the key (shown only once)

### Set Environment Variable

Add your API key to your shell configuration:

**For zsh (default on macOS):**

```bash
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key-here' >> ~/.zshrc
source ~/.zshrc
```

**For bash:**

```bash
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key-here' >> ~/.bashrc
source ~/.bashrc
```

**For fish:**

```bash
set -Ux ANTHROPIC_API_KEY sk-ant-your-key-here
```

Replace `sk-ant-your-key-here` with your actual key.

### Verify Setup

Check that the variable is set:

```bash
echo $ANTHROPIC_API_KEY
```

Should output your API key.

### Per-Project Keys (Optional)

Use different keys per project with a `.env` file:

```bash
# In your project directory
echo 'ANTHROPIC_API_KEY=sk-ant-project-specific-key' > .env
```

Then set it before running:

```bash
export $(cat .env | xargs) && superagents
```

### Temporary Key (One Command)

Set the key for a single command:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key superagents
```

The key applies only to this command.

## Switching Between Methods

SuperAgents asks for authentication method each time. To change the default:

1. Clear any set environment variables (for Claude Plan)
2. Set `ANTHROPIC_API_KEY` (for API Key mode)

Or use the interactive prompt to choose each run.

## Security Best Practices

### Protect Your API Key

- Never commit API keys to version control
- Add `.env` to `.gitignore`
- Use environment variables, not hardcoded keys
- Rotate keys periodically

### Key Permissions

Anthropic API keys have full account access. Treat them like passwords.

### Revoke Compromised Keys

If a key is exposed:

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Navigate to API Keys
3. Delete the compromised key
4. Generate a new key
5. Update your environment variables

## Rate Limits and Costs

### Claude Plan

- Subject to Claude Max subscription limits
- No per-token billing
- Fair-use policy applies

### API Key

- Billed per token used
- Rate limits based on tier (see [Anthropic pricing](https://www.anthropic.com/pricing))
- SuperAgents optimizes costs with:
  - Local templates (no API calls for 31 templates)
  - Tiered models (Haiku for simple tasks)
  - Smart caching (reduces duplicate requests)

Preview costs before generating:

```bash
superagents --dry-run
```

Shows estimated token usage and cost.

## Troubleshooting

### "API key not found"

**Problem:** SuperAgents can't find your API key.

**Solution:**
1. Verify variable is set: `echo $ANTHROPIC_API_KEY`
2. Restart terminal after adding to shell config
3. Check for typos in the key

### "Authentication failed"

**Problem:** API key is invalid or expired.

**Solution:**
1. Generate a new key at [console.anthropic.com](https://console.anthropic.com/)
2. Update environment variable
3. Verify key starts with `sk-ant-`

### "Claude CLI not found" (Claude Plan)

**Problem:** Claude CLI isn't installed.

**Solution:**
1. Install Claude CLI
2. Verify with `claude --version`
3. Or switch to API Key method

### Rate Limit Errors

**Problem:** Too many requests in short time.

**Solution:**
1. Wait a few minutes
2. Use `--dry-run` to preview without API calls
3. Check cache with `superagents cache --stats` (may not need API)

## Next Steps

- [Quickstart Guide](quickstart.md) - Generate your first configuration
- [Caching](../concepts/caching.md) - Learn how caching reduces API usage
- [CLI Options](../reference/cli-options.md) - Command-line flags
