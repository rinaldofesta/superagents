# Handoff Command

Generate a HANDOFF.md for developer hand-off.

## Usage

```bash
superagents handoff
```

## What It Does

Gathers project context and generates a `HANDOFF.md` file that gives a new developer everything they need to continue your project. Includes project description, tech stack, build status, roadmap progress, team configuration, and next steps.

## Output File

Creates `HANDOFF.md` in the project root with these sections:

- **Overview** — project description from CLAUDE.md
- **Tech Stack** — language, framework, dependency count
- **Current State** — build status, file count, roadmap progress
- **Team Configuration** — active agents and skills
- **What's Next** — incomplete tasks from ROADMAP.md
- **Getting Started** — commands for the new developer to run

## Requirements

- An existing `.claude/` configuration

## Example

```bash
$ superagents handoff

  ✓ HANDOFF.md created!

  Project: My SaaS Dashboard
  Build: passing
  Agents: 3 | Skills: 2
  Progress: Phase 2: 3/5 tasks (60%)
  Next steps: 5 items
```

## See Also

- [Status Command](status.md) — view roadmap progress
- [Export/Import](export-import.md) — share raw config as a zip
- [Publish Command](publish.md) — package as a reusable blueprint
