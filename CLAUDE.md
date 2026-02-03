# SuperAgents

SuperAgents is a CLI tool that generates context-aware Claude Code configurations tailored to specific projects. Each generated agent embodies proven software engineering principles from industry legends—Uncle Bob's Clean Architecture, Dan Abramov's React patterns, Martin Fowler's refactoring techniques, and Kent Beck's TDD methodology.

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | 20.x+ | Server-side execution |
| Language | TypeScript | 5.x | Type-safe development (strict mode) |
| AI | @anthropic-ai/sdk | 0.30.x | Claude API interaction |
| CLI Framework | Commander.js | 12.x | Command-line argument parsing |
| CLI UX | @clack/prompts | 0.7.x | Interactive terminal prompts |
| CLI UX | ora | 8.x | Terminal spinners and loading states |
| CLI UX | picocolors | 1.x | Terminal colors |
| Config | cosmiconfig | 9.x | Config file discovery |
| File System | fs-extra | 11.x | Enhanced file operations |
| File Patterns | glob | 10.x | File pattern matching |
| Validation | zod | 3.x | Schema validation |
| Archives | archiver, unzipper | 7.x | ZIP file operations |
| Testing | Vitest | 4.x | Unit testing framework |

## Quick Start

```bash
# Prerequisites
Node.js 20+

# Installation (npm)
npm install -g superagents

# Or one-line install
curl -fsSL https://raw.githubusercontent.com/rinaldofesta/superagents/main/install.sh | bash

# Development
npm install        # Install dependencies
npm run dev        # Run in development mode
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Lint code
npm run type-check # Type check without emit
```

## Project Structure

```
pn-superagents/
├── src/
│   ├── index.ts                    # CLI entry point (Commander setup)
│   ├── analyzer/
│   │   └── codebase-analyzer.ts    # Project detection and analysis
│   ├── cache/
│   │   └── index.ts                # Caching for analysis and generation
│   ├── cli/
│   │   ├── banner.ts               # ASCII art and success messages
│   │   ├── dry-run.ts              # Preview mode
│   │   ├── progress.ts             # Progress indicators
│   │   └── prompts.ts              # Interactive prompts (@clack/prompts)
│   ├── config/
│   │   ├── export-import.ts        # Config export/import (ZIP)
│   │   └── presets.ts              # Goal-based presets
│   ├── context/
│   │   └── recommendation-engine.ts # Agent/skill recommendations
│   ├── generator/
│   │   └── index.ts                # AI generation orchestration
│   ├── prompts/
│   │   └── templates.ts            # AI prompt templates
│   ├── templates/
│   │   ├── agents/                 # 15 expert-backed agent templates
│   │   ├── skills/                 # 16 framework skill templates
│   │   ├── custom.ts               # Custom template management
│   │   └── loader.ts               # Template loading and rendering
│   ├── types/
│   │   ├── codebase.ts             # CodebaseAnalysis, Pattern types
│   │   ├── config.ts               # AgentDefinition, SkillDefinition
│   │   ├── generation.ts           # GenerationContext, outputs
│   │   └── goal.ts                 # ProjectGoal, GoalCategory
│   ├── updater/
│   │   └── index.ts                # Incremental config updates
│   ├── utils/
│   │   ├── auth.ts                 # Anthropic authentication
│   │   ├── claude-cli.ts           # Claude CLI execution
│   │   ├── concurrency.ts          # Parallel generation
│   │   ├── logger.ts               # Verbose logging
│   │   └── model-selector.ts       # Tiered model selection
│   └── writer/
│       └── index.ts                # Output file writer
├── bin/
│   └── superagents                 # CLI entry script
├── package.json
├── tsconfig.json
└── .eslintrc.json
```

## Architecture Overview

SuperAgents follows a pipeline architecture:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   CLI Input  │ -> │   Analyzer   │ -> │  Recommender │ -> │  Generator   │
│   (prompts)  │    │  (codebase)  │    │ (goal+code)  │    │    (AI)      │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                    │
                                                                    v
                                                            ┌──────────────┐
                                                            │    Writer    │
                                                            │  (.claude/)  │
                                                            └──────────────┘
```

1. **CLI Input**: Collects project goal and user preferences via @clack/prompts
2. **CodebaseAnalyzer**: Detects project type, framework, dependencies, patterns
3. **RecommendationEngine**: Scores and suggests agents/skills based on goal + codebase
4. **AIGenerator**: Generates content using templates or Claude API (with caching)
5. **OutputWriter**: Writes `.claude/` folder structure

### Key Modules

| Module | Location | Purpose |
|--------|----------|---------|
| CodebaseAnalyzer | `src/analyzer/` | Detects project type, framework, dependencies |
| RecommendationEngine | `src/context/` | Combines goal and codebase for smart recommendations |
| AIGenerator | `src/generator/` | Orchestrates parallel AI generation with caching |
| CacheManager | `src/cache/` | Caches analysis (24h) and generation (7 days) |
| Template system | `src/templates/` | 31 built-in templates to reduce API calls |

## Development Guidelines

### File Naming
- Source files: kebab-case (`codebase-analyzer.ts`, `model-selector.ts`)
- Template files: kebab-case (`backend-engineer.md`, `testing-specialist.md`)

### Code Naming
- Functions: camelCase (`analyzeCodebase`, `buildPrompt`)
- Types/Interfaces: PascalCase (`CodebaseAnalysis`, `GenerationContext`)
- Constants: SCREAMING_SNAKE (`BUNDLED_AGENTS`, `CACHE_VERSION`)
- Unused params: underscore prefix (`_framework`, `_result`)

### Import Order
1. Node.js built-ins (`path`, `fs`, `crypto`)
2. External packages (`@anthropic-ai/sdk`, `@clack/prompts`)
3. Internal modules (`./types/`, `./utils/`)
4. Type imports (with `type` keyword)

### Module Pattern
- ESM modules with `.js` extensions in imports
- `type` keyword for type-only imports
- Named exports preferred over default exports

## Available Commands

| Command | Description |
|---------|-------------|
| `superagents` | Main generation flow |
| `superagents --dry-run` | Preview without API calls |
| `superagents -v, --verbose` | Show detailed output |
| `superagents -u, --update` | Update existing config incrementally |
| `superagents update` | Self-update to latest version |
| `superagents cache --stats` | Show cache statistics |
| `superagents cache --clear` | Clear cached data |
| `superagents templates --list` | List available templates |
| `superagents export [output]` | Export config to ZIP |
| `superagents import <source>` | Import config from ZIP |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | For API mode | Anthropic API key (sk-ant-...) |

Authentication supports two modes:
- **API Key**: Set `ANTHROPIC_API_KEY` environment variable
- **Claude Plan**: Uses Claude CLI for Max subscribers

## Testing

- **Framework**: Vitest 4.x
- **Run tests**: `npm test`
- **Watch mode**: `npm run test:watch`
- **Type check**: `npm run type-check`

## Caching Strategy

| Cache Type | TTL | Key Components |
|------------|-----|----------------|
| Codebase Analysis | 24 hours | Project root hash (package.json, tsconfig, src/ structure) |
| Generation | 7 days | Goal + codebase hash + item type + model |

Cache location: `~/.superagents/cache/`

## Expert-Backed Agents (15)

| Agent | Expert | Domain |
|-------|--------|--------|
| backend-engineer | Uncle Bob | Clean Architecture & SOLID |
| frontend-specialist | Dan Abramov | React Patterns |
| code-reviewer | Google Engineering | Code Review Practices |
| debugger | Julia Evans | Systematic Debugging |
| devops-specialist | Kelsey Hightower | Infrastructure Patterns |
| security-analyst | OWASP Foundation | Security Best Practices |
| database-specialist | Martin Kleppmann | Data-Intensive Apps |
| api-designer | Stripe | API Design Principles |
| testing-specialist | Kent Beck | Test-Driven Development |
| docs-writer | Divio | Documentation System |
| performance-optimizer | Addy Osmani | Web Performance |
| copywriter | Paolo Gervasi | Conversion Copywriting |
| designer | Sarah Corti | UI/UX Design |
| architect | Martin Fowler | Enterprise Patterns |
| product-manager | Marty Cagan | Product Discovery |

## Built-in Skills (16)

typescript, nodejs, react, nextjs, vue, tailwind, prisma, drizzle, express, supabase, vitest, graphql, docker, python, fastapi, mcp

## Additional Resources

- Repository: https://github.com/rinaldofesta/superagents
- Issues: https://github.com/rinaldofesta/superagents/issues
- Custom templates: `~/.superagents/templates/`

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


## Skill Usage Guide

When working on tasks involving these technologies, invoke the corresponding skill:

| Skill | Invoke When |
|-------|-------------|
| nodejs | Configures Node.js runtime, module patterns, and server-side APIs |
| commander | Builds CLI argument parsing, command hierarchies, and option handling |
| typescript | Enforces TypeScript strict mode, type patterns, and type-safe development |
| clack | Creates interactive terminal prompts, multi-select inputs, and user interactions |
| zod | Implements schema validation, type inference, and runtime type checking |
| vitest | Sets up unit testing, test runners, and test coverage in Vitest |
| anthropic-sdk | Integrates Claude API calls, streaming, and model selection patterns |
| cosmiconfig | Manages configuration file discovery and hierarchical config loading |
| glob | Implements file pattern matching and recursive directory traversal |
| fs-extra | Handles file system operations, directory creation, and file writing |
