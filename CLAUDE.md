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

| Action     | Command            |
| ---------- | ------------------ |
| Test       | `npm test`         |
| Lint       | `npm run lint`     |
| Build      | `npm run build`    |
| Dev        | `npm run dev`      |
| Type check | `npx tsc --noEmit` |

## Architecture

```
src/
  index.ts           CLI entry, subcommands (status, evolve, handoff, publish, use, update, cache, templates, export, import)
  pipeline.ts        Generation pipeline orchestration
  analyzer/          Codebase detection (type, framework, deps, patterns)
  blueprints/        Project blueprints (definitions, matcher, renderer)
  context/           Recommendation engine (scoring, overlap, auto-linking)
  config/            Presets (14 goal categories), export/import
  evolve/            Config evolution (differ, proposer, display)
  generator/         AI generation via Anthropic SDK
  status/            ROADMAP.md parser and progress display
  writer/            File output (CLAUDE.md, ROADMAP.md, agents, skills, settings, docs)
  updater/           Incremental config updates
  cache/             File-based analysis cache
  cli/               Prompts, banner, colors, UX flow
  templates/         Agent + skill markdown templates (21 agents, 23 skills)
  handoff/           Team handoff (collector, renderer, HANDOFF.md generation)
  publish/           Blueprint publishing (extractor, packager, .blueprint.zip)
  use/               Blueprint install (resolver, installer, local/URL support)
  types/             All type definitions (includes blueprint.ts, evolve.ts, handoff.ts, published-blueprint.ts)
  prompts/           Compressed AI prompt templates
  utils/             Auth, logger, version check
tests/               Vitest test suites (248 tests, 17 files)
```

## Agents (3)

- **backend-engineer** — pipeline, analyzer, generator, writer, recommendation engine, evolve
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

## v2 Phase Summary

### Phase 1 (Complete)
Lean config generation, permissions/security defaults, Stop hooks, first prompt guidance, agent/skill reduction with auto-linking, slash commands (`/status`, `/fix`, `/next`, `/ship`), MCP server suggestions.

### Phase 2 (Complete)
Project Blueprints — 5 curated templates (SaaS Dashboard, Landing+Waitlist, API Backend, Internal Tool, Marketplace) with phased ROADMAP.md generation. Blueprint matcher (category/keyword/stack/focus scoring). `superagents status` command with per-phase progress bars.

### Phase 3 (Complete)
Session Memory & Evolving Config — `/recap` slash command for session summaries, enhanced `/next` (reads session recaps + git log), enhanced `/fix` (plain language error description support), `Write(docs/**)` permission, Session Continuity section in generated CLAUDE.md, `superagents evolve` CLI subcommand (differ, proposer, display). 65 tests passing.

### Phase 4A (Complete)
Handoff & Blueprint Sharing — `superagents handoff` (HANDOFF.md generation with project state, build status, roadmap progress, team config), `superagents publish` (package project as .blueprint.zip), `superagents use <source>` (install blueprint from local file or URL with --preview/--force). Enhanced ROADMAP.md parser with task description capture. Fixed install.sh for git-based installs. Full command docs for status/evolve/handoff/publish/use. 113 tests passing (12 test files).

## Deep Context

- `.claude/docs/architecture.md` — system overview, pipeline flow, design decisions
- `.claude/docs/patterns.md` — code patterns, conventions, generation quality rules
- `PRD_v2.md` — full product requirements document

## Checkpoint

- **Branch**: v2
- **Last completed**: Test coverage expansion — added 135 tests for core modules (codebase-analyzer 35, model-selector 36, generator 27, writer 21, concurrency 16), fixed ESLint `any` warning in `cli/prompts.ts`. 248 tests across 17 files, 0 type errors, 0 lint warnings.
- **Next**: Phase 4B if registry infrastructure is ready, or remaining test coverage gaps (pipeline.ts, updater/, config/, cli/, auth, evolve display, handoff collector, publish/use entry points)
