# Environment Variables Reference

SuperAgents reads configuration from environment variables.

## Variables

### ANTHROPIC_API_KEY

Anthropic API key for authentication.

**Required:** Yes, if using API Key authentication mode

**Format:** String starting with `sk-ant-`

**Example:**

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-xxx...
```

**Usage:**

When you select "API Key" during authentication, SuperAgents uses this variable to authenticate with the Claude API.

If not set and API Key mode is selected:

```
✗ Error: ANTHROPIC_API_KEY environment variable not set

Set your API key:
  export ANTHROPIC_API_KEY=sk-ant-your-key

Or choose Claude Plan mode during authentication.
```

**Security:**

- Never commit API keys to version control
- Use `.env` files (add to `.gitignore`)
- Rotate keys periodically
- Set per-project if needed

See [Authentication Guide](../getting-started/authentication.md) for setup details.

### HOME

User's home directory.

**Required:** Yes (automatically set by system)

**Format:** Absolute path

**Example:**

```bash
echo $HOME
# /Users/username (macOS)
# /home/username (Linux)
```

**Usage:**

SuperAgents uses `$HOME` to locate:
- Cache directory: `$HOME/.superagents/cache/`
- Templates directory: `$HOME/.superagents/templates/`

If `HOME` is not set (rare), SuperAgents falls back to `~`.

### SUPERAGENTS_CACHE_DIR (Future)

Custom cache directory location.

**Required:** No

**Status:** Not yet implemented (planned for v1.4)

**Planned usage:**

```bash
export SUPERAGENTS_CACHE_DIR=/tmp/superagents-cache
```

Would override default `~/.superagents/cache/` location.

### SUPERAGENTS_LOG_LEVEL (Future)

Log verbosity level.

**Required:** No

**Status:** Not yet implemented (planned for v1.4)

**Planned values:** `debug`, `info`, `warn`, `error`

**Planned usage:**

```bash
export SUPERAGENTS_LOG_LEVEL=debug
superagents
```

Would enable debug logging without `--verbose` flag.

## Setting Environment Variables

### Temporary (Current Session)

Set for current terminal session:

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key
superagents
```

Variable is lost when terminal closes.

### Permanent (Shell Configuration)

Add to shell configuration file:

**For zsh (default on macOS):**

```bash
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key' >> ~/.zshrc
source ~/.zshrc
```

**For bash:**

```bash
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key' >> ~/.bashrc
source ~/.bashrc
```

**For fish:**

```bash
set -Ux ANTHROPIC_API_KEY sk-ant-your-key
```

Variable persists across terminal sessions.

### Per-Project (.env file)

Create `.env` file in project root:

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-project-specific-key
```

**Load before running:**

```bash
export $(cat .env | xargs)
superagents
```

**Important:** Add `.env` to `.gitignore`:

```gitignore
.env
.env.local
```

### Per-Command

Set for single command only:

```bash
ANTHROPIC_API_KEY=sk-ant-key superagents
```

Variable applies only to this command.

## Checking Environment Variables

### View Current Value

```bash
echo $ANTHROPIC_API_KEY
```

Should output your key (or nothing if not set).

### View All SuperAgents-Related Variables

```bash
env | grep ANTHROPIC
env | grep SUPERAGENTS
```

### Verify in Verbose Mode

```bash
superagents --verbose --dry-run
```

Look for authentication method in output:

```
[DEBUG] Authentication: API Key (from ANTHROPIC_API_KEY)
```

## Security Best Practices

### Never Hardcode Keys

Don't do this:

```bash
# Bad: hardcoded in script
ANTHROPIC_API_KEY=sk-ant-abc123 superagents
```

Do this:

```bash
# Good: read from secure storage
export ANTHROPIC_API_KEY=$(cat ~/.secrets/anthropic_key)
superagents
```

### Use .gitignore

Always ignore files with secrets:

```gitignore
.env
.env.local
.env.production
*.key
secrets/
```

### Rotate Keys

Periodically generate new API keys:

1. Create new key at [console.anthropic.com](https://console.anthropic.com/)
2. Update environment variable
3. Test with `superagents --dry-run`
4. Delete old key

### Per-Project Keys

Use different keys for different projects:

```bash
# Project 1
cd project-1
export ANTHROPIC_API_KEY=sk-ant-project1-key
superagents

# Project 2
cd project-2
export ANTHROPIC_API_KEY=sk-ant-project2-key
superagents
```

Or use `.env` files in each project.

## Troubleshooting

### Variable Not Found

Problem: `echo $ANTHROPIC_API_KEY` shows nothing.

Solution:

1. Check spelling: `ANTHROPIC_API_KEY` (all caps, underscores)
2. Re-export: `export ANTHROPIC_API_KEY=sk-ant-...`
3. Restart terminal after editing shell config
4. Verify shell config file: `cat ~/.zshrc | grep ANTHROPIC`

### Variable Set But SuperAgents Doesn't See It

Problem: Variable is set, but SuperAgents reports "not set".

Solution:

1. Use `export` (not just assignment):
   ```bash
   # Wrong
   ANTHROPIC_API_KEY=sk-ant-key

   # Right
   export ANTHROPIC_API_KEY=sk-ant-key
   ```

2. Check for typos in variable name

3. Try verbose mode:
   ```bash
   superagents --verbose --dry-run
   ```

### Shell Config Not Loading

Problem: Set in `.zshrc` but not available in terminal.

Solution:

1. Reload config:
   ```bash
   source ~/.zshrc
   ```

2. Check file was saved:
   ```bash
   cat ~/.zshrc | tail
   ```

3. Verify you're editing correct file:
   - zsh: `~/.zshrc`
   - bash: `~/.bashrc` or `~/.bash_profile`
   - fish: `~/.config/fish/config.fish`

4. Restart terminal

### API Key Invalid

Problem: Key is set but authentication fails.

Solution:

1. Verify key format (starts with `sk-ant-`)
2. Check for extra spaces or quotes:
   ```bash
   # Wrong
   export ANTHROPIC_API_KEY=" sk-ant-key "

   # Right
   export ANTHROPIC_API_KEY=sk-ant-key
   ```

3. Test key with curl:
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-3-haiku-20240307","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'
   ```

4. Generate new key if needed

## Platform-Specific Notes

### macOS

Default shell is zsh. Edit `~/.zshrc`:

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key
```

Reload:

```bash
source ~/.zshrc
```

### Linux

Shell varies (bash, zsh, etc.). Check with:

```bash
echo $SHELL
```

Edit corresponding config:
- bash: `~/.bashrc`
- zsh: `~/.zshrc`

### Windows (WSL)

Use Linux instructions above (WSL runs bash/zsh).

### Windows (PowerShell)

Set environment variable:

```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-your-key"
```

Or set permanently:

```powershell
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', 'sk-ant-your-key', 'User')
```

## Next Steps

- [Authentication Setup](../getting-started/authentication.md) - Configure API access
- [CLI Options](cli-options.md) - Command-line flags
- [Exit Codes](exit-codes.md) - Script exit codes
