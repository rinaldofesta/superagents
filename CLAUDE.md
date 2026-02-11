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
tests/               Vitest test suites (90 tests)
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
Handoff & Blueprint Sharing — `superagents handoff` (HANDOFF.md generation with project state, build status, roadmap progress, team config), `superagents publish` (package project as .blueprint.zip), `superagents use <source>` (install blueprint from local file or URL with --preview/--force). Enhanced ROADMAP.md parser with task description capture. 90 tests passing.

### Phase 4B (Next)
Platform & Ecosystem — blueprint marketplace/registry, Entire integration.

## Deep Context

- `.claude/docs/architecture.md` — system overview, pipeline flow, design decisions
- `.claude/docs/patterns.md` — code patterns, conventions, generation quality rules
- `PRD_v2.md` — full product requirements document

## Checkpoint

- **Branch**: v2
- **Last completed**: Phase 4A — Handoff & Blueprint Sharing (superagents handoff/publish/use, enhanced parser with descriptions, 25 new tests, 90 total)
- **Next**: Phase 4B — Platform & Ecosystem (blueprint marketplace/registry, Entire integration)
