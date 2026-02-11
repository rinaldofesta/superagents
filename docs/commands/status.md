# Status Command

Show project progress from ROADMAP.md.

## Usage

```bash
superagents status
```

## What It Does

Reads your `ROADMAP.md` file and displays per-phase progress bars with task completion. Optionally checks build status by running `npm run build`.

## Requirements

- A `ROADMAP.md` file in the project root (generated when you select a blueprint during `superagents` setup)

## Output

```
  Project Status

  Phase 1: Foundation          ████████████████████ 100% (5/5)
  Phase 2: Core Features       ████████░░░░░░░░░░░░  40% (2/5)
  Phase 3: Polish              ░░░░░░░░░░░░░░░░░░░░   0% (0/3)

  Build: passing
  Overall: 7/13 tasks (54%)
```

## ROADMAP.md Format

The parser expects this format:

```markdown
## Phase 1: Foundation
Description of this phase

- [x] Completed task
  Task description
- [ ] Pending task
  Task description
```

## See Also

- [Generate Command](generate.md) — create initial configuration with a blueprint
- [Evolve Command](evolve.md) — update config as your project grows
