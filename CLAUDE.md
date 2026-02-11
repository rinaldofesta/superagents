# SuperAgents v2

## What This Is
TypeScript CLI that generates lean, context-aware Claude Code configurations. Takes users from idea to configured project with AI agents, skills, permissions, hooks, and slash commands.

## Stack
TypeScript CLI | Node.js >= 20 | ESM | @anthropic-ai/sdk, @clack/prompts, commander, cosmiconfig, zod

## Hard Rules
- Use **Vitest**, NOT Jest
- Use **Zod**, NOT Joi or Yup
- Use **picocolors**, NOT chalk
- No features beyond what's explicitly requested
- No abstractions for single-use code
- No error handling for impossible scenarios
- Every generated line must pass the "Would Claude Know This?" test
- Generated CLAUDE.md: max 700 tokens. Agents: 200-400 tokens. Total active config: < 3,000 tokens.

## Commands
| Action | Command |
|--------|---------|
| Test | `npm test` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Dev | `npm run dev` |
| Type check | `npx tsc --noEmit` |

## Architecture
```
src/
  index.ts           CLI entry, subcommands
  pipeline.ts        Generation pipeline orchestration
  analyzer/          Codebase detection (type, framework, deps, patterns)
  context/           Recommendation engine (scoring, overlap, auto-linking)
  config/            Presets (14 goal categories), export/import
  generator/         AI generation via Anthropic SDK
  writer/            File output (CLAUDE.md, agents, skills, settings, docs)
  updater/           Incremental config updates
  cache/             File-based analysis cache
  cli/               Prompts, banner, colors, UX flow
  templates/         Agent + skill markdown templates (21 agents, 23 skills)
  types/             All type definitions
  utils/             Auth, logger, version check
tests/               Vitest test suites
```

## Agents (3)
- **backend-engineer** — pipeline, analyzer, generator, writer, recommendation engine
- **copywriter** — CLI text, success messages, error messages, generated content copy
- **testing-specialist** — Vitest test suites, coverage, test patterns

## Skills (2)
- **typescript** — strict mode, ESM, import conventions, Zod integration
- **nodejs** — Node 20+, ESM, CLI stack (commander, clack, picocolors, fs-extra)

## Conventions
- Files: `kebab-case.ts`
- Imports: Node built-ins -> external -> internal -> types
- Type imports: `import type { Foo }` always separate
- Named exports only, no defaults
- async/await, never raw promise chains
- Validate at system boundaries only

## v2 Phase 1 Priorities (Current Sprint)
1. Lean config generation (< 700 token CLAUDE.md, "Would Claude Know This?" filter)
2. Permissions + security defaults in settings.json (infer from project)
3. Stop hooks for auto-formatting (detect lint/format commands)
4. First prompt guidance (copy-pasteable prompt in success message)
5. Agent/skill reduction (2-4 agents max, auto-link skills)
6. Slash commands generation (`/status`, `/fix`, `/next`, `/ship`)
7. MCP server suggestions (SETUP.md with install commands)

## Deep Context
- `.claude/docs/architecture.md` — system overview, pipeline flow, design decisions
- `.claude/docs/patterns.md` — code patterns, conventions, generation quality rules
- `PRD_v2.md` — full product requirements document

## Checkpoint
- **Branch**: v2
- **Last completed**: UX flow enhancement (selectTeam, overlap suppression, project-specific reasons, preset tuning, lean defaults)
- **Next**: Phase 1 Sprint 1 — lean CLAUDE.md generation, agent token reduction, "Would Claude Know This?" filter
