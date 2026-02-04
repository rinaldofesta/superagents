# Exit Codes Reference

SuperAgents uses standard exit codes for scripting and automation.

## Exit Code Table

| Code | Name | Description | Example Cause |
|------|------|-------------|---------------|
| 0 | Success | Command completed successfully | Configuration generated |
| 1 | General Error | Command failed | API error, validation failed |
| 2 | User Cancelled | User cancelled operation | Cancelled confirmation prompt |

## Exit Code 0: Success

Command completed successfully.

### Examples

**Successful generation:**

```bash
superagents
# Exit code: 0
```

**Successful dry run:**

```bash
superagents --dry-run
# Exit code: 0
```

**Successful cache clear:**

```bash
superagents cache --clear
# Confirm: Yes
# Exit code: 0
```

**Successful import:**

```bash
superagents import config.zip --force
# Exit code: 0
```

### Checking Success

```bash
superagents
if [ $? -eq 0 ]; then
  echo "Configuration generated successfully"
fi
```

Or:

```bash
if superagents; then
  echo "Success"
else
  echo "Failed"
fi
```

## Exit Code 1: General Error

Command encountered an error and could not complete.

### Common Causes

**API authentication failed:**

```bash
superagents
# No ANTHROPIC_API_KEY set
# Output: Error: ANTHROPIC_API_KEY environment variable not set
# Exit code: 1
```

**Invalid configuration:**

```bash
superagents import broken-config.zip
# Output: Error: Invalid settings.json
# Exit code: 1
```

**File not found:**

```bash
superagents import nonexistent.zip
# Output: Error: File not found: nonexistent.zip
# Exit code: 1
```

**API error:**

```bash
superagents
# API rate limit exceeded
# Output: Error: Rate limit exceeded
# Exit code: 1
```

**Template validation failed:**

```bash
superagents templates --import invalid.md --type agent
# Output: Error: Missing required field 'name' in frontmatter
# Exit code: 1
```

**Permission denied:**

```bash
superagents cache --clear
# Cannot delete cache files
# Output: Error: Permission denied
# Exit code: 1
```

### Error Handling

```bash
superagents
exit_code=$?

if [ $exit_code -eq 1 ]; then
  echo "Error occurred. Check output above."
  exit 1
fi
```

With error message capture:

```bash
output=$(superagents 2>&1)
exit_code=$?

if [ $exit_code -eq 1 ]; then
  echo "Generation failed:"
  echo "$output"
  exit 1
fi
```

## Exit Code 2: User Cancelled

User cancelled operation via interactive prompt.

### Examples

**Cancelled import:**

```bash
superagents import config.zip
# Prompt: Overwrite existing configuration?
# User selects: No
# Exit code: 2
```

**Cancelled cache clear:**

```bash
superagents cache --clear
# Prompt: Clear all cached data?
# User selects: No
# Exit code: 2
```

**Cancelled template delete:**

```bash
superagents templates --delete my-agent --type agent
# Prompt: Delete custom agent 'my-agent'?
# User selects: No
# Exit code: 2
```

**User pressed Ctrl+C:**

```bash
superagents
# During prompts, user presses Ctrl+C
# Exit code: 2
```

### Handling Cancellation

```bash
superagents import config.zip
exit_code=$?

if [ $exit_code -eq 2 ]; then
  echo "Import cancelled by user"
  # Don't treat as error
  exit 0
fi
```

Or distinguish from errors:

```bash
superagents
exit_code=$?

case $exit_code in
  0)
    echo "Success"
    ;;
  1)
    echo "Error occurred"
    exit 1
    ;;
  2)
    echo "Cancelled by user"
    exit 0  # Not an error
    ;;
esac
```

## Scripting Examples

### Basic Error Handling

```bash
#!/bin/bash

cd my-project

if ! superagents; then
  echo "SuperAgents failed"
  exit 1
fi

echo "Configuration generated"
```

### Detailed Error Handling

```bash
#!/bin/bash

superagents
exit_code=$?

case $exit_code in
  0)
    echo "✓ Configuration generated successfully"
    git add .claude/ CLAUDE.md
    git commit -m "Update SuperAgents configuration"
    ;;
  1)
    echo "✗ Generation failed. Check error above."
    exit 1
    ;;
  2)
    echo "⚠ Generation cancelled by user"
    # Don't fail CI
    ;;
esac
```

### Retry on Error

```bash
#!/bin/bash

max_retries=3
attempt=1

while [ $attempt -le $max_retries ]; do
  echo "Attempt $attempt of $max_retries..."

  if superagents; then
    echo "Success on attempt $attempt"
    exit 0
  fi

  exit_code=$?

  if [ $exit_code -eq 2 ]; then
    echo "Cancelled by user, not retrying"
    exit 0
  fi

  echo "Failed, retrying..."
  attempt=$((attempt + 1))
  sleep 5
done

echo "Failed after $max_retries attempts"
exit 1
```

### CI/CD Integration

```bash
#!/bin/bash
# CI script to verify SuperAgents configuration is up-to-date

# Dry run to check current config matches codebase
superagents --dry-run > /tmp/dry-run-output.txt
exit_code=$?

if [ $exit_code -ne 0 ]; then
  echo "Dry run failed"
  exit 1
fi

# Check if recommendations changed
if grep -q "Would generate" /tmp/dry-run-output.txt; then
  echo "Configuration is out of date"
  echo "Run: superagents --update"
  exit 1
fi

echo "Configuration is up-to-date"
exit 0
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check if .claude/ is being committed
if git diff --cached --name-only | grep -q "^\.claude/"; then
  echo "Verifying SuperAgents configuration..."

  superagents --dry-run --verbose > /dev/null
  exit_code=$?

  if [ $exit_code -eq 1 ]; then
    echo "Configuration validation failed"
    echo "Run: superagents --update"
    exit 1
  fi

  echo "Configuration verified"
fi

exit 0
```

## Command-Specific Exit Codes

### Main Command

```bash
superagents [options]
```

| Exit Code | Meaning |
|-----------|---------|
| 0 | Configuration generated |
| 1 | Generation failed (API error, validation, etc.) |
| 2 | User cancelled |

### update (Self-Update)

```bash
superagents update
```

| Exit Code | Meaning |
|-----------|---------|
| 0 | Update successful or already up-to-date |
| 1 | Update failed (network error, permission denied) |

### cache

```bash
superagents cache [options]
```

| Exit Code | Meaning |
|-----------|---------|
| 0 | Operation successful |
| 1 | Operation failed (permission denied, etc.) |
| 2 | User cancelled clear prompt |

### templates

```bash
superagents templates [options]
```

| Exit Code | Meaning |
|-----------|---------|
| 0 | Operation successful |
| 1 | Operation failed (validation, file not found, etc.) |
| 2 | User cancelled delete prompt |

### export

```bash
superagents export [output]
```

| Exit Code | Meaning |
|-----------|---------|
| 0 | Export successful |
| 1 | Export failed (no configuration, write error, etc.) |

### import

```bash
superagents import <source> [options]
```

| Exit Code | Meaning |
|-----------|---------|
| 0 | Import successful |
| 1 | Import failed (invalid ZIP, validation error, etc.) |
| 2 | User cancelled overwrite prompt |

## Testing Exit Codes

### Manual Testing

```bash
# Test success
superagents --dry-run
echo "Exit code: $?"

# Test error
ANTHROPIC_API_KEY= superagents
echo "Exit code: $?"

# Test cancellation
superagents import config.zip
# Press No
echo "Exit code: $?"
```

### Automated Testing

```bash
#!/bin/bash

test_success() {
  superagents --dry-run > /dev/null 2>&1
  [ $? -eq 0 ] && echo "✓ Success test passed" || echo "✗ Success test failed"
}

test_error() {
  ANTHROPIC_API_KEY= superagents > /dev/null 2>&1
  [ $? -eq 1 ] && echo "✓ Error test passed" || echo "✗ Error test failed"
}

test_success
test_error
```

## Best Practices

### Always Check Exit Codes

```bash
# Bad: ignores errors
superagents
do_next_thing

# Good: checks exit code
if superagents; then
  do_next_thing
else
  echo "Failed"
  exit 1
fi
```

### Distinguish User Cancellation from Errors

```bash
superagents import config.zip
exit_code=$?

if [ $exit_code -eq 1 ]; then
  echo "Import failed"
  exit 1
elif [ $exit_code -eq 2 ]; then
  echo "Import cancelled, continuing..."
fi
```

### Log Exit Codes

```bash
superagents
exit_code=$?
echo "SuperAgents exited with code $exit_code" >> deployment.log

if [ $exit_code -ne 0 ]; then
  exit $exit_code
fi
```

### Set -e for Fail-Fast Scripts

```bash
#!/bin/bash
set -e  # Exit on first error

superagents  # Will exit script if this fails
npm test
npm run build
```

## Next Steps

- [CLI Options](cli-options.md) - Command-line flags reference
- [Environment Variables](environment-variables.md) - Environment configuration
- [Commands Documentation](../commands/generate.md) - Detailed command guides
