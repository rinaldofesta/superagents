# Templates Command

Manage agent and skill templates.

## List Templates

View all available templates:

```bash
superagents templates --list
```

Shows built-in and custom templates.

## Export Template

Export a template to a file:

```bash
superagents templates --export <name> [options]
```

Useful for:
- Creating custom templates based on built-ins
- Sharing templates with team
- Backup before customization

## Import Template

Add a custom template:

```bash
superagents templates --import <file> --type <agent|skill>
```

## Delete Template

Remove a custom template:

```bash
superagents templates --delete <name> --type <agent|skill>
```

Only custom templates can be deleted. Built-in templates are protected.

## Command Options

| Option | Description | Required |
|--------|-------------|----------|
| `--list` | List all templates | No |
| `--export <name>` | Export template by name | No |
| `--import <file>` | Import template from file | No |
| `--delete <name>` | Delete custom template | No |
| `--type <type>` | Template type: `agent` or `skill` | For import/delete |
| `--output <file>` | Output file for export | No (default: `<name>.md`) |

## List Templates Details

### Example Output

```bash
superagents templates --list
```

```
Built-in Agents (15):
  backend-engineer          Clean Architecture & SOLID
  frontend-specialist       React Patterns
  code-reviewer             Code Review Practices
  debugger                  Systematic Debugging
  devops-specialist         Infrastructure Patterns
  security-analyst          Security Best Practices
  database-specialist       Data-Intensive Apps
  api-designer              API Design Principles
  testing-specialist        Test-Driven Development
  docs-writer               Documentation System
  performance-optimizer     Web Performance
  copywriter                Conversion Copywriting
  designer                  UI/UX Design
  architect                 Enterprise Patterns
  product-manager           Product Discovery

Custom Agents (2):
  internal-framework        Internal framework specialist
  api-tester                API testing patterns

Built-in Skills (16):
  typescript                TypeScript 5.x strict mode
  nodejs                    Node.js 20+ runtime
  react                     React 18+ patterns
  nextjs                    Next.js 14+ App Router
  vue                       Vue 3 Composition API
  tailwind                  Tailwind CSS utility-first
  prisma                    Prisma ORM patterns
  drizzle                   Drizzle ORM TypeScript
  express                   Express.js middleware
  supabase                  Supabase patterns
  vitest                    Vitest unit testing
  graphql                   GraphQL schema design
  docker                    Docker containerization
  python                    Python 3.11+ patterns
  fastapi                   FastAPI async patterns
  mcp                       Model Context Protocol

Custom Skills (1):
  internal-cli              Internal CLI framework
```

### Filtering by Type

Show only agents:

```bash
superagents templates --list --type agent
```

Show only skills:

```bash
superagents templates --list --type skill
```

## Export Template Details

### Basic Export

Export to current directory:

```bash
superagents templates --export backend-engineer
```

Creates `backend-engineer.md` in current directory.

### Export with Custom Name

```bash
superagents templates --export backend-engineer --output my-backend.md
```

Creates `my-backend.md`.

### Export Skill

```bash
superagents templates --export typescript --type skill
```

Creates `typescript.md`.

### Export to Specific Directory

```bash
superagents templates --export api-designer --output ~/templates/api-designer.md
```

Exports to `~/templates/`.

### Example Export Output

```bash
superagents templates --export backend-engineer
```

```
✓ Exported backend-engineer to backend-engineer.md

Edit this file to create a custom template, then import:
  superagents templates --import backend-engineer.md --type agent
```

## Import Template Details

### Basic Import

```bash
superagents templates --import my-agent.md --type agent
```

SuperAgents:
1. Validates template format
2. Checks for duplicate names
3. Copies to `~/.superagents/templates/agents/`

### Import from URL (Not Supported)

Import only works with local files. To import from URL:

```bash
curl -O https://example.com/template.md
superagents templates --import template.md --type agent
```

### Import Validation

SuperAgents validates:

**Frontmatter:**
- Required fields present
- Valid model name
- Unique template name

**Content:**
- Non-empty after frontmatter
- Valid Markdown syntax

Invalid templates are rejected:

```bash
superagents templates --import broken.md --type agent
```

```
✗ Import failed: Missing required field 'name' in frontmatter
```

### Successful Import

```bash
superagents templates --import custom-agent.md --type agent
```

```
✓ Imported custom-agent
  Location: ~/.superagents/templates/agents/custom-agent.md

Template is now available for use:
  superagents
```

## Delete Template Details

### Delete Custom Agent

```bash
superagents templates --delete custom-agent --type agent
```

```
? Delete custom agent 'custom-agent'?
  ● Yes
  ○ No

✓ Deleted custom-agent
```

### Delete Custom Skill

```bash
superagents templates --delete internal-cli --type skill
```

### Cannot Delete Built-in Templates

```bash
superagents templates --delete backend-engineer --type agent
```

```
✗ Cannot delete built-in template 'backend-engineer'
  Only custom templates can be deleted.
```

### Confirmation Prompt

All delete operations require confirmation:

```
? Delete custom agent 'my-agent'?
  This action cannot be undone.

  ○ Yes, delete
  ● No, keep it
```

## Common Workflows

### Create Custom Agent Based on Built-in

```bash
# Export built-in template
superagents templates --export backend-engineer

# Edit the file
vim backend-engineer.md

# Rename and modify frontmatter
mv backend-engineer.md my-backend.md

# Import as custom template
superagents templates --import my-backend.md --type agent
```

### Share Custom Template with Team

```bash
# Export custom template
superagents templates --export my-agent --type agent

# Share file
# Team member imports:
superagents templates --import my-agent.md --type agent
```

### Backup Templates Before Update

```bash
# Export all custom templates
mkdir ~/superagents-backup
superagents templates --export custom-agent --output ~/superagents-backup/custom-agent.md
superagents templates --export internal-cli --type skill --output ~/superagents-backup/internal-cli.md

# Update SuperAgents
superagents update

# Reimport if needed
superagents templates --import ~/superagents-backup/custom-agent.md --type agent
```

### Replace Custom Template

```bash
# Delete existing
superagents templates --delete my-agent --type agent

# Import new version
superagents templates --import my-agent-v2.md --type agent
```

## Template Storage

Custom templates are stored in:

```
~/.superagents/
└── templates/
    ├── agents/
    │   └── custom-agent.md
    └── skills/
        └── custom-skill.md
```

Built-in templates are bundled with SuperAgents (not in home directory).

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (validation failed, file not found, etc.) |
| 2 | Cancelled (user cancelled delete prompt) |

## Examples

### Example 1: Create Custom React Skill

```bash
# Export built-in React skill
superagents templates --export react --type skill

# Edit for your company's React patterns
vim react.md

# Rename
mv react.md company-react.md

# Import
superagents templates --import company-react.md --type skill

# Verify
superagents templates --list --type skill
```

### Example 2: Share Template via Git

```bash
# Developer 1: Export
superagents templates --export my-agent --type agent
git add my-agent.md
git commit -m "Add custom agent template"
git push

# Developer 2: Import
git pull
superagents templates --import my-agent.md --type agent
```

### Example 3: Manage Multiple Custom Templates

```bash
# List all templates
superagents templates --list

# Export custom ones for backup
superagents templates --export custom-1 --output backup/custom-1.md
superagents templates --export custom-2 --output backup/custom-2.md

# Delete to clean up
superagents templates --delete custom-1 --type agent
superagents templates --delete custom-2 --type agent

# Reimport when needed
superagents templates --import backup/custom-1.md --type agent
```

## Troubleshooting

### "Template not found"

Problem: Trying to export non-existent template.

Solution:
```bash
# List available templates
superagents templates --list

# Export correct name
superagents templates --export <correct-name>
```

### "Duplicate template name"

Problem: Importing template with same name as existing.

Solution:
```bash
# Delete existing first
superagents templates --delete <name> --type <type>

# Then import
superagents templates --import <file> --type <type>

# Or rename in frontmatter before importing
```

### "Invalid frontmatter"

Problem: Template file has incorrect frontmatter format.

Solution: Fix frontmatter in the template file:

```markdown
---
name: my-template
description: Description here
expert: Source
model: claude-sonnet-4-5
---

Content here...
```

Ensure all required fields are present and model is valid.

### "Permission denied" on Import

Problem: Cannot write to `~/.superagents/templates/`.

Solution:
```bash
# Check permissions
ls -la ~/.superagents/

# Create directory if needed
mkdir -p ~/.superagents/templates/agents/
mkdir -p ~/.superagents/templates/skills/

# Retry import
superagents templates --import <file> --type <type>
```

## Next Steps

- [Custom Templates Guide](../configuration/custom-templates.md) - Template creation details
- [Agents Concept](../concepts/agents.md) - How agents work
- [Skills Concept](../concepts/skills.md) - How skills work
- [Export/Import](export-import.md) - Share full configurations
