# CLI Options Reference

Complete reference for all SuperAgents command-line options.

## Main Command

```bash
superagents [options]
```

### Global Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--dry-run` | - | Preview without API calls or writing files | `false` |
| `--verbose` | `-v` | Show detailed output | `false` |
| `--update` | `-u` | Update existing configuration | `false` |
| `--version` | - | Show version number | - |
| `--help` | `-h` | Show help text | - |

### Examples

```bash
# Basic generation
superagents

# Preview mode
superagents --dry-run

# Verbose output
superagents --verbose
superagents -v

# Update configuration
superagents --update
superagents -u

# Combined flags
superagents --update --verbose
superagents --dry-run -v

# Version
superagents --version

# Help
superagents --help
superagents -h
```

## Subcommands

### update

Update SuperAgents to latest version:

```bash
superagents update
```

No options. Checks npm for latest version and installs.

### cache

Manage cache:

```bash
superagents cache [options]
```

| Option | Description |
|--------|-------------|
| `--stats` | Show cache statistics |
| `--clear` | Clear all cached data |

Examples:

```bash
# View stats
superagents cache --stats

# Clear cache
superagents cache --clear
```

### templates

Manage templates:

```bash
superagents templates [options]
```

| Option | Description | Required |
|--------|-------------|----------|
| `--list` | List all available templates | No |
| `--export <name>` | Export template to file | No |
| `--import <file>` | Import template from file | No |
| `--delete <name>` | Delete custom template | No |
| `--type <type>` | Template type: `agent` or `skill` | For import/delete/export skill |
| `--output <file>` | Output filename for export | No |

Examples:

```bash
# List templates
superagents templates --list

# Export agent (default type)
superagents templates --export backend-engineer

# Export skill
superagents templates --export typescript --type skill

# Export with custom output
superagents templates --export api-designer --output my-designer.md

# Import agent
superagents templates --import my-agent.md --type agent

# Import skill
superagents templates --import my-skill.md --type skill

# Delete custom template
superagents templates --delete my-agent --type agent
```

### export

Export configuration to ZIP:

```bash
superagents export [output]
```

| Argument | Description | Required | Default |
|----------|-------------|----------|---------|
| `output` | Output ZIP filename | No | `superagents-config.zip` |

Examples:

```bash
# Default filename
superagents export

# Custom filename
superagents export my-config.zip

# Full path
superagents export ~/shared/config.zip
```

### import

Import configuration from ZIP:

```bash
superagents import <source> [options]
```

| Argument | Description | Required |
|----------|-------------|----------|
| `source` | Input ZIP filename | Yes |

| Option | Description | Default |
|--------|-------------|---------|
| `--force` | Overwrite without confirmation | `false` |
| `--preview` | Show contents without importing | `false` |

Examples:

```bash
# Basic import (with confirmation)
superagents import config.zip

# Preview contents
superagents import config.zip --preview

# Force import (skip confirmation)
superagents import config.zip --force
```

## Option Details

### --dry-run

Preview mode. Shows what would happen without making changes.

**Behavior:**
- Analyzes codebase (uses cache if available)
- Shows recommendations
- Displays template vs. API generation
- Estimates token usage and cost
- Does not call API
- Does not write files

**Use cases:**
- Experiment with different goals
- Estimate costs before generating
- Verify recommendations
- Debug codebase detection

**Example output:**

```bash
superagents --dry-run
```

```
? What are you building?
> A REST API with authentication

Codebase Analysis:
  Project Type: node
  Framework: Express
  Language: TypeScript
  Dependencies: express, prisma, jsonwebtoken

Recommendations:
  Agents (4):
    ☑ backend-engineer (Template)
    ☑ api-designer (Template)
    ☑ security-analyst (API)
    ☑ testing-specialist (Template)

  Skills (4):
    ☑ typescript (Template)
    ☑ nodejs (Template)
    ☑ express (Template)
    ☑ prisma (Template)

Generation Plan:
  Templates: 7 items (no API calls)
  API Generation: 1 item (security-analyst)

Estimated Tokens:
  Input: 2,000 tokens
  Output: 1,500 tokens
  Total: 3,500 tokens

Estimated Cost: $0.02

Dry run complete. No files were written.
Run without --dry-run to generate.
```

### --verbose (-v)

Detailed output during execution.

**Shows:**
- Detailed analysis results
- Recommendation scoring
- Cache hit/miss for each item
- API request/response summaries
- Token usage per API call
- Generation timing

**Use cases:**
- Debug unexpected recommendations
- Understand cache behavior
- Monitor API usage
- Troubleshoot issues

**Example output:**

```bash
superagents --verbose
```

```
[DEBUG] Starting codebase analysis...
[DEBUG] Found package.json at /path/to/project/package.json
[DEBUG] Detected dependencies: express, prisma, typescript, vitest
[DEBUG] Analyzing project structure...
[DEBUG] Found 42 TypeScript files in src/
[DEBUG] Analysis complete (cached: false, time: 8.2s)

[DEBUG] Building recommendations...
[DEBUG] Goal keywords: api, rest, authentication
[DEBUG] Scoring agents:
  - backend-engineer: 0.92 (goal: 0.8, framework: 1.0, patterns: 0.9)
  - api-designer: 0.88 (goal: 0.9, framework: 0.85, patterns: 0.8)
  - security-analyst: 0.75 (goal: 0.9, framework: 0.6, patterns: 0.5)

[DEBUG] Generating backend-engineer...
[DEBUG] Cache check: MISS (key: abc123...)
[DEBUG] Using local template
[DEBUG] Generated in 0.05s

[DEBUG] Total generation time: 12.3s
[DEBUG] API calls: 1
[DEBUG] Cache hits: 3
[DEBUG] Cache misses: 1
```

### --update (-u)

Modify existing configuration incrementally.

**Behavior:**
- Loads current settings.json
- Presents update options
- Generates only changed items
- Preserves existing agents/skills
- Updates settings.json

**Use cases:**
- Add/remove agents or skills
- Regenerate specific items
- Update after dependency changes
- Refresh with new templates

**Interactive menu:**

```
? What would you like to update?
  ○ Add agents
  ○ Remove agents
  ○ Add skills
  ○ Remove skills
  ○ Regenerate CLAUDE.md
  ○ Regenerate specific items
  ○ Regenerate everything
  ○ Cancel
```

See [Update Command](../commands/update.md) for details.

### --version

Show SuperAgents version:

```bash
superagents --version
```

```
1.3.1
```

### --help (-h)

Show help text:

```bash
superagents --help
```

```
Usage: superagents [options] [command]

Context-aware Claude Code configuration generator

Options:
  --dry-run             Preview without API calls
  -v, --verbose         Show detailed output
  -u, --update          Update existing configuration
  --version             Show version number
  -h, --help            Show help

Commands:
  update                Update SuperAgents to latest version
  cache [options]       Manage cache
  templates [options]   Manage templates
  export [output]       Export configuration to ZIP
  import <source>       Import configuration from ZIP

Examples:
  superagents                        Generate configuration
  superagents --dry-run              Preview generation
  superagents --update               Update existing config
  superagents cache --stats          View cache statistics
  superagents templates --list       List templates
  superagents export config.zip      Export configuration
  superagents import config.zip      Import configuration

Documentation: https://superagents.playnew.com/docs
```

## Flag Combinations

### Valid Combinations

```bash
# Dry run + verbose
superagents --dry-run --verbose

# Update + verbose
superagents --update --verbose

# Update + dry run
superagents --update --dry-run
```

### Invalid Combinations

Some combinations don't make sense:

```bash
# Cannot export and import simultaneously
superagents export output.zip import input.zip  # Error

# Cannot use --update with subcommands
superagents update --update  # Error
```

## Environment Variables

See [Environment Variables Reference](environment-variables.md) for details.

## Exit Codes

See [Exit Codes Reference](exit-codes.md) for details.

## Shortcuts and Aliases

### Short Flags

| Long | Short | Command |
|------|-------|---------|
| `--verbose` | `-v` | All commands |
| `--update` | `-u` | Main command |
| `--help` | `-h` | All commands |

### Command Aliases

No built-in aliases. Create shell aliases if desired:

```bash
# In ~/.bashrc or ~/.zshrc
alias sa='superagents'
alias sad='superagents --dry-run'
alias sau='superagents --update'
alias sac='superagents cache'
```

Then use:

```bash
sa          # superagents
sad         # superagents --dry-run
sau         # superagents --update
sac --stats # superagents cache --stats
```

## Scripting

### Non-Interactive Mode

SuperAgents is interactive by default. For scripting:

```bash
# Use --dry-run for non-interactive preview
superagents --dry-run

# Or pipe answers (not supported yet)
# echo -e "api-key\nBuild a REST API\n\n\n" | superagents
```

Currently, SuperAgents requires interactive input. Scripting support planned for future version.

### Exit Code Handling

```bash
#!/bin/bash

if superagents --dry-run; then
  echo "Preview successful"
  superagents
else
  echo "Preview failed"
  exit 1
fi
```

### Checking Version in Scripts

```bash
#!/bin/bash

version=$(superagents --version)
if [[ "$version" < "1.3.0" ]]; then
  echo "SuperAgents version $version is too old"
  exit 1
fi
```

## Next Steps

- [Environment Variables](environment-variables.md) - Environment configuration
- [Exit Codes](exit-codes.md) - Exit code reference
- [Commands Documentation](../commands/generate.md) - Detailed command guides
