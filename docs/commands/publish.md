# Publish Command

Package your project as a reusable blueprint.

## Usage

```bash
superagents publish [options]
```

### Options

| Option | Description |
|--------|-------------|
| `-o, --output <path>` | Output directory for the blueprint zip |

## What It Does

Packages your project's `.claude/` configuration, `CLAUDE.md`, and `ROADMAP.md` into a `.blueprint.zip` file that others can install with `superagents use`.

Prompts for metadata: name, author, description, version, and keywords.

## Requirements

- An existing `.claude/` configuration
- A `ROADMAP.md` file (required for blueprint phases)

## Output

Creates `{name}-v{version}.blueprint.zip` containing:

- `blueprint.json` — metadata (name, author, phases, agents, skills, stack)
- `.claude/` — full configuration directory
- `CLAUDE.md` — project context file
- `ROADMAP.md` — project roadmap

## Example

```bash
$ superagents publish

  Blueprint name: my-saas-starter
  Author: cosmico
  Description: SaaS dashboard with auth and Stripe
  Version: 1.0.0
  Keywords: saas, typescript, nextjs

  ✓ Blueprint created!

  File: my-saas-starter-v1.0.0.blueprint.zip
  Size: 12.5 KB
  Phases: 4
  Agents: backend-engineer, frontend-specialist
  Skills: typescript, nextjs, prisma

  Share this file or use it with: superagents use <path>
```

## See Also

- [Use Command](use.md) — install a published blueprint
- [Export/Import](export-import.md) — share raw config (no roadmap/phases)
