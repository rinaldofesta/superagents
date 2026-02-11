# Evolve Command

Detect project changes and propose config updates.

## Usage

```bash
superagents evolve
```

## What It Does

Re-scans your codebase and compares it against a saved snapshot. Shows what changed (new dependencies, new patterns, framework switches) and proposes config updates like adding/removing agents or skills.

## Flow

1. Scans your codebase (same analyzer as initial generation)
2. Compares against the last snapshot (saved in `.claude/`)
3. Shows detected changes (deltas)
4. Proposes config updates based on changes
5. Asks for confirmation before applying

## Example Output

```
  Changes Detected

  + dependencies: added prisma, @prisma/client
  ~ framework: express → nextjs

  Proposed Updates

  + Add agent: database-specialist
    Reason: Prisma ORM detected in dependencies
  + Add skill: prisma
    Reason: @prisma/client added to project
  ~ Update CLAUDE.md
    Reason: Framework changed from Express to Next.js
```

## Requirements

- An existing `.claude/` configuration (run `superagents` first)

## See Also

- [Status Command](status.md) — view roadmap progress
- [Update Command](update.md) — manually add/remove agents and skills
