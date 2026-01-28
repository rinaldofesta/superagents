# SuperAgents - Technical Architecture

> Context-aware Claude Code configuration generator

## Quick Reference

**Version:** 1.2.1 | **Status:** Phases 1-2 + Refactoring Complete

**Core Concept:** Goal-first approach that generates configurations based on what you're building, not just what you have.

**Key Features:**
- Goal understanding + codebase analysis
- Smart agent/skill recommendations
- Parallel generation with tiered models
- Caching (codebase + responses)
- Input validation & error prevention

## System Architecture

### Component Flow

**Pipeline:** CLI → Goal Analyzer → Codebase Analyzer → Recommendation Engine → AI Generator → Output Writer

**Key Components:**
1. **CLI Interface** (`src/cli/`) - @clack/prompts, ora spinners, banner
2. **Goal Analyzer** (`src/analyzer/goal-analyzer.ts`) - Categorizes project type, extracts requirements
3. **Codebase Analyzer** (`src/analyzer/codebase-analyzer.ts`) - Detects frameworks, patterns, dependencies
4. **Recommendation Engine** (`src/context/recommendation-engine.ts`) - Merges goal + code analysis, scores agents/skills
5. **AI Generator** (`src/generator/`) - Claude API integration with parallel generation & caching
6. **Output Writer** (`src/writer/`) - Creates `.claude/` structure

### Workflow
1. User describes goal → Categorize & extract requirements
2. Scan codebase → Detect tech stack & patterns
3. Merge analyses → Score & recommend agents/skills
4. User confirms selections → Generate via Claude API (parallel, cached)
5. Write output → `.claude/` folder with agents, skills, hooks

---

## Core Components

### 1. CLI Interface (`src/cli/`)
- **Purpose:** Interactive prompts, progress display, banners
- **Tools:** @clack/prompts, ora spinners, picocolors
- **Flow:** Display banner → Collect goal → Select model → Show recommendations → Confirm → Generate

### 2. Goal Analyzer (`src/analyzer/goal-analyzer.ts`)
- **Purpose:** Parse goal, categorize project, extract requirements
- **Categories:** saas-dashboard, ecommerce, content-platform, api-service, mobile-app, cli-tool, data-pipeline, auth-service, custom
- **Output:** `ProjectGoal` with description, category, requirements, agent/skill suggestions, confidence
- **Method:** Claude API analysis + fallback keyword matching

### 3. Codebase Analyzer (`src/analyzer/codebase-analyzer.ts`)
- **Purpose:** Detect tech stack, patterns, dependencies
- **Detection:**
  - **Project types:** nextjs, react, vue, node, python, go, rust, java
  - **Frameworks:** Check config files (next.config.js, etc.) + package.json deps
  - **Patterns:** API routes, server actions, components, services, models
  - **Dependencies:** Categorize as framework, ui, database, orm, auth, payments, testing, build
- **Output:** `CodebaseAnalysis` with detected tech + pattern recommendations

### 4. Recommendation Engine (`src/context/recommendation-engine.ts`)
- **Purpose:** Merge goal + codebase analyses, score agents/skills
- **Scoring:** Goal suggestions (priority × 10) + codebase matches (+5) → sort by score
- **Output:** Ranked agents/skills with reasons, pre-selected defaults (score ≥7)

### 5. AI Generator (`src/generator/`)
- **Purpose:** Claude API integration for content generation
- **Features:**
  - Parallel generation (p-limit, max 3 concurrent)
  - Tiered models (Haiku for simple, Sonnet for complex, respect user choice for CLAUDE.md)
  - Response caching (7-day TTL)
  - Input validation (prevents runtime errors)
- **Context:** Sends goal + codebase + sampled files to Claude
- **Outputs:** Agents, skills, hooks, CLAUDE.md

### 6. Output Writer (`src/writer/`)
- **Purpose:** Create `.claude/` structure with generated files
- **Structure:** `agents/`, `skills/`, `hooks/`, `CLAUDE.md`, `settings.json`
- **Safety:** Confirms before overwriting existing `.claude/` directory

---

## Data Flow

**Pipeline:** User Input → Goal Analysis → Codebase Analysis → Recommendations → User Confirms → Parallel Generation → Write Output

**Example Flow:**
1. **Input:** "A SaaS analytics dashboard" → Categorized as `saas-dashboard`
2. **Analysis:** Detect Next.js + TypeScript + React + 24 components + 8 API routes
3. **Recommendations:** Score agents/skills (frontend-engineer: 95, backend-engineer: 90, etc.)
4. **User Confirms:** Select which agents/skills to generate
5. **Generation:** Parallel API calls with caching (3 concurrent max), tiered models
6. **Output:** Write `.claude/` with agents/, skills/, hooks/, CLAUDE.md, settings.json

---

## AI Prompting Strategy

**All prompts include:**
- User's goal description + category
- Codebase tech stack (framework, language, key dependencies)
- Detected patterns (API routes, components, etc.)
- Sampled files (redacted, intelligent selection)

**CLAUDE.md Prompt:**
- Project goal + current state
- Tech stack outline
- Pattern highlights
- Agent/skill listings with "Use when" guidance
- Quick-start examples

**Agent Prompt:**
- Goal requirements mapped to agent domain
- Codebase patterns relevant to agent
- Sample files showing project style
- Output: YAML frontmatter + markdown with project-specific guidance

**Skill Prompt:**
- How skill relates to project goal
- Usage patterns detected in codebase
- Sample code from project
- Output: When to use + key concepts + pitfalls + related skills

---

## File Formats

### CLAUDE.md Structure
```markdown
# Project: [Name]

## Vision
[User's goal + project type]

## What We're Building
[Objectives from technical requirements]

## Current Tech Stack
[Detected framework + language + dependencies]

## Project Structure
[Key directories]

## Detected Patterns
[API routes, components, etc. with counts]

## Available Agents
[List with "/agent <name>" command and when to use]

## Available Skills
[List with "Skill(name)" command and descriptions]

## Quick Start
[Common workflows for this project type]
```

### Agent File Format
```markdown
---
name: agent-name
description: |
  [Role description]
  Use when: [Scenarios]
tools: Read, Edit, Write, Glob, Grep, Bash
model: sonnet
skills: [relevant-skills]
---

# Agent Name

[Role description with project goal context]

## Project Context
[Goal + tech stack]

## Key File Locations
[Directory structure for agent's domain]

## Patterns
[Code examples from codebase]

## CRITICAL Rules
[Numbered rules specific to this project]
```

### Skill File Format
```markdown
# Skill Name

> [Brief coverage description]

## When to Use
[Scenarios relevant to project goal]

## Key Concepts
[Table or list]

## Project-Specific Patterns
[Detected usage patterns with examples]

## Code Examples
[From or matching project style]

## Common Pitfalls
- [What to avoid]

## Related Skills
- [Other relevant skills]
```

---

## Detection Logic

### Goal Categorization
**Method:** Keyword matching with confidence score

**Keywords by Category:**
- **saas-dashboard:** saas, dashboard, analytics, metrics, admin panel
- **ecommerce:** ecommerce, shop, store, marketplace, cart, checkout
- **content-platform:** blog, cms, content, articles, publishing
- **api-service:** api, rest, graphql, microservice, backend
- **mobile-app:** mobile, ios, android, react native
- **cli-tool:** cli, command line, terminal, tool
- **data-pipeline:** pipeline, etl, data processing
- **auth-service:** authentication, auth, login, sso, oauth

**Fallback:** `custom` if confidence < threshold

### Framework Detection
**Priority:**
1. Config files (next.config.js, nuxt.config.js, etc.)
2. package.json dependencies (next, react, vue, express)
3. Language-specific files (requirements.txt → Python, go.mod → Go, Cargo.toml → Rust)

**Supported:**
- **JavaScript/TypeScript:** Next.js, React, Vue, Nuxt, Angular, Svelte, Express, Fastify, NestJS
- **Python:** Django, FastAPI, Flask
- **Others:** Go, Rust, Java detected via file markers

### Pattern Detection
**API Routes:** `**/app/**/route.{ts,js}` (Next.js App Router)
**Server Actions:** Files with `'use server'` directive
**Components:** `**/components/**/*.{tsx,jsx}`
**Models:** `**/models/**/*.{ts,js,py}`
**Services:** `**/services/**/*.{ts,js}`

---

## Configuration Catalog

### Goal Presets

**Per Category:**
- Recommended agents (with priority 1-10)
- Recommended skills (with priority 1-10)
- Technical requirements (frontend, backend, database, auth, payments, deployment)

**Example (saas-dashboard):**
- **Agents:** frontend-engineer (10), backend-engineer (9), api-engineer (8)
- **Skills:** react (10), nextjs (10), typescript (9), tailwind (9), api-design (8)
- **Requirements:** Interactive dashboard UI, RESTful API, time-series database, user auth

### Agent Library
**Categories:** engineering, quality, documentation, operations, security, optimization

**Common Agents:**
- frontend-engineer, backend-engineer, api-engineer
- reviewer, debugger, performance-engineer, security-engineer
- docs-writer, devops-engineer

### Skill Library (100+)
**Categories:** framework, language, database, orm, styling, payments, auth, testing, devops, cicd

**Auto-Detection:**
- Package names (e.g., "next" → nextjs skill)
- Config files (e.g., tailwind.config.js → tailwind skill)
- Env vars (e.g., SUPABASE_URL → supabase skill)
- File patterns (e.g., **/*.test.ts → testing skills)

---

## Security & Privacy

### Data Handling
1. **Local-First:** All analysis happens locally
2. **Smart Sampling:** Only representative files sent to API
3. **Exclusions:** `.env*`, `*secrets*`, `*credentials*`, `*.key`, `*.pem`, `node_modules/`, `.next/`, `dist/`
4. **Redaction:** Sensitive strings (API keys, passwords, tokens) automatically redacted
5. **Respects .gitignore:** Ignored files never sent

### API Key Security
- Read from env vars (`ANTHROPIC_API_KEY`)
- Never logged
- Cleared from memory after use

### Caching
- **Location:** `~/.superagents/cache/`
- **Codebase cache:** 24-hour TTL (centralized constant)
- **Response cache:** 7-day TTL (centralized constant)
- **Versioned:** Cache invalidated on format changes
- **Strategy:** Hash lock files + directory structure (not content) for stability

---

## Implementation Details

### Project Structure
```
src/
├── index.ts                 # CLI entry point
├── cli/                     # Interactive prompts & display
│   ├── banner.ts
│   ├── prompts.ts
│   ├── progress.ts
│   └── dry-run.ts
├── analyzer/                # Codebase analysis
│   ├── goal-analyzer.ts
│   └── codebase-analyzer.ts
├── context/                 # Recommendation engine
│   └── recommendation-engine.ts
├── generator/               # AI generation
│   ├── index.ts
│   ├── agents.ts
│   ├── skills.ts
│   ├── hooks.ts
│   └── claude-md.ts
├── writer/                  # Output writer
│   └── index.ts
├── cache/                   # Caching layer
│   └── index.ts
├── utils/                   # Utilities
│   ├── concurrency.ts       # Parallel generation
│   ├── model-selector.ts    # Tiered model selection
│   ├── logger.ts            # Verbose logging
│   └── auth.ts
├── config/                  # Configuration
│   ├── agents.ts
│   ├── skills.ts
│   └── presets.ts
└── types/                   # TypeScript types
    ├── goal.ts
    ├── codebase.ts
    ├── generation.ts
    └── config.ts
```

### Key Technologies
- **Node.js 20+** with ES modules
- **TypeScript 5.7+** strict mode
- **@clack/prompts** - Interactive CLI
- **@anthropic-ai/sdk** - Claude API
- **p-limit** - Concurrency control
- **fs-extra** - File operations
- **glob** - File pattern matching
- **ora** - Progress spinners
- **picocolors** - Terminal colors

### Performance Optimizations
1. **Parallel Generation:** Max 3 concurrent API calls (p-limit)
2. **Tiered Models:** Haiku for simple (~80% cost reduction), Sonnet for complex
3. **Codebase Cache:** Skip re-analysis on unchanged projects (24h TTL)
4. **Response Cache:** Reuse generation for same goal+codebase (7d TTL)
5. **Input Validation:** Fail fast with clear error messages

---

_Document Version: 2.0 (Optimized)_
_Last Updated: 2026-01-28_
_SuperAgents - Context-Aware Claude Code Configuration Generator_
