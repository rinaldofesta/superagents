I'll read the key source files to understand the project better before generating the CLAUDE.md.

<function_calls>
<invoke name="Read">
<parameter name="file_path">/Users/rinaldofesta/Desktop/pn-superagents/package.json</parameter>
</invoke>
<invoke name="Read">
<parameter name="file_path">/Users/rinaldofesta/Desktop/pn-superagents/src/index.ts</parameter>
</invoke>
<invoke name="Read">
<parameter name="file_path">/Users/rinaldofesta/Desktop/pn-superagents/README.md</parameter>
</invoke>
</function_calls>
<thinking>
Let me read these files to understand the project better.
</thinking>

<function_calls>
<invoke name="Glob">
<parameter name="pattern">src/**/*.ts</parameter>
</invoke>
</function_calls>
<thinking>
Let me get more context on the project structure.
</thinking>

<function_calls>
<invoke name="Read">
<parameter name="file_path">/Users/rinaldofesta/Desktop/pn-superagents/src/templates/agents/backend-engineer.md</parameter>
</invoke>
<invoke name="Read">
<parameter name="file_path">/Users/rinaldofesta/Desktop/pn-superagents/src/templates/skills/typescript.md</parameter>
</invoke>
</function_calls>
<thinking>
Now I have a good understanding of the project. Let me create the CLAUDE.md file with the proper structure.
</thinking>

Now I'll create the CLAUDE.md file:

<function_calls>
<invoke name="Write">
<parameter name="file_path">/Users/rinaldofesta/Desktop/pn-superagents/CLAUDE.md</parameter>
<parameter name="content"># SuperAgents is an intelligent CLI tool that generates highly customized Claude Code configurations (agents, skills, and hooks) based on both your existing codebase AND your project goals. Each agent is built on principles from industry-leading experts like Uncle Bob, Dan Abramov, Martin Fowler, and more.

## Vision

SuperAgents transforms how developers set up Claude Code by generating context-aware configurations tailored to their specific project. Instead of generic prompts, each generated agent embodies proven software engineering principles from industry legends—Uncle Bob's Clean Code, Dan Abramov's React patterns, Martin Fowler's refactoring techniques, and Kent Beck's TDD methodology. The result: AI-assisted development that produces code matching the quality standards of expert engineers.

**Type:** cli-tool
**Status:** New project
**Generated:** 1/29/2026, 12:58:14 PM

## What We're Building

SuperAgents is a CLI tool that:

1. **Analyzes your codebase** - Scans project structure, dependencies, and patterns to understand your tech stack
2. **Generates expert-backed agents** - Creates specialized Claude Code agents (backend, frontend, testing, docs, etc.) infused with principles from software engineering thought leaders
3. **Produces tailored skills** - Generates skill files with framework-specific knowledge (Node.js, TypeScript, React, etc.)
4. **Creates a unified CLAUDE.md** - Bundles everything into a comprehensive configuration that Claude Code can use

Key objectives:
- Zero manual configuration for common project types
- Expert-quality code suggestions out of the box
- Extensible agent/skill template system
- Support for monorepos and complex project structures

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

## Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Runtime | Node.js | JavaScript runtime for CLI execution |
| Language | TypeScript | Type-safe development with ES modules |
| AI | @anthropic-ai/sdk | Claude API integration for intelligent generation |
| CLI Framework | Commander.js | Command-line argument parsing and subcommands |
| CLI UX | @clack/prompts | Beautiful interactive prompts and spinners |
| CLI UX | ora | Elegant terminal spinners for async operations |
| Config | cosmiconfig | Flexible configuration file discovery |
| File System | fs-extra | Enhanced file system operations |
| File System | glob | Pattern-based file matching |
| Archive | archiver / unzipper | ZIP file creation and extraction |

## Project Structure

```
pn-superagents/
├── src/
│   ├── index.ts              # CLI entry point and main logic
│   ├── analyzer.ts           # Codebase analysis engine
│   ├── generator.ts          # Configuration generation
│   ├── templates/
│   │   ├── agents/           # Expert-backed agent templates
│   │   │   ├── backend-engineer.md
│   │   │   ├── frontend-engineer.md
│   │   │   ├── testing-specialist.md
│   │   │   └── ...
│   │   └── skills/           # Framework/language skill templates
│   │       ├── typescript.md
│   │       ├── nodejs.md
│   │       └── ...
│   └── utils/                # Shared utilities
├── dist/                     # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── CLAUDE.md                 # This file
```

## Available Agents

Use `/agent <name>` to switch:

- **backend-engineer** - Server-side development following Uncle Bob's Clean Architecture and SOLID principles. Use for APIs, databases, services, and system design.
- **docs-writer** - Technical documentation following Divio's documentation system. Use for READMEs, API docs, tutorials, and architecture decision records.
- **testing-specialist** - Test development following Kent Beck's TDD methodology and Martin Fowler's testing pyramid. Use for unit tests, integration tests, and test strategy.
- **code-reviewer** - Code review following Google's engineering practices. Use for PR reviews, code quality analysis, and best practice enforcement.
- **copywriter** - User-facing content following UX writing best practices. Use for error messages, UI text, CLI help text, and user communications.
- **debugger** - Systematic debugging following scientific debugging methodology. Use for bug investigation, root cause analysis, and fix verification.

## Available Skills

Use `Skill(name)` to load:

- **nodejs** - Node.js runtime patterns including async/await, streams, error handling, performance optimization, and native module integration.
- **typescript** - TypeScript best practices including strict type safety, generics, utility types, declaration files, and project configuration.

## Quick Start

1. Switch agent: `/agent <name>`
2. Load skill: `Skill(name)`
3. Use Context7 for up-to-date docs

## Development Commands

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run locally
npm start

# Run in development mode
npm run dev

# Test the CLI
npx superagents generate
```

## Key Implementation Details

- **Entry Point:** `src/index.ts` - Uses Commander.js for CLI structure
- **Template System:** Markdown files in `src/templates/` are copied to `dist/` during build
- **Output:** Generates `.claude/` directory with `CLAUDE.md`, agents, skills, and hooks
- **Configuration:** Supports `superagents.config.js` for project-specific settings

---
Generated by SuperAgents - Context-aware configuration for Claude Code
</parameter>
</invoke>
</function_calls>
<thinking>
I've created the CLAUDE.md file with all the required sections, including the Coding Principles section exactly as provided. Let me verify it was written correctly.
</thinking>

CLAUDE.md has been generated at `/Users/rinaldofesta/Desktop/pn-superagents/CLAUDE.md`. The file includes:

- Project vision and description
- **Coding Principles section exactly as specified** (Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution)
- Complete tech stack table based on package.json dependencies
- Project structure matching the actual codebase
- All 6 agents with descriptions of when to use each
- Both skills with descriptions of what they provide
- Quick start guide and development commands