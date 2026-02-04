# Settings Configuration

The settings.json file stores configuration metadata for your SuperAgents setup.

## File Location

```
your-project/
└── .claude/
    ├── settings.json     # Configuration metadata (here)
    ├── agents/
    └── skills/
```

## File Structure

settings.json contains:

```json
{
  "version": "1.3.1",
  "generatedAt": "2024-01-15T10:30:00.000Z",
  "goal": "Build a task management API with authentication",
  "codebase": {
    "projectType": "node",
    "framework": "Express",
    "language": "TypeScript",
    "dependencies": ["express", "prisma", "zod", "jsonwebtoken"]
  },
  "agents": [
    "backend-engineer",
    "api-designer",
    "testing-specialist",
    "security-analyst"
  ],
  "skills": [
    "typescript",
    "nodejs",
    "express",
    "prisma",
    "vitest"
  ]
}
```

## Fields

### version

SuperAgents version used to generate the configuration.

```json
{
  "version": "1.3.1"
}
```

Used to detect compatibility and prompt for updates.

### generatedAt

ISO 8601 timestamp of generation.

```json
{
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

Helps track configuration age.

### goal

Your project goal as entered during generation.

```json
{
  "goal": "Build a task management API with authentication"
}
```

Used during updates to maintain context.

### codebase

Detected codebase information.

```json
{
  "codebase": {
    "projectType": "node",
    "framework": "Express",
    "language": "TypeScript",
    "dependencies": ["express", "prisma", "zod"]
  }
}
```

**projectType**: `"node"`, `"python"`, `"web"`, `"fullstack"`
**framework**: Detected framework (React, Express, FastAPI, etc.)
**language**: Primary language (TypeScript, JavaScript, Python)
**dependencies**: Key dependencies detected

### agents

List of selected agent names.

```json
{
  "agents": [
    "backend-engineer",
    "api-designer",
    "testing-specialist"
  ]
}
```

These correspond to files in `.claude/agents/`.

### skills

List of selected skill names.

```json
{
  "skills": [
    "typescript",
    "nodejs",
    "express",
    "prisma"
  ]
}
```

These correspond to files in `.claude/skills/`.

## Manual Editing

You can manually edit settings.json, but be careful:

- Incorrect format breaks SuperAgents updates
- Changing `agents` or `skills` doesn't add/remove files
- Use `superagents --update` for safe modifications

### Adding an Agent Manually

Don't do this:

```json
{
  "agents": ["backend-engineer", "new-agent"]
}
```

Instead, use:

```bash
superagents --update
```

Select "Add agents" and choose from the list.

### Removing a Skill Manually

Don't do this:

```json
{
  "skills": ["typescript", "nodejs"]
}
```

Instead, use:

```bash
superagents --update
```

Select "Remove skills" and deselect unwanted items.

## Version Compatibility

SuperAgents checks settings.json version on update:

```bash
superagents --update
```

If `settings.version` doesn't match current SuperAgents:

```
⚠ Configuration was generated with SuperAgents v1.2.0
  Current version: v1.3.1

  Update recommended. Continue? (y/n)
```

Newer SuperAgents versions may have:
- New agents or skills
- Updated templates
- Different schema

## Regeneration

To regenerate settings.json:

```bash
superagents --update
```

Select "Regenerate configuration" when prompted.

This rewrites settings.json with current metadata.

## Backup

Before major changes, backup settings.json:

```bash
cp .claude/settings.json .claude/settings.json.backup
```

Or export entire configuration:

```bash
superagents export backup.zip
```

## Version Control

Should you commit settings.json?

**Optional**. Benefits of committing:
- Team members see configured agents/skills
- Track configuration changes over time
- Restore previous configurations

Benefits of ignoring:
- Each developer customizes their own setup
- No merge conflicts on updates

Example `.gitignore`:

```gitignore
# Commit settings, ignore agents/skills (generated)
.claude/agents/
.claude/skills/

# Or ignore everything in .claude/
.claude/
```

## Schema Validation

SuperAgents validates settings.json on read.

Required fields:
- `version` (string)
- `generatedAt` (ISO 8601 string)
- `goal` (string)
- `agents` (array of strings)
- `skills` (array of strings)

Optional fields:
- `codebase` (object)

Invalid settings.json triggers regeneration prompt.

## Migration

When upgrading SuperAgents versions, settings.json may need migration.

SuperAgents handles this automatically:

```bash
superagents --update
```

If schema changed, SuperAgents migrates settings.json to new format.

## Example Configurations

### Minimal Node.js API

```json
{
  "version": "1.3.1",
  "generatedAt": "2024-01-15T10:00:00.000Z",
  "goal": "Build a REST API",
  "codebase": {
    "projectType": "node",
    "framework": "Express",
    "language": "TypeScript"
  },
  "agents": ["backend-engineer", "api-designer"],
  "skills": ["typescript", "nodejs", "express"]
}
```

### Full-Stack React App

```json
{
  "version": "1.3.1",
  "generatedAt": "2024-01-15T11:00:00.000Z",
  "goal": "Build a task management app",
  "codebase": {
    "projectType": "fullstack",
    "framework": "Next.js",
    "language": "TypeScript",
    "dependencies": ["next", "react", "prisma", "tailwindcss"]
  },
  "agents": [
    "backend-engineer",
    "frontend-specialist",
    "database-specialist",
    "testing-specialist"
  ],
  "skills": [
    "typescript",
    "nodejs",
    "react",
    "nextjs",
    "prisma",
    "tailwind",
    "vitest"
  ]
}
```

### Python FastAPI Backend

```json
{
  "version": "1.3.1",
  "generatedAt": "2024-01-15T12:00:00.000Z",
  "goal": "Build a FastAPI backend",
  "codebase": {
    "projectType": "node",
    "framework": "FastAPI",
    "language": "Python",
    "dependencies": ["fastapi", "pydantic", "sqlalchemy"]
  },
  "agents": [
    "backend-engineer",
    "api-designer",
    "database-specialist"
  ],
  "skills": ["python", "fastapi"]
}
```

## Next Steps

- [CLAUDE.md Configuration](claude-md.md) - Project context file
- [Custom Templates](custom-templates.md) - Create custom agents/skills
- [Update Command](../commands/update.md) - Modify configuration
