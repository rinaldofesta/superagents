# Export and Import Commands

Share SuperAgents configurations with your team using export and import.

## Export Configuration

Export your `.claude/` configuration to a ZIP file:

```bash
superagents export [output]
```

If `output` is omitted, defaults to `superagents-config.zip`.

## Import Configuration

Import a configuration from a ZIP file:

```bash
superagents import <source> [options]
```

## Export Command

### Basic Export

Export to default filename:

```bash
superagents export
```

Creates `superagents-config.zip` in current directory.

### Export with Custom Name

```bash
superagents export my-project-config.zip
```

Creates `my-project-config.zip`.

### Export to Specific Directory

```bash
superagents export ~/shared/team-config.zip
```

Exports to `~/shared/`.

### What Gets Exported

The ZIP file contains:

```
superagents-config.zip
├── settings.json          # Configuration metadata
├── CLAUDE.md              # Project context
├── agents/
│   ├── backend-engineer.md
│   └── ...
└── skills/
    ├── typescript.md
    └── ...
```

All files from `.claude/` plus `CLAUDE.md` from project root.

### Example Export

```bash
cd my-project
superagents export team-config.zip
```

```
⠋ Exporting configuration...
✓ Exported to team-config.zip

Contents:
  settings.json
  CLAUDE.md
  4 agents
  5 skills

Share this file with your team:
  superagents import team-config.zip
```

## Import Command

### Basic Import

Import from ZIP file:

```bash
superagents import config.zip
```

SuperAgents prompts before overwriting existing files.

### Import Options

| Option | Description |
|--------|-------------|
| `--force` | Overwrite existing configuration without prompting |
| `--preview` | Show contents without importing |

### Preview Before Import

See what's in the ZIP without importing:

```bash
superagents import config.zip --preview
```

```
Preview: config.zip

Contents:
  settings.json
  CLAUDE.md
  Agents (4):
    - backend-engineer
    - api-designer
    - testing-specialist
    - security-analyst
  Skills (5):
    - typescript
    - nodejs
    - express
    - prisma
    - vitest

Generated with: SuperAgents v1.3.1
Goal: Build a REST API with authentication

Import this configuration?
  Run: superagents import config.zip
```

### Import with Confirmation

Default behavior prompts before overwriting:

```bash
superagents import team-config.zip
```

```
? Configuration exists at .claude/
  Overwrite existing configuration?

  Current: 2 agents, 3 skills
  Importing: 4 agents, 5 skills

  ○ Yes, overwrite
  ● No, cancel
```

### Force Import

Skip confirmation and overwrite:

```bash
superagents import config.zip --force
```

```
⠋ Importing configuration...
✓ Imported from config.zip

Imported:
  4 agents
  5 skills
  settings.json
  CLAUDE.md

Location: .claude/
```

### What Gets Imported

Import creates/overwrites:

```
your-project/
├── CLAUDE.md              # Overwrites if exists
└── .claude/
    ├── settings.json      # Overwrites if exists
    ├── agents/            # Replaces all agents
    │   └── ...
    ├── skills/            # Replaces all skills
    │   └── ...
    └── hooks/
        └── skill-loader.sh
```

Existing agents and skills are removed. Only imported items remain.

## Common Workflows

### Share Configuration with Team

Team lead exports configuration:

```bash
cd company-project
superagents
# Configure with company standards

superagents export company-config.zip
# Share via Slack, email, or Git
```

Team members import:

```bash
cd company-project
superagents import company-config.zip
```

Everyone has identical configuration.

### Backup Before Experiment

Before trying new configuration:

```bash
superagents export backup-$(date +%Y%m%d).zip
superagents --update
# Make changes
```

Restore if needed:

```bash
superagents import backup-20240115.zip --force
```

### Migrate to New Project

Copy configuration from old project to new:

```bash
cd old-project
superagents export old-config.zip

cd ../new-project
superagents import ../old-project/old-config.zip
```

### Store in Version Control

Some teams store configurations in Git:

```bash
# Export
superagents export configs/superagents-config.zip

# Commit
git add configs/superagents-config.zip
git commit -m "Add SuperAgents configuration"
git push

# Team members
git pull
superagents import configs/superagents-config.zip
```

Note: Alternatively, commit `.claude/` directly instead of ZIP.

### Template for New Projects

Create a starter configuration:

```bash
# Configure once
cd template-project
superagents
# Select standard agents/skills

# Export as template
superagents export starter-template.zip

# Use for new projects
cd new-project-1
superagents import starter-template.zip

cd new-project-2
superagents import starter-template.zip
```

## Export/Import vs Direct Commit

Two approaches to share configurations:

### Approach 1: Export/Import

```bash
# Export
superagents export config.zip

# Share ZIP file
# Import on another machine
superagents import config.zip
```

**Pros:**
- Single file to share
- Easy to email or Slack
- Clear versioning (filename)

**Cons:**
- Extra step (export/import)
- Not in version control history

### Approach 2: Direct Commit

```bash
# Commit .claude/ directly
git add .claude/ CLAUDE.md
git commit -m "Add SuperAgents config"
git push

# Team members pull
git pull
```

**Pros:**
- Version control history
- Automatic with Git pull
- No export/import step

**Cons:**
- Multiple files to track
- Merge conflicts possible

Choose based on team workflow.

## Validation

### Import Validation

SuperAgents validates imported ZIP:

**Structure Check:**
- Contains settings.json
- Valid JSON format
- Contains agents/ and skills/ directories

**Version Check:**
- Compatible SuperAgents version
- Warns if version mismatch

**Content Check:**
- Agent/skill files are valid Markdown
- Frontmatter is correct

Invalid imports are rejected:

```bash
superagents import broken-config.zip
```

```
✗ Import failed: Invalid settings.json
  Missing required field 'version'
```

### Export Validation

Export validates before creating ZIP:

- `.claude/` directory exists
- settings.json is valid
- At least one agent or skill exists

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (invalid file, validation failed) |
| 2 | Cancelled (user cancelled overwrite prompt) |

Use for scripting:

```bash
if superagents import config.zip; then
  echo "Import successful"
else
  echo "Import failed"
  exit 1
fi
```

## Examples

### Example 1: Onboarding New Developer

```bash
# Senior developer exports standard config
cd company-api
superagents export standard-api-config.zip

# New developer imports
cd their-fork
superagents import standard-api-config.zip
```

### Example 2: Conference Setup

Export configuration for talk/workshop:

```bash
cd demo-project
superagents
# Configure for demo

superagents export demo-config.zip

# At conference
cd fresh-clone
superagents import demo-config.zip
```

### Example 3: A/B Test Configurations

Test different agent combinations:

```bash
# Configuration A
superagents
# Select agents 1, 2, 3
superagents export config-a.zip

# Configuration B
superagents --update
# Change to agents 4, 5, 6
superagents export config-b.zip

# Test A
superagents import config-a.zip --force

# Test B
superagents import config-b.zip --force
```

### Example 4: Automated Setup Script

```bash
#!/bin/bash

# Setup script for new projects
git clone https://github.com/company/project.git
cd project
npm install
superagents import https://company.com/standard-config.zip --force
npm run dev
```

## Troubleshooting

### "File not found"

Problem: Import file doesn't exist.

Solution:
```bash
# Check file path
ls -l config.zip

# Use absolute path
superagents import /full/path/to/config.zip
```

### "Invalid ZIP file"

Problem: File is corrupted or not a ZIP.

Solution:
1. Re-export from source
2. Verify file integrity
3. Try unzipping manually: `unzip -t config.zip`

### "Version mismatch warning"

Problem: Config exported with different SuperAgents version.

```
⚠ Configuration was exported with v1.2.0
  Current version: v1.3.1
```

Solution: Usually safe to continue. SuperAgents handles migration.

### "Permission denied" on Import

Problem: Cannot write to `.claude/`.

Solution:
```bash
# Check permissions
ls -la .claude/

# Remove and retry
rm -rf .claude/
superagents import config.zip
```

### Preview Shows Unexpected Content

Problem: ZIP contains different configuration than expected.

Solution: Preview before importing:

```bash
superagents import config.zip --preview
```

Verify contents before proceeding.

## Next Steps

- [Update Command](update.md) - Modify imported configuration
- [Templates Command](templates.md) - Share individual templates
- [Settings Configuration](../configuration/settings.md) - Understand settings.json
