# SuperAgents

Context-aware Claude Code configuration generator that asks "What are you building?" to create customized configurations (agents, skills, hooks) tailored to both your existing codebase AND your project goals.

**Project Type:** cli-tool | **Status:** v1.2.0 (Active Development)

---

## Coding Principles

> Behavioral guidelines to reduce common LLM coding mistakes. These bias toward caution over speed - use judgment for trivial tasks.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | 20+ | ESM modules, modern async/await |
| Language | TypeScript | 5.x | Strict mode with additional checks |
| CLI Framework | Commander.js | 12.x | Command parsing and CLI structure |
| Interactive UI | @clack/prompts | 0.7.x | Beautiful terminal prompts and selections |
| Progress | ora | 8.x | Terminal spinners and progress indicators |
| Colors | picocolors | 1.x | Terminal text coloring |
| AI Integration | Anthropic SDK | 0.30.x | Claude API for intelligent generation |
| Concurrency | p-limit | 7.x | Parallel generation control |
| File Operations | fs-extra | 11.x | Enhanced filesystem utilities |
| Validation | Zod | 3.x | Runtime schema validation |
| Testing | Vitest | 4.x | Unit and integration tests |

---

## Architecture Overview

SuperAgents uses a context-first approach:

```
1. Collect Goal     -> "What are you building?"
2. Authenticate     -> Claude Plan (Max) or API Key
3. Select Model     -> Claude Sonnet 4.5 or Opus 4.5
4. Analyze Codebase -> Detect frameworks, patterns, dependencies
5. Recommendations  -> Merge goal + codebase insights
6. User Confirms    -> Select agents and skills
7. AI Generation    -> Claude creates custom configs (parallel, cached)
8. Write Output     -> .claude/ folder created
```

---

## Project Structure

```
superagents/
├── src/
│   ├── index.ts              # CLI entry point and workflow orchestration
│   ├── cli/
│   │   ├── banner.ts         # ASCII art, displaySuccess(), displayError()
│   │   ├── prompts.ts        # collectProjectGoal(), selectModel(), confirmSelections()
│   │   ├── progress.ts       # ProgressIndicator class, withProgress() utility
│   │   └── dry-run.ts        # Dry-run preview with cost estimation
│   ├── analyzer/
│   │   └── codebase-analyzer.ts  # Codebase analysis and pattern detection
│   ├── context/
│   │   └── recommendation-engine.ts  # Smart recommendations based on goal + codebase
│   ├── generator/
│   │   └── index.ts          # AI-powered agent/skill generation with Claude
│   ├── cache/
│   │   └── index.ts          # Caching layer (codebase + responses)
│   ├── writer/
│   │   └── index.ts          # Output writer for .claude/ folder
│   ├── utils/
│   │   ├── concurrency.ts    # Parallel generation (p-limit)
│   │   ├── model-selector.ts # Tiered model selection
│   │   ├── logger.ts         # Verbose logging
│   │   ├── auth.ts           # Authentication (Claude Plan or API Key)
│   │   └── claude-cli.ts     # Claude CLI wrapper for Max subscribers
│   ├── config/
│   │   └── presets.ts        # GOAL_PRESETS for all 9 project types
│   └── types/
│       ├── goal.ts           # ProjectGoal, GoalCategory, GoalPreset
│       ├── codebase.ts       # CodebaseAnalysis, ProjectType, Framework
│       ├── generation.ts     # GenerationContext, GeneratedOutputs
│       └── config.ts         # AgentDefinition, SkillDefinition
├── bin/
│   └── superagents           # Executable entry point
├── agents/                   # Pre-configured agent profiles
│   ├── backend-engineer.md
│   ├── code-reviewer.md
│   ├── devops-specialist.md
│   ├── frontend-specialist.md
│   └── security-analyst.md
├── skills/                   # Domain knowledge modules
│   ├── aws-cdk.md
│   ├── cli-design.md
│   ├── nodejs.md
│   ├── react.md
│   └── typescript.md
├── install.sh                # Curl installation script
├── package.json
├── tsconfig.json
└── .eslintrc.json
```

### Key Modules

| Module | Location | Purpose |
|--------|----------|---------|
| Banner | `src/cli/banner.ts` | ASCII art and success/error displays |
| Prompts | `src/cli/prompts.ts` | Interactive prompts with @clack/prompts |
| Concurrency | `src/utils/concurrency.ts` | Parallel generation (max 3 concurrent) |
| Model Selector | `src/utils/model-selector.ts` | Tiered models (Haiku/Sonnet/Opus) |
| Cache | `src/cache/index.ts` | Codebase (24h) + Response (7d) caching |
| Auth | `src/utils/auth.ts` | Two auth methods: Claude Plan or API Key |
| Analyzer | `src/analyzer/codebase-analyzer.ts` | Codebase analysis |
| Recommendations | `src/context/recommendation-engine.ts` | Smart agent/skill suggestions |
| Generator | `src/generator/index.ts` | AI-powered generation with progress |
| Writer | `src/writer/index.ts` | File output to .claude/ folder |
| Presets | `src/config/presets.ts` | Goal presets for 9 project types |

---

## Development Guidelines

### File Naming
- Source files: `kebab-case.ts` (e.g., `codebase-analyzer.ts`)
- Type files grouped in `types/` directory
- Config files grouped in `config/` directory

### Code Naming
- Interfaces/Types: `PascalCase` (e.g., `ProjectGoal`, `CodebaseAnalysis`)
- Functions: `camelCase` (e.g., `collectProjectGoal`, `displayBanner`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `GOAL_PRESETS`, `BANNER`)

### Import Order
```typescript
// 1. External packages
import { Command } from 'commander';
import * as p from '@clack/prompts';

// 2. Internal types (with type keyword)
import type { ProjectGoal } from '../types/goal.js';

// 3. Internal modules
import { displayBanner } from './cli/banner.js';

// Note: .js extension required for ESM imports
```

---

## Critical Rules

1. **NEVER** log API keys or sensitive data
2. **ALWAYS** respect .gitignore when sampling files
3. **ALWAYS** validate AI-generated content before writing
4. **NEVER** send entire codebases to Claude API (sample smartly)
5. **ALWAYS** provide progress feedback for operations >2 seconds
6. **NEVER** overwrite existing .claude/ without confirmation

---

## Available Commands

| Command | Description |
|---------|-------------|
| `superagents` | Run the main configuration generator |
| `superagents --dry-run` | Preview without API calls (cost estimate) |
| `superagents --verbose` | Show detailed output with streaming |
| `superagents cache --stats` | Show cache statistics |
| `superagents cache --clear` | Clear all cached data |
| `superagents update` | Update to the latest version |
| `npm run dev` | Start in watch mode with tsx |
| `npm run build` | Compile TypeScript to dist/ |
| `npm test` | Run Vitest test suite |
| `npm run type-check` | TypeScript check without emit |
| `npm run lint` | ESLint on src/ |

---

## Performance Features (v1.2.0)

**Implemented:**
- ✅ Parallel generation (3 concurrent API calls max)
- ✅ Tiered model selection (Haiku for simple, Sonnet for complex, respect user choice for CLAUDE.md)
- ✅ Codebase caching (24h TTL, hash-based invalidation)
- ✅ Response caching (7d TTL for AI-generated content)
- ✅ Streaming responses (verbose mode)
- ✅ Cost estimation (--dry-run)

**Cache Location:** `~/.superagents/cache/`

---

## Key Types

### GoalCategory
```typescript
type GoalCategory =
  | 'saas-dashboard'    // Analytics, metrics, admin panels
  | 'ecommerce'         // Online stores, marketplaces
  | 'content-platform'  // Blogs, CMS, publishing
  | 'api-service'       // REST/GraphQL APIs, microservices
  | 'mobile-app'        // iOS, Android, React Native
  | 'cli-tool'          // Command-line utilities
  | 'data-pipeline'     // ETL, data processing
  | 'auth-service'      // Authentication, user management
  | 'custom';           // Anything else
```

### GenerationContext
```typescript
interface GenerationContext {
  goal: ProjectGoal;                // User's vision
  codebase: CodebaseAnalysis;       // Current state
  selectedAgents: string[];         // Chosen agents
  selectedSkills: string[];         // Chosen skills
  selectedModel: 'opus' | 'sonnet'; // AI model
  authMethod: 'claude-plan' | 'api-key';
  apiKey?: string;
  sampledFiles: SampledFile[];      // Context for generation
  generatedAt: string;
  verbose: boolean;
  dryRun: boolean;
}
```

---

## Generated Output Structure

SuperAgents generates:

```
.claude/
├── CLAUDE.md              # Project overview + goals (for target projects)
├── settings.json          # Claude Code configuration
├── skills/                # Tech-specific knowledge (.md files)
│   ├── nodejs.md
│   ├── typescript.md
│   └── ...
├── agents/                # Specialized sub-agents (.md files)
│   ├── backend-engineer.md
│   ├── code-reviewer.md
│   └── ...
└── hooks/
    └── skill-loader.sh    # Auto-loads relevant skills
```

---

## Quick Start

```bash
# Install globally via curl
curl -fsSL https://raw.githubusercontent.com/rinaldofesta/superagents/main/install.sh | bash

# Or clone and build locally
git clone https://github.com/rinaldofesta/superagents.git
cd superagents
npm install
npm run build
npm start

# Update to latest version
superagents update
```

---

## Common Workflows

### 1. Run SuperAgents
```bash
superagents                    # Interactive mode
superagents --dry-run          # Preview with cost estimate
superagents --verbose          # Show detailed output
```

### 2. Customize Behavior
```bash
# Create .superagentsrc.json in your project root
{
  "targetDir": ".",
  "outputFile": "CLAUDE.md",
  "includeFileTree": true,
  "maxDepth": 3,
  "excludePatterns": ["node_modules", ".git", "dist"]
}
```

### 3. Cache Management
```bash
superagents cache --stats      # View cache info
superagents cache --clear      # Clear all caches
```

### 4. Development
```bash
npm run dev                    # Watch mode
npm run build                  # Compile
npm test                       # Run tests
npx tsc --noEmit              # Type check
```

---

## Additional Resources

- **Architecture.md** - Complete technical architecture
- **README.md** - User-facing documentation
- **NEW_IMPLEMENTATION.md** - Implementation roadmap and progress tracking

## Skill Usage Guide

| Skill | Invoke When |
|-------|-------------|
| ora | Displays terminal spinners, progress indicators |
| commander | CLI command parsing and argument handling |
| clack-prompts | Interactive terminal prompts and selections |
| typescript | TypeScript strict mode and type safety |
| nodejs | Node.js runtime, ESM modules, async/await |
| picocolors | Terminal text coloring and formatting |
| anthropic | Claude API integration |
| fs-extra | Enhanced file system operations |
| zod | Runtime schema validation |
| vitest | Unit and integration tests |

---

**Context7 Integration:** Use Context7 for up-to-date documentation on Anthropic SDK, @clack/prompts, Commander.js, and other dependencies.
