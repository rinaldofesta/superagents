# Custom Templates

Create your own agent and skill templates for specialized needs or internal frameworks.

## Template Basics

Templates are Markdown files with:
- Frontmatter (YAML metadata)
- Content (instructions and patterns)
- Variable substitution (optional)

SuperAgents uses templates to generate agents and skills without API calls.

## Template Types

| Type | Purpose | Location |
|------|---------|----------|
| Agent | Specialized AI assistants | `~/.superagents/templates/agents/` |
| Skill | Framework-specific knowledge | `~/.superagents/templates/skills/` |

Custom templates are stored in your home directory at `~/.superagents/templates/`.

## Creating Custom Templates

### 1. Export Built-in Template

Start with a built-in template as reference:

```bash
# Export an agent
superagents templates --export backend-engineer

# Export a skill
superagents templates --export typescript --type skill
```

This creates a file in your current directory.

### 2. Edit the Template

Open the exported file and customize:

```markdown
---
name: my-custom-agent
description: Internal framework specialist
expert: Your Team
model: claude-sonnet-4-5
---

You are a specialist in our internal framework.

Project Goal: {{goal}}
Framework: {{framework}}
Language: {{language}}

## Key Patterns

### Pattern 1

Description and code example.
```

### 3. Save to Templates Directory

Move the file to the templates directory:

```bash
# Create directory if needed
mkdir -p ~/.superagents/templates/agents/

# Move template
mv my-custom-agent.md ~/.superagents/templates/agents/
```

### 4. Use Custom Template

Custom templates appear in recommendations:

```bash
superagents
```

Or import explicitly:

```bash
superagents templates --import ~/.superagents/templates/agents/my-custom-agent.md --type agent
```

## Template Structure

### Frontmatter

YAML metadata at the top:

```markdown
---
name: backend-engineer
description: Clean Architecture & SOLID principles
expert: Uncle Bob
model: claude-sonnet-4-5
---
```

**Required fields:**
- `name`: Unique identifier (kebab-case)
- `description`: One-line summary
- `expert`: Source of methodology
- `model`: Recommended Claude model

**Valid models:**
- `claude-opus-4-5`
- `claude-sonnet-4-5`
- `claude-haiku-4-5`

### Content

Markdown content after frontmatter:

```markdown
You are a [role] following [methodology].

Project Goal: {{goal}}
Framework: {{framework}}

## Principles

1. **Principle 1**
   - Guideline
   - Example

## Workflows

### Workflow Name

Steps and code examples.
```

Use headers, lists, code blocks, and tables for structure.

### Variable Substitution

Templates support variable substitution:

| Variable | Replaced With | Example |
|----------|---------------|---------|
| `{{goal}}` | Your project goal | "Build a REST API" |
| `{{framework}}` | Detected framework | "Express" |
| `{{language}}` | Primary language | "TypeScript" |
| `{{dependencies}}` | Comma-separated deps | "express, prisma, zod" |
| `{{model}}` | Recommended model | "claude-sonnet-4-5" |
| `{{skills}}` | Comma-separated skills | "typescript, nodejs, express" |

Variables are optional. Use them for context awareness.

Example with variables:

```markdown
---
name: api-tester
description: API testing specialist
expert: Internal Team
model: claude-sonnet-4-5
---

You are an API testing specialist for {{framework}} applications.

Project: {{goal}}
Language: {{language}}
Dependencies: {{dependencies}}

## Testing Strategy

For {{framework}} APIs, follow these patterns...
```

When generated for an Express project:

```markdown
You are an API testing specialist for Express applications.

Project: Build a task management API
Language: TypeScript
Dependencies: express, prisma, vitest
```

## Agent Template Example

Complete custom agent template:

```markdown
---
name: internal-framework-expert
description: Specialist in our internal React framework
expert: Engineering Team
model: claude-sonnet-4-5
---

You are an expert in our internal React framework "Nexus".

Project Goal: {{goal}}
Framework: {{framework}} with Nexus extensions
Language: {{language}}

## Nexus Core Principles

### 1. Component Composition

Nexus uses a slot-based composition pattern:

```tsx
import { Container, Slot } from '@internal/nexus';

export function Layout({ children }) {
  return (
    <Container>
      <Slot name="header">{children.header}</Slot>
      <Slot name="content">{children.content}</Slot>
    </Container>
  );
}
```

### 2. State Management

Use Nexus stores instead of Redux:

```tsx
import { createStore } from '@internal/nexus';

const userStore = createStore({
  initial: { user: null },
  actions: {
    setUser: (state, user) => ({ ...state, user })
  }
});
```

## Common Workflows

### Creating a New Feature

1. Generate feature scaffold: `npx nexus create feature`
2. Implement component with slot pattern
3. Connect to store if stateful
4. Add tests with Nexus test utilities

### Styling

Nexus provides design tokens:

```tsx
import { tokens } from '@internal/nexus/design';

const styles = {
  color: tokens.color.primary,
  spacing: tokens.spacing.md
};
```

## Testing

Use Nexus test utilities:

```tsx
import { renderNexus, screen } from '@internal/nexus/test';

test('component renders', () => {
  renderNexus(<MyComponent />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

## Related Skills

- **typescript** for type-safe Nexus development
- **react** for core React patterns
- **vitest** for testing Nexus components
```

This template provides context about your internal framework.

## Skill Template Example

Complete custom skill template:

```markdown
---
name: internal-cli
description: Internal CLI framework patterns
version: 2.x
model: claude-haiku-4-5
---

This project uses our internal CLI framework "QuickCLI" 2.x.

## Quick Start

### Basic Command

```typescript
import { Command } from '@internal/quickcli';

export const myCommand = new Command('my-command')
  .description('Does something')
  .option('--verbose', 'Verbose output')
  .action(async (options) => {
    // Implementation
  });
```

## Key Concepts

| Concept | Usage | Example |
|---------|-------|---------|
| Commands | Define CLI commands | `new Command('build')` |
| Middleware | Request processing | `use(loggerMiddleware)` |
| Plugins | Extend functionality | `plugin(analyticsPlugin)` |

## Common Patterns

### Multi-Step Command

**When:** Command requires user input

```typescript
import { Command, prompt } from '@internal/quickcli';

export const setupCommand = new Command('setup')
  .action(async () => {
    const name = await prompt.text('Project name?');
    const type = await prompt.select('Type?', ['api', 'web']);
    // Setup logic
  });
```

### Plugin Development

**When:** Adding reusable functionality

```typescript
import { Plugin } from '@internal/quickcli';

export const myPlugin: Plugin = {
  name: 'my-plugin',
  setup(cli) {
    cli.beforeCommand((cmd) => {
      // Hook logic
    });
  }
};
```

## See Also

- [QuickCLI Docs](https://internal.example.com/quickcli)

## Related Skills

- **typescript** for type-safe CLI development
- **nodejs** for runtime patterns
- **vitest** for testing CLI commands

## Documentation Resources

> Internal documentation access

**QuickCLI Documentation:**
- Intranet: https://internal.example.com/quickcli
- Confluence: https://wiki.example.com/quickcli
```

This skill provides patterns for your internal CLI framework.

## Managing Custom Templates

### List All Templates

See built-in and custom templates:

```bash
superagents templates --list
```

Output:

```
Built-in Agents (15):
  backend-engineer
  frontend-specialist
  ...

Custom Agents (2):
  internal-framework-expert
  api-tester

Built-in Skills (16):
  typescript
  nodejs
  ...

Custom Skills (1):
  internal-cli
```

### Export Template

Export for editing or sharing:

```bash
# Export agent
superagents templates --export backend-engineer

# Export skill
superagents templates --export typescript --type skill

# Export to specific file
superagents templates --export backend-engineer --output my-agent.md
```

### Import Template

Add a custom template:

```bash
# Import agent
superagents templates --import ./my-agent.md --type agent

# Import skill
superagents templates --import ./my-skill.md --type skill
```

SuperAgents validates the template and copies it to `~/.superagents/templates/`.

### Delete Template

Remove a custom template:

```bash
# Delete agent
superagents templates --delete my-agent --type agent

# Delete skill
superagents templates --delete my-skill --type skill
```

Only custom templates can be deleted. Built-in templates are protected.

## Template Validation

SuperAgents validates templates on import:

**Frontmatter Validation:**
- Required fields present (name, description, expert/version, model)
- Valid model name
- No duplicate names

**Content Validation:**
- Non-empty content after frontmatter
- Valid Markdown syntax

Invalid templates are rejected with error messages.

## Sharing Templates

### Export Single Template

```bash
superagents templates --export my-agent --output my-agent.md
```

Share `my-agent.md` with team.

### Import on Another Machine

```bash
superagents templates --import my-agent.md --type agent
```

### Export Full Configuration

To share templates with configuration:

```bash
superagents export team-config.zip
```

This includes:
- All agents (built-in and custom)
- All skills (built-in and custom)
- settings.json
- CLAUDE.md

Import on another machine:

```bash
superagents import team-config.zip
```

## Best Practices

### Keep Templates Focused

Each template should cover one methodology or framework. Don't combine unrelated concepts.

Bad:
```markdown
---
name: fullstack-expert
description: Knows everything
---
```

Good:
```markdown
---
name: nestjs-specialist
description: NestJS framework patterns
---
```

### Use Variables for Context

Include project-specific variables:

```markdown
Project Goal: {{goal}}
Framework: {{framework}}
Language: {{language}}
```

This makes templates adapt to different projects.

### Provide Examples

Include code examples for every pattern:

```markdown
### Pattern Name

**When:** Use case description

```typescript
// Code example
```
```

### Link to Documentation

Add links to official docs or internal wikis:

```markdown
## Documentation Resources

- [Official Docs](https://example.com/docs)
- [Internal Wiki](https://wiki.internal.com)
```

### Version Templates

For frameworks with versions, include version in frontmatter:

```markdown
---
name: nestjs
version: 10.x
---
```

Update templates when framework versions change.

## Next Steps

- [Template Management Command](../commands/templates.md) - Template CLI reference
- [Agents Concept](../concepts/agents.md) - How agents work
- [Skills Concept](../concepts/skills.md) - How skills work
- [Export/Import](../commands/export-import.md) - Share configurations
