# Update Command

Update SuperAgents to the latest version or modify your existing configuration.

## Self-Update

Update SuperAgents itself:

```bash
superagents update
```

This command:
1. Checks for latest version on npm
2. Downloads and installs update
3. Verifies installation

## Configuration Update

Modify an existing configuration:

```bash
superagents --update
```

Or:

```bash
superagents -u
```

This updates your project's `.claude/` configuration incrementally without regenerating everything.

## Update Options

During configuration update, choose from:

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

### Add Agents

Add new agents to existing configuration:

```
? Select agents to add:
  ⬚ backend-engineer
  ☑ testing-specialist
  ⬚ security-analyst
  ☑ performance-optimizer
```

SuperAgents generates only the new agents. Existing agents are unchanged.

### Remove Agents

Remove agents from configuration:

```
? Select agents to remove:
  ☑ backend-engineer (currently installed)
  ⬚ api-designer (currently installed)
  ⬚ frontend-specialist (currently installed)
```

Files are deleted from `.claude/agents/`.

### Add Skills

Add new skills:

```
? Select skills to add:
  ⬚ typescript (already installed)
  ☑ docker
  ☑ graphql
  ⬚ react (already installed)
```

### Remove Skills

Remove skills:

```
? Select skills to remove:
  ☑ vitest (currently installed)
  ⬚ typescript (currently installed)
  ⬚ nodejs (currently installed)
```

Files are deleted from `.claude/skills/`.

### Regenerate CLAUDE.md

Regenerate only CLAUDE.md:

```
? Regenerate CLAUDE.md?
  ● Yes
  ○ No

Warning: This will overwrite manual edits to CLAUDE.md
```

Useful after adding/removing agents or skills to update the Skill Usage Guide.

### Regenerate Specific Items

Regenerate selected agents or skills:

```
? Select items to regenerate:
  ☑ backend-engineer (agent)
  ⬚ api-designer (agent)
  ☑ typescript (skill)
  ⬚ nodejs (skill)
```

Regeneration uses:
- Latest templates (if available)
- Current project context
- Cached generation (if unchanged)

### Regenerate Everything

Regenerate all agents, skills, and CLAUDE.md:

```
? Regenerate everything?
  ● Yes (may take 30-60 seconds)
  ○ No
```

This is equivalent to deleting `.claude/` and running `superagents` again.

## Common Workflows

### Add Testing Support

Existing config without testing:

```bash
superagents --update
```

Select:
1. "Add agents" → testing-specialist
2. "Add skills" → vitest
3. "Regenerate CLAUDE.md"

### Remove Unused Agents

Clean up unnecessary agents:

```bash
superagents --update
```

Select "Remove agents" and deselect unused ones.

### Update After Dependencies Change

After adding new dependencies (e.g., installed Docker):

```bash
npm install dockerode
superagents --update
```

Select "Add skills" → docker

### Refresh Content with New Templates

After SuperAgents update with improved templates:

```bash
superagents update          # Update SuperAgents itself
cd your-project
superagents --update
```

Select "Regenerate everything" to use new templates.

## Update Behavior

### Cache Usage

Update command respects cache:

- **Add agents/skills**: Generates only new items (may use cache)
- **Remove items**: No generation needed
- **Regenerate**: Checks cache, generates if cache miss
- **Regenerate all**: Forces cache invalidation

### settings.json Update

SuperAgents updates `settings.json` after each modification:

```json
{
  "version": "1.3.1",
  "generatedAt": "2024-01-15T14:30:00.000Z",
  "goal": "Build a task management API",
  "agents": ["backend-engineer", "testing-specialist"],
  "skills": ["typescript", "nodejs", "vitest"]
}
```

`generatedAt` timestamp updates on every modification.

### CLAUDE.md Preservation

When NOT regenerating CLAUDE.md, manual edits are preserved.

When regenerating CLAUDE.md, all content is replaced.

## Version Compatibility

When running `--update` on old configuration:

```
⚠ Configuration was generated with SuperAgents v1.2.0
  Current version: v1.3.1

? Update configuration to v1.3.1?
  ● Yes (recommended)
  ○ No (keep as-is)
```

Choosing "Yes" updates `settings.json` version and applies any schema migrations.

## Dry Run with Update

Preview an update without making changes:

```bash
superagents --update --dry-run
```

Shows:
- Current configuration
- What would change
- Estimated token usage

No files are modified.

## Verbose Update

See detailed update process:

```bash
superagents --update --verbose
```

Displays:
- Current settings
- Items to add/remove
- Generation details
- Cache hits/misses

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Success | Configuration updated |
| 1 | Error | Check error message |
| 2 | Cancelled | User cancelled update |

## Examples

### Example 1: Add Security Agent

```bash
cd my-api
superagents --update
```

Interactive:
```
? What would you like to update?
  ● Add agents

? Select agents to add:
  ☑ security-analyst

⠋ Generating security-analyst...
✓ Generated security-analyst
✓ Updated settings.json

Success! Added 1 agent.
```

### Example 2: Remove and Add Skills

```bash
superagents --update
```

Interactive:
```
? What would you like to update?
  ● Remove skills

? Select skills to remove:
  ☑ vue

✓ Removed vue

? What would you like to update?
  ● Add skills

? Select skills to add:
  ☑ react

⠋ Generating react...
✓ Generated react (template)
✓ Updated settings.json

Success! Removed 1 skill, added 1 skill.
```

### Example 3: Regenerate After Manual Edits

You edited an agent file and want to restore default:

```bash
superagents --update
```

Interactive:
```
? What would you like to update?
  ● Regenerate specific items

? Select items to regenerate:
  ☑ backend-engineer (agent)

⠋ Regenerating backend-engineer...
✓ Regenerated backend-engineer

Success! Regenerated 1 item.
```

## Self-Update Details

The `superagents update` command (without `--update` flag) updates SuperAgents itself.

### Update Process

```bash
superagents update
```

Steps:
1. Fetch latest version from npm registry
2. Compare with current version
3. Download if newer version available
4. Install to npm global directory
5. Verify installation

### Check for Updates

See if an update is available without installing:

```bash
superagents --version
```

Shows current version. Compare with [npm](https://www.npmjs.com/package/superagents).

### Manual Update

Update via npm:

```bash
npm update -g superagents
```

Or reinstall:

```bash
npm install -g superagents
```

## Troubleshooting

### "No configuration found"

Problem: Running `--update` in a project without `.claude/`.

Solution: Run `superagents` (without `--update`) first to generate initial configuration.

### "Invalid settings.json"

Problem: settings.json is corrupted or malformed.

Solution:
```bash
rm .claude/settings.json
superagents --update
```

Select "Regenerate everything" to rebuild.

### Update Hangs

Problem: Update process doesn't complete.

Solution:
1. Press Ctrl+C to cancel
2. Try with `--verbose` flag
3. Check network connection
4. Verify API key if regenerating

### Permission Errors (Self-Update)

Problem: Cannot update global npm package.

Solution:
```bash
# Use sudo (Linux/macOS)
sudo npm update -g superagents

# Or change npm prefix (no sudo needed)
npm config set prefix '~/.npm-global'
npm update -g superagents
```

## Next Steps

- [Generate Command](generate.md) - Initial configuration generation
- [Cache Management](cache.md) - Clear cache before regeneration
- [Settings Configuration](../configuration/settings.md) - Understand settings.json
