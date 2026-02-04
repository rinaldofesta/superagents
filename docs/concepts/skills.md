# Skills

Skills are framework-specific knowledge modules that provide patterns, common workflows, and documentation access for specific technologies.

## What Are Skills?

Each skill is a Markdown file in `.claude/skills/` containing:

- Quick start patterns for the framework
- Common use cases and when to use them
- Key concepts table with examples
- Links to related skills
- Context7 integration for live documentation queries

When you invoke a skill in Claude Code, it provides framework-specific guidance.

## The 16 Built-in Skills

### Languages & Runtimes

**typescript**
- TypeScript 5.x strict mode patterns
- Type-only imports, discriminated unions
- ESM modules with `.js` extensions
- Use for: Type-safe development, strict mode configuration

**nodejs**
- Node.js 20+ runtime patterns
- File operations with fs-extra
- Child process execution, path handling
- Use for: Server-side code, CLI tools, file operations

**python**
- Python 3.11+ patterns and type hints
- Async/await, context managers
- Virtual environments, package management
- Use for: Backend services, scripts, data processing

### Frontend Frameworks

**react**
- React 18+ patterns and hooks
- Component composition, state management
- Performance optimization, concurrent features
- Use for: React applications, component libraries

**nextjs**
- Next.js 14+ App Router patterns
- Server components, data fetching
- Routing, layouts, middleware
- Use for: Full-stack React apps, SSR, SSG

**vue**
- Vue 3 Composition API patterns
- Reactivity, composables, lifecycle
- SFC structure and script setup
- Use for: Vue applications, reactive UIs

### Styling

**tailwind**
- Tailwind CSS utility-first patterns
- Responsive design, dark mode, custom themes
- Component patterns, optimization
- Use for: Styling with utility classes

### Backend Frameworks

**express**
- Express.js middleware patterns
- Routing, error handling, async/await
- REST API structure
- Use for: Node.js web servers, REST APIs

**fastapi**
- FastAPI async patterns
- Pydantic models, dependency injection
- OpenAPI documentation
- Use for: Python REST APIs, async backends

### Database & ORM

**prisma**
- Prisma ORM patterns
- Schema definition, migrations, queries
- Type-safe database access
- Use for: Database modeling with Node.js

**drizzle**
- Drizzle ORM TypeScript patterns
- Schema-first approach, type inference
- Migrations, queries, relations
- Use for: Type-safe SQL queries

**supabase**
- Supabase patterns for auth and database
- Real-time subscriptions, row-level security
- Storage, edge functions
- Use for: Backend-as-a-service with PostgreSQL

### Testing

**vitest**
- Vitest unit testing patterns
- Test structure, mocks, async tests
- Coverage, watch mode
- Use for: Testing JavaScript/TypeScript code

### API & Integration

**graphql**
- GraphQL schema design patterns
- Resolvers, queries, mutations
- Type generation, error handling
- Use for: GraphQL APIs and clients

**mcp**
- Model Context Protocol integration
- Server creation, tool definitions
- Claude integration patterns
- Use for: Building MCP servers for Claude

### Infrastructure

**docker**
- Docker containerization patterns
- Dockerfile best practices, multi-stage builds
- Docker Compose, networking
- Use for: Containerizing applications

## How Skills Work

### Invocation

In Claude Code, invoke a skill by typing its name:

```
typescript
```

Claude Code loads the skill's Markdown file and applies its context.

### Skill Structure

Each skill follows this format:

```markdown
# Skill Name

Brief description of the skill.

## Quick Start

### Pattern Name

```language
// Code example
```

## Key Concepts

| Concept | Usage | Example |
|---------|-------|---------|
| ... | ... | ... |

## Common Patterns

### Pattern Name

**When:** Description of when to use

```language
// Pattern implementation
```

## See Also

- [related-doc](references/doc.md)

## Related Skills

List of complementary skills

## Documentation Resources

> Context7 integration instructions
```

### Context7 Integration

Skills include documentation query instructions:

```markdown
## Documentation Resources

> Fetch latest documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "react"
2. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "react hooks useState useEffect"
- "react server components patterns"
```

This lets Claude query live documentation during conversations.

## Choosing Skills

SuperAgents recommends skills based on detected frameworks and dependencies.

### Automatic Detection

SuperAgents analyzes:
- `package.json` dependencies (JavaScript/TypeScript)
- `requirements.txt` (Python)
- Framework config files (next.config.js, vite.config.ts, etc.)
- Import statements in source files

Example detection:

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0",
    "prisma": "^5.0.0"
  }
}
```

Detected skills: react, nextjs, typescript, nodejs, prisma

### Manual Selection

Adjust recommendations during generation:

```
Recommended Skills (5):
  ☑ typescript
  ☑ nodejs
  ☑ react
  ☑ nextjs
  ☐ tailwind        # Add with spacebar
  ☑ prisma
  ☐ vitest          # Add with spacebar
```

### Goal-Based Recommendations

SuperAgents also detects technologies in your goal:

```
? What are you building?
> A FastAPI backend with PostgreSQL and Docker deployment

Detected: FastAPI, PostgreSQL, Docker
Recommending skills: python, fastapi, prisma, docker
```

## Skill Combinations

Common skill combinations for different project types:

### React SPA

```
typescript + react + tailwind + vitest
```

### Next.js Full-Stack

```
typescript + nodejs + react + nextjs + prisma + tailwind
```

### Express API

```
typescript + nodejs + express + prisma + vitest
```

### FastAPI Backend

```
python + fastapi + docker
```

### Vue Application

```
typescript + vue + tailwind + vitest
```

## Skill Files

Skill files are Markdown with frontmatter:

```markdown
---
name: typescript
description: TypeScript 5.x strict mode patterns
version: 5.x
model: claude-sonnet-4-5
---

This project uses TypeScript 5.x in **strict mode**...

## Quick Start

### Type-Only Imports

```typescript
import type { User } from './types.js';
```
```

### Frontmatter Fields

| Field | Purpose |
|-------|---------|
| `name` | Skill identifier |
| `description` | One-line summary |
| `version` | Framework version |
| `model` | Recommended Claude model |

## Custom Skills

Create your own skills for internal frameworks or tools:

```bash
# Export a built-in skill as starting point
superagents templates --export typescript --type skill

# Edit the file
# Save to ~/.superagents/templates/skills/my-skill.md

# Import
superagents templates --import ~/.superagents/templates/skills/my-skill.md --type skill
```

See [Custom Templates](../configuration/custom-templates.md) for details.

## Skill vs Agent

| Aspect | Skills | Agents |
|--------|--------|--------|
| Purpose | Framework patterns | Methodologies and principles |
| Scope | Narrow (one framework) | Broad (domain expertise) |
| Content | Code examples, APIs | Best practices, workflows |
| Source | Official docs | Industry experts |
| Use | Technical implementation | Strategic guidance |

Example usage:

```
# Planning phase
architect

# Implementation phase (invoke skill)
typescript

# Need React patterns (invoke skill)
react

# Code review phase
code-reviewer
```

## Updating Skills

### Update Existing Config

Add or remove skills:

```bash
superagents --update
```

Select "Add/remove skills" to adjust.

### Regenerate All Skills

To update skill content with latest patterns:

```bash
# Remove current skills
rm -rf .claude/skills/

# Regenerate
superagents --update
```

Choose "Regenerate all skills" when prompted.

## Next Steps

- [Agents Guide](agents.md) - Learn about specialized agents
- [Generation Process](generation.md) - How AI creates skills
- [Custom Templates](../configuration/custom-templates.md) - Create custom skills
- [Context7 MCP](https://context7.com) - Documentation query service
