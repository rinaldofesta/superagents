# CLAUDE.md Configuration

The CLAUDE.md file provides project context that Claude Code reads on startup.

## What is CLAUDE.md?

CLAUDE.md is a Markdown file in your project root containing:

- Project description and goals
- Tech stack information
- Coding principles
- Skill usage guide
- Development guidelines

Claude Code reads this file automatically when you open your project.

## File Location

```
your-project/
├── CLAUDE.md          # Project context (here)
├── .claude/           # Configuration folder
│   ├── settings.json
│   ├── agents/
│   └── skills/
└── src/
```

CLAUDE.md lives in the project root, outside `.claude/`.

## Generated Content

SuperAgents generates CLAUDE.md with sections tailored to your project.

### Example Structure

```markdown
# Project Name

Brief project description based on your goal.

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | 20.x+ | Server-side execution |
| Language | TypeScript | 5.x | Type-safe development |
| Framework | Next.js | 14.x | Full-stack React framework |
...

## Quick Start

```bash
npm install
npm run dev
npm test
```

## Project Structure

[Directory tree of your project]

## Coding Principles

> Karpathy's 4 principles are embedded in every agent.

### 1. Think Before Coding
...

## Skill Usage Guide

When working on tasks involving these technologies, invoke the corresponding skill:

| Skill | Invoke When |
|-------|-------------|
| typescript | Enforces TypeScript strict mode |
| react | React 18+ patterns and hooks |
...
```

## Tech Stack Section

SuperAgents detects your stack and creates a table:

```markdown
## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | 20.x+ | Server-side execution |
| Language | TypeScript | 5.x | Type-safe development |
| Framework | React | 18.x | UI library |
| Styling | Tailwind | 3.x | Utility-first CSS |
| Database | Prisma | 5.x | ORM and migrations |
| Testing | Vitest | 4.x | Unit testing |
```

This is based on:
- Detected frameworks
- package.json dependencies
- Selected skills

## Coding Principles Section

All generated CLAUDE.md files include Karpathy's 4 Coding Principles:

```markdown
## Coding Principles

> Karpathy's 4 principles are embedded in every generated agent.

### 1. Think Before Coding
- State assumptions explicitly
- Present multiple interpretations if they exist
- Push back if a simpler approach exists
- Stop and ask if something is unclear

### 2. Simplicity First
- No features beyond what was asked
- No abstractions for single-use code
- No speculative flexibility
- Rewrite 200 lines if they could be 50

### 3. Surgical Changes
- Don't improve adjacent code
- Match existing style
- Only remove orphans YOUR changes created
- Every changed line traces to the request

### 4. Goal-Driven Execution
- Transform tasks into verifiable goals
- Write tests first when possible
- State a brief plan for multi-step tasks
- Define success criteria before implementing
```

These principles guide AI behavior across all agents.

## Skill Usage Guide Section

Maps skills to use cases:

```markdown
## Skill Usage Guide

When working on tasks involving these technologies, invoke the corresponding skill:

| Skill | Invoke When |
|-------|-------------|
| nodejs | Configures Node.js runtime, module patterns, and server-side APIs |
| typescript | Enforces TypeScript strict mode, type patterns, and type-safe development |
| react | React 18+ patterns, hooks, and component composition |
| nextjs | Next.js 14+ App Router, server components, and data fetching |
| prisma | Prisma ORM patterns, schema design, and type-safe queries |
| vitest | Vitest unit testing, test structure, and coverage |
```

This is generated from your selected skills.

## Customization

You can edit CLAUDE.md to add:

- Project-specific conventions
- Architecture decisions
- Team guidelines
- API documentation links

SuperAgents won't overwrite manual edits unless you regenerate.

### Preserving Custom Content

To keep custom sections during regeneration:

1. Add custom content below generated sections
2. Use unique headers (e.g., `## Team Guidelines`)
3. Run `superagents --update` (preserves custom content)

### Full Regeneration

To regenerate CLAUDE.md entirely:

```bash
superagents --update
```

Select "Regenerate CLAUDE.md" when prompted.

Warning: This overwrites all content, including custom edits.

## Version Control

Should you commit CLAUDE.md?

**Yes**, commit CLAUDE.md to share context with:
- Team members
- CI/CD pipelines
- Future you

Add to `.gitignore`:
- `.claude/` (optional, contains generated files)
- `~/.superagents/` (user-specific cache)

Example `.gitignore`:

```gitignore
# SuperAgents generated config (optional)
.claude/

# Environment variables
.env
```

Some teams commit `.claude/` to share exact agent configurations.

## Claude Code Integration

Claude Code reads CLAUDE.md automatically on project open.

### When Claude Reads CLAUDE.md

- On project startup
- When you explicitly reference it
- When invoked via custom commands

### What Claude Learns

From CLAUDE.md, Claude understands:
- Project goals and context
- Tech stack and versions
- Available skills and when to use them
- Coding principles to follow

This improves response quality across all conversations.

## Updating CLAUDE.md

### Update with New Content

After adding agents or skills:

```bash
superagents --update
```

Select "Regenerate CLAUDE.md" to include new items in the Skill Usage Guide.

### Manual Edits

You can manually edit CLAUDE.md for:
- Project description refinement
- Architecture documentation
- Team conventions

Changes persist until you regenerate.

## Example: Full-Stack App

Example CLAUDE.md for a Next.js app:

```markdown
# E-commerce Platform

A modern e-commerce platform with Next.js, Prisma, and Stripe integration.

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | 20.x+ | Server-side execution |
| Language | TypeScript | 5.x | Type-safe development |
| Framework | Next.js | 14.x | Full-stack React framework |
| UI | React | 18.x | Component library |
| Styling | Tailwind | 3.x | Utility-first CSS |
| Database | Prisma | 5.x | ORM and migrations |
| Payments | Stripe | Latest | Payment processing |
| Testing | Vitest | 4.x | Unit testing |

## Quick Start

```bash
npm install
npm run dev
npm test
```

## Project Structure

```
src/
├── app/              # Next.js App Router
├── components/       # React components
├── lib/             # Utilities and helpers
└── prisma/          # Database schema
```

## Coding Principles

> Karpathy's 4 principles...

## Skill Usage Guide

| Skill | Invoke When |
|-------|-------------|
| typescript | TypeScript development |
| nodejs | Server-side code |
| react | React components |
| nextjs | Next.js routing and data |
| tailwind | Styling components |
| prisma | Database queries |
| vitest | Writing tests |
```

## Next Steps

- [Settings Configuration](settings.md) - settings.json options
- [Custom Templates](custom-templates.md) - Customize agents and skills
- [Update Command](../commands/update.md) - Regenerate CLAUDE.md
