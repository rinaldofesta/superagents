# SuperAgents v2 — Product Requirements Document

**Product:** SuperAgents (superagents.playnew.com)
**Owner:** Cosmico / PlayNew
**Version:** 2.0
**Date:** February 2026
**Status:** Draft

---

## 1. Problem Statement

### The World Has Changed

AI coding agents (Claude Code, Codex CLI, Gemini CLI) have made it possible for anyone to build software by describing what they want in natural language. But "possible" ≠ "accessible." Three walls stop non-technical people from actually shipping:

**Wall 1 — "What do I even type?"**
Claude Code is a blank terminal. No onboarding, no guidance, no structure. Technical users know how to decompose "build me a SaaS" into actionable steps. Non-technical users freeze.

**Wall 2 — "Is this working?"**
Build errors, type mismatches, missing env vars — developers debug these reflexively. Non-technical users see red text and panic. There's no health check, no progress indicator, no "you're on track."

**Wall 3 — "I forgot where I was."**
Claude Code is stateless. Every session starts from zero. Developers write their own "continue from where I left off" prompts. Non-technical users can't. Two days away = lost context = starting over.

### What SuperAgents Does Today

SuperAgents v1 solves the **configuration problem**: it scans a project, recommends AI agents and skills, and generates a `.claude/` folder. This is necessary but insufficient. It's like configuring a race car's engine — useful only if the driver knows how to drive.

### What SuperAgents Must Become

SuperAgents must evolve from a **config generator** into a **project launcher** — the tool that takes someone from "I have an idea" to "my app is live" by providing not just the team, but the playbook, the guardrails, and the memory.

---

## 2. Vision

**Anyone can build software. SuperAgents gives you the AI team and the playbook.**

SuperAgents is not competing with developer infrastructure (Entire, GitHub, Vercel). It's competing with the fear of starting. Every non-technical founder, designer, or product person who has an idea but doesn't know how to begin — that's our user.

### Strategic Position

```
Entire:        captures what happened AFTER agents write code (sessions, context, attribution)
SuperAgents:   configures what happens BEFORE and guides what happens DURING
```

Complementary, not competitive. Entire is for engineering teams managing fleets of agents. SuperAgents is for the solo builder who needs a co-pilot, not a dashboard.

---

## 3. Target Users

### Primary: The Non-Technical Builder

**Persona: Maria — Product Manager at a startup**

- Has shipped PRDs, wireframes, and specs her whole career
- Wants to prototype her side project without hiring a developer
- Installed Claude Code because a friend recommended it
- Opened the terminal, typed "help", got nothing useful, closed it

**What Maria needs:** A structured path from idea to working app. Not a blank canvas — a guided experience with clear next steps at every point.

### Secondary: The Junior Developer

**Persona: Luca — Bootcamp graduate, 6 months of experience**

- Can write basic React but doesn't know architecture patterns
- Uses Claude Code but gets inconsistent results
- Doesn't know how to structure a CLAUDE.md or configure agents
- Spends more time fixing Claude's mistakes than building features

**What Luca needs:** Opinionated setup that enforces good patterns. Expert-backed agents that produce consistent, production-quality code.

### Tertiary: The Experienced Developer

**Persona: Sara — Senior engineer, 8 years of experience**

- Uses Claude Code daily, has hand-crafted her own CLAUDE.md
- Knows what she wants but spends 30 min configuring every new project
- Wants a faster starting point she can customize

**What Sara needs:** Fast, high-quality config generation. Lean output. No bloat. Ability to customize and extend.

---

## 4. Success Metrics

### North Star Metric

**Projects that ship** — number of SuperAgents-configured projects that reach a deployed state (detected via Vercel, Railway, or similar deploy events).

### Primary Metrics

| Metric                        | Current (v1) | Target (v2) | Measurement                                                                                |
| ----------------------------- | ------------ | ----------- | ------------------------------------------------------------------------------------------ |
| First-session retention       | Unknown      | 60%+        | % of users who open Claude Code after `superagents` and complete 1+ task                   |
| Config quality score          | N/A          | 85%+        | Automated test: generated config follows lean principles (token budget, no contradictions) |
| Time to first working feature | Unknown      | < 30 min    | From `superagents` to first visible UI output                                              |
| Weekly active projects        | Unknown      | 1,000+      | Projects with Claude Code activity using SuperAgents config                                |

### Secondary Metrics

| Metric                    | Target                               | Why it matters                                 |
| ------------------------- | ------------------------------------ | ---------------------------------------------- |
| Agent invocation rate     | 40%+ sessions use an agent           | Validates agents add value vs. raw Claude Code |
| Slash command usage       | 3+ uses per session                  | Validates guided workflows help users          |
| Blueprint adoption        | 30%+ of new projects use a blueprint | Validates structured starting points           |
| Context window efficiency | < 3,000 active tokens from config    | Validates lean generation                      |

### Anti-Metrics (What We Don't Optimize For)

- **Number of agents generated** — more agents ≠ better. We optimize for fewer, higher-quality agents.
- **Number of skills generated** — same principle.
- **Config file size** — bigger configs actively hurt performance. Less is more.

---

## 5. Phases & Features

---

### Phase 1: Quality & Guided Launch (Now → 8 weeks)

**Theme:** Make the existing tool produce excellent output and guide users into their first session.

---

#### F1.1 — Lean Config Generation

**As a** developer setting up a new project
**I want** SuperAgents to generate minimal, high-quality configs
**So that** Claude Code follows my instructions reliably instead of drowning in generic bloat

**Acceptance Criteria:**

- Given a TypeScript + Next.js + Supabase project
  When SuperAgents generates the config
  Then CLAUDE.md is ≤ 700 tokens with only project-specific rules

- Given any generated agent file
  When measured against the "Would Claude Know This?" test
  Then 0 lines contain generic framework tutorials (HTTP methods, React basics, etc.)

- Given a project that uses Supabase but NOT Prisma
  When SuperAgents generates the config
  Then CLAUDE.md includes "No Prisma" as a negative constraint
  And no agent or skill references Prisma

- Given any generated config
  When all files are loaded simultaneously
  Then total active context is < 3,000 tokens (excluding docs/ files)

**Out of scope:** Changing the CLI flow or adding new features. This is purely about output quality.

**Success metric:** Config quality score ≥ 85% on automated lint.

---

#### F1.2 — Permissions & Security Defaults

**As a** developer using Claude Code
**I want** SuperAgents to generate permissions in settings.json
**So that** Claude doesn't ask me to approve every file read and bash command

**Acceptance Criteria:**

- Given a detected `package.json` with pnpm
  When settings.json is generated
  Then `permissions.allow` includes `Bash(pnpm *)`
  And `permissions.deny` includes `Bash(pnpm publish *)`

- Given a detected `.env` file
  When settings.json is generated
  Then `permissions.deny` includes `Read(.env*)`

- Given a detected git repository
  When settings.json is generated
  Then `permissions.allow` includes `Bash(git status)`, `Bash(git diff *)`, `Bash(git log *)`, `Bash(git add *)`
  And `permissions.deny` includes `Bash(git push *)`, `Bash(git checkout main)`

- Given any generated settings.json
  When `permissions.deny` is checked
  Then `Bash(rm -rf *)` is always present

**Out of scope:** Custom permission prompts in CLI. Infer from project, don't ask.

**Success metric:** 80% reduction in Claude Code permission prompts per session.

---

#### F1.3 — Stop Hook for Auto-Formatting

**As a** developer
**I want** Claude Code to auto-lint and format after every change
**So that** code style is enforced deterministically, not via LLM instructions

**Acceptance Criteria:**

- Given a project with ESLint detected
  When settings.json is generated
  Then a Stop hook exists with `{lint_command} --fix --quiet 2>/dev/null; exit 0`

- Given a project with Prettier detected
  When settings.json is generated
  Then the Stop hook includes the format command

- Given the hook runs and lint has warnings (not errors)
  When Claude completes a task
  Then the hook exits 0 and does not block Claude

**Out of scope:** Pre-commit hooks, CI integration.

**Success metric:** 0% of generated configs contain code style rules in CLAUDE.md.

---

#### F1.4 — First Prompt Guidance

**As a** non-technical user who just ran `superagents`
**I want** to know exactly what to type first in Claude Code
**So that** I don't stare at a blank terminal wondering what to do

**Acceptance Criteria:**

- Given SuperAgents has finished generating
  When the success message is displayed
  Then it includes a "Your first prompt" section with a copy-pasteable prompt
  And the prompt references the project's actual CLAUDE.md/ROADMAP

- Given the user is building a new project (no existing code)
  When the first prompt is generated
  Then it says something like: `"Read CLAUDE.md, then set up the project structure with [detected framework]. Start with the file structure and basic layout."`

- Given the user is configuring an existing project
  When the first prompt is generated
  Then it says: `"Read CLAUDE.md, explore the codebase, and tell me what you see. Then let's work on [detected priority]."`

**Out of scope:** Multi-step prompt sequences (that's Phase 1.6). Just the first one.

**Success metric:** First-session retention ≥ 50%.

---

#### F1.5 — Agent & Skill Reduction Logic

**As a** user selecting my AI team
**I want** SuperAgents to recommend only agents that will meaningfully improve my output
**So that** I don't waste context window on generic roles Claude already handles natively

**Acceptance Criteria:**

- Given any project type
  When agents are recommended
  Then the recommended set is 2-4 agents, never more than 5
  And `debugger`, `docs-writer`, and `code-reviewer` are NEVER auto-recommended (available as opt-in only)

- Given a selected agent
  When the agent file is generated
  Then it is 200-400 tokens, contains only project-specific constraints
  And every line passes the "Would Claude Know This?" test

- Given skills are being recommended
  When a testing agent is selected AND Vitest is in dependencies
  Then the `vitest` skill is auto-attached without requiring manual selection

- Given detected dependencies
  When skills are recommended
  Then only skills matching actual dependencies are suggested
  And skills are consolidated (e.g., `shadcn` + `tailwind` → single `ui` skill) when they overlap

**Out of scope:** Custom agent creation by users (that's Phase 3).

**Success metric:** Average agents per project drops from 6 to 3. Total config tokens drops 80%.

---

#### F1.6 — Slash Commands Generation

**As a** non-technical user in a Claude Code session
**I want** pre-built slash commands that help me navigate common tasks
**So that** I don't have to know developer terminology to get things done

**Acceptance Criteria:**

- Given SuperAgents has finished generating
  When `.claude/commands/` is checked
  Then it contains at minimum: `status.md`, `fix.md`, `next.md`, `ship.md`

- Given the user types `/status` in Claude Code
  When the command executes
  Then Claude reads the codebase and reports what's built, what's broken, and what's next — in plain language

- Given the user types `/fix` in Claude Code
  When the command executes
  Then Claude checks for build errors, type errors, and lint errors, and fixes them

- Given the user types `/next` in Claude Code
  When the command executes
  Then Claude reads CLAUDE.md (and ROADMAP.md if present) and suggests the next task

- Given the user types `/ship` in Claude Code
  When the command executes
  Then Claude runs build, fixes errors, runs tests, and prepares for deployment

**Out of scope:** `/deploy` (too dangerous without guardrails). `/explain` (nice-to-have, not MVP).

**Command definitions:**

```markdown
# /status — status.md

Read the project structure, check for build errors (`{build_command}`), and report:

1. What features/pages exist and are working
2. What's broken (build errors, missing env vars, type errors)
3. What's next based on CLAUDE.md or ROADMAP.md
   Report in plain language. No jargon. Use ✅ and ❌ indicators.

# /fix — fix.md

1. Run `{build_command}` and capture errors
2. Run `{lint_command}` and capture errors
3. Fix all errors you find
4. Run build again to verify
5. Report what was fixed

# /next — next.md

Read CLAUDE.md and ROADMAP.md (if exists). Based on current project state:

1. What has already been built? (check existing files)
2. What is the next logical step?
3. Describe the task clearly and ask if I should proceed.

# /ship — ship.md

1. Run `{build_command}` — fix any errors
2. Run `{test_command}` — fix any failures
3. Run `{lint_command} --fix`
4. `git add -A && git status` — show what will be committed
5. Suggest a commit message based on changes
6. STOP and ask for confirmation before committing
```

**Success metric:** Slash command usage ≥ 3 per session for non-technical users.

---

#### F1.7 — MCP Server Suggestions

**As a** developer setting up Claude Code
**I want** SuperAgents to suggest relevant MCP servers based on my stack
**So that** I can extend Claude's capabilities without researching what's available

**Acceptance Criteria:**

- Given Supabase is detected in the project
  When SuperAgents finishes generation
  Then a `SETUP.md` is created with the Supabase MCP install command

- Given Vercel is detected (vercel.json or similar)
  When SETUP.md is created
  Then it includes the Vercel MCP install command with `--scope user` recommendation

- Given a GitHub remote exists
  When SETUP.md is created
  Then it includes the GitHub MCP install command

- Given any project
  When SETUP.md is created
  Then it always includes Context7 (live docs) as a recommended MCP

**MCP mapping:**

| Detection Signal                      | MCP Server       | Command                                                                   |
| ------------------------------------- | ---------------- | ------------------------------------------------------------------------- |
| `supabase` in deps or `supabase/` dir | Supabase MCP     | `claude mcp add supabase --transport http "https://mcp.supabase.com/mcp"` |
| `vercel.json` or `@vercel/*` in deps  | Vercel MCP       | `claude mcp add vercel --transport http https://mcp.vercel.com/mcp`       |
| `.git` directory with remote          | GitHub MCP       | `claude mcp add github -- npx -y @modelcontextprotocol/server-github`     |
| Any Next.js 16+ project               | Next.js DevTools | `claude mcp add next-devtools -- npx -y next-devtools-mcp@latest`         |
| Always                                | Context7         | `claude mcp add context7 -- npx -y @upstash/context7-mcp@latest`          |
| Linear references in project          | Linear MCP       | `claude mcp add linear --transport sse https://mcp.linear.app/sse`        |

**Out of scope:** Auto-installing MCP servers (requires auth flows). Just suggest.

**Success metric:** 40% of users install at least 1 suggested MCP within 7 days.

---

### Phase 2: Project Blueprints (Weeks 9–16)

**Theme:** Structured starting points that decompose "I want to build X" into phased, executable plans.

---

#### F2.1 — Blueprint System

**As a** non-technical user starting a new project
**I want** to choose a project template that comes with a phased roadmap
**So that** I know exactly what to build first, second, and third — and Claude knows too

**Acceptance Criteria:**

- Given the user runs `superagents`
  When they describe a new project (no existing code)
  Then they're offered matching blueprints: "This sounds like a [SaaS Dashboard]. Start with this blueprint?"

- Given a blueprint is selected
  When the config is generated
  Then a `ROADMAP.md` is created with 3-5 phases, each containing 3-5 concrete tasks
  And each task has clear completion criteria Claude can verify

- Given Phase 1 of a ROADMAP.md
  When the user types `/next`
  Then Claude suggests the first incomplete task from Phase 1

**Initial Blueprints (5):**

| Blueprint                   | Description                     | Phases                                                                                  |
| --------------------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| **SaaS Dashboard**          | Auth + DB + Dashboard + Billing | 1. Auth & DB schema → 2. Core pages → 3. Data & API → 4. Billing → 5. Polish            |
| **Landing Page + Waitlist** | Marketing site + email capture  | 1. Layout & hero → 2. Sections → 3. Waitlist form → 4. Analytics → 5. Launch            |
| **API Backend**             | REST API + docs + auth          | 1. Project setup → 2. Core endpoints → 3. Auth → 4. Docs → 5. Deploy                    |
| **Internal Tool**           | Admin panel + CRUD + data views | 1. Auth & layout → 2. Data tables → 3. CRUD forms → 4. Filters & search → 5. Export     |
| **Marketplace**             | Two-sided platform              | 1. Auth & profiles → 2. Listings → 3. Search & discovery → 4. Transactions → 5. Reviews |

**Out of scope:** Blueprint creation by users (Phase 3). Custom blueprints beyond the initial 5.

**Success metric:** 30% of new projects use a blueprint. Time to first feature < 30 min for blueprint users.

---

#### F2.2 — ROADMAP.md Standard

**As a** user working through a blueprint
**I want** a structured roadmap Claude can read, track, and update
**So that** progress is visible and Claude knows what to do next

**Acceptance Criteria:**

- Given a generated ROADMAP.md
  When Claude reads it
  Then each task has: description, completion check (file or feature to verify), status (todo/done)

- Given a user completes a task
  When they type `/status`
  Then Claude checks the completion criteria and marks completed tasks in ROADMAP.md

**ROADMAP.md format:**

```markdown
# Project Roadmap

## Phase 1: Foundation

- [x] Set up project structure (verify: `src/app/layout.tsx` exists)
- [x] Configure Supabase auth (verify: `src/lib/supabase/` exists)
- [ ] Create database schema (verify: `supabase/migrations/` has files)
- [ ] Build login/signup pages (verify: `src/app/(auth)/` has pages)

## Phase 2: Core Features

- [ ] Dashboard layout (verify: `src/app/(dashboard)/page.tsx` exists)
- [ ] Data tables (verify: build passes, `/dashboard` renders)
      ...
```

**Success metric:** 70% of blueprint users reach Phase 2.

---

#### F2.3 — `superagents status` CLI Command

**As a** non-technical user
**I want** to check my project's health from the terminal without opening Claude
**So that** I know if my project is in a good state before starting a new session

**Acceptance Criteria:**

- Given the user runs `superagents status` in a project with a ROADMAP.md
  When the command executes
  Then it shows: phases completed, current phase progress, build status (pass/fail), last modified time

- Given the project has build errors
  When `superagents status` runs
  Then it shows "⚠️ Build has errors — run `/fix` in Claude Code to resolve"

- Given no ROADMAP.md exists
  When `superagents status` runs
  Then it shows basic project stats: files, framework detected, last modified

**Output format:**

```
📊 Project Status: my-saas-app
   Phase 1: Foundation ████████░░ 80% (4/5 tasks)
   Build: ✅ passing
   Last session: 2 hours ago

   Next task: Create database schema
   Start with: "Read ROADMAP.md and work on the database schema task in Phase 1"
```

**Success metric:** 25% of users run `superagents status` at least once per week.

---

### Phase 3: Session Memory & Continuity (Weeks 17–24)

**Theme:** Solve the "I forgot where I was" problem. Make projects resumable.

---

#### F3.1 — Session Summaries

**As a** user returning to a project after a break
**I want** Claude to know what we did last time
**So that** I don't have to re-explain context or remember where I left off

**Acceptance Criteria:**

- Given a SuperAgents-configured project
  When a Claude Code session ends (user exits)
  Then a `docs/sessions/YYYY-MM-DD.md` file is created with: what was built, decisions made, errors encountered, next steps

- Given the user starts a new Claude Code session
  When Claude reads CLAUDE.md
  Then CLAUDE.md points to `docs/sessions/` for recent context
  And the `/next` command reads the latest session summary

- Given 5+ session summaries exist
  When a new session starts
  Then only the last 3 are loaded (to stay within context budget)

**Implementation:** Generate a Stop hook that triggers a summary after each session using Claude itself.

**Out of scope:** Integration with Entire's checkpoint system (that's Phase 4). Automatic session capture without hooks.

**Success metric:** Returning user retention (sessions after 48h+ gap) increases by 40%.

---

#### F3.2 — Evolving Config

**As a** user whose project has grown significantly since initial setup
**I want** to update my SuperAgents config to reflect the current state
**So that** Claude's context stays relevant as the project evolves

**Acceptance Criteria:**

- Given the user runs `superagents evolve`
  When SuperAgents re-scans the codebase
  Then it detects new dependencies, new directories, and new patterns
  And proposes updates to CLAUDE.md, agents, and skills

- Given the project added Stripe (new dependency since initial scan)
  When `superagents evolve` runs
  Then it suggests adding Stripe-related constraints and possibly a payment-related skill

- Given the ROADMAP.md has all Phase 1 tasks marked complete
  When `superagents evolve` runs
  Then it suggests updating the ROADMAP focus to Phase 2

**Out of scope:** Auto-applying changes. Always show diff and ask for confirmation.

**Success metric:** 20% of projects run `superagents evolve` at least once.

---

#### F3.3 — Plain Language Error Recovery

**As a** non-technical user who sees an error
**I want** Claude to explain what's wrong in plain language and fix it
**So that** I don't have to understand error messages to keep building

**Acceptance Criteria:**

- Given the `/fix` command is run
  When build errors are found
  Then Claude explains each error in one sentence of plain language before fixing it
  And uses analogies when helpful ("This is like a missing puzzle piece — the database doesn't have a table for users yet")

- Given an env var is missing (e.g., `SUPABASE_URL`)
  When `/fix` detects it
  Then Claude explains: "Your project needs a database connection. You'll need to set up a Supabase project and add the URL. Here's how..."
  And provides step-by-step guidance

**Out of scope:** Auto-provisioning infrastructure. Just explain and guide.

**Success metric:** Non-technical users self-resolve 60%+ of build errors using `/fix`.

---

### Phase 4: Platform & Ecosystem (Weeks 25–40)

**Theme:** Turn SuperAgents into a distribution platform for AI-native project knowledge.

---

#### F4.1 — Blueprint Marketplace

**As a** professional developer in the Cosmico community
**I want** to create and share project blueprints
**So that** others can start projects using my battle-tested patterns

**Acceptance Criteria:**

- Given a developer runs `superagents publish`
  When they have a working project with CLAUDE.md + ROADMAP.md
  Then their blueprint is packaged and uploaded to the SuperAgents registry

- Given a user runs `superagents use @cosmico/saas-starter`
  When the blueprint is fetched
  Then the full config (CLAUDE.md, agents, skills, ROADMAP.md, commands) is installed locally

- Given a blueprint has been published
  When another user installs it
  Then the original author is attributed and can track installs

**Pricing model:** Free blueprints for community growth. Premium blueprints by verified Cosmico professionals (revenue share).

**Success metric:** 50+ blueprints published. 500+ blueprint installs per month.

---

#### F4.2 — Entire Integration

**As a** user building with SuperAgents
**I want** my AI sessions captured automatically
**So that** when I hand off the project (or return after weeks), the full context is preserved

**Acceptance Criteria:**

- Given the user runs `superagents init --with-entire`
  When the project is set up
  Then both `.claude/` AND Entire checkpoints are configured in one command

- Given an Entire-enabled project
  When session summaries are generated
  Then they reference Entire checkpoint IDs for full transcript access

- Given a project handoff from a non-technical founder to a Cosmico developer
  When the developer opens the project
  Then they have: CLAUDE.md (current context), ROADMAP.md (what's planned), session summaries (what was built and why), Entire checkpoints (full transcripts)

**Out of scope:** Building our own checkpoint system. We integrate, not rebuild.

**Success metric:** 15% of SuperAgents projects use Entire integration.

---

#### F4.3 — Team Handoff Protocol

**As a** non-technical founder who built a v1 with SuperAgents
**I want** to hand my project to a professional developer with full context
**So that** they can continue building without a lengthy onboarding process

**Acceptance Criteria:**

- Given a user runs `superagents handoff`
  When the command executes
  Then it generates a `HANDOFF.md` that includes: project description, what was built (from ROADMAP.md), key decisions (from session summaries), current state (from superagents status), what's next

- Given a Cosmico developer receives a handoff
  When they run `superagents evolve` on the project
  Then the config is updated for their expertise level (more technical agents, fewer guardrails)

**Cosmico integration:** This feature directly feeds Cosmico's TaaS pipeline. Non-technical founders build v1 → hit a wall → hand off to a Cosmico professional with full context preserved.

**Success metric:** 10+ handoffs per month from SuperAgents users to Cosmico professionals.

---

## 6. Technical Architecture

### System Overview

```
superagents CLI
├── analyzer/          # Codebase detection (exists)
├── generator/         # AI generation (exists, needs quality refactor)
├── blueprints/        # Blueprint templates + ROADMAP generation (NEW)
├── commands/          # Slash command templates (NEW)
├── status/            # Project health checker (NEW)
├── evolve/            # Config evolution engine (NEW)
├── publish/           # Blueprint publishing (Phase 4)
└── templates/         # Agent + skill templates (exists, needs lean refactor)
```

### Dependencies

| Dependency          | Purpose        | Phase    |
| ------------------- | -------------- | -------- |
| `@anthropic-ai/sdk` | AI generation  | Existing |
| `@clack/prompts`    | CLI UI         | Existing |
| `commander`         | CLI framework  | Existing |
| `cosmiconfig`       | Config loading | Existing |
| `zod`               | Validation     | Existing |
| `glob`              | File scanning  | Existing |

### Key Design Decisions

1. **No new runtime dependencies in Phase 1.** Quality improvements only.
2. **Blueprints are static markdown files** with variables, not complex template engines.
3. **Session summaries use Claude Code hooks**, not a background daemon.
4. **Entire integration is optional** and never required for core functionality.
5. **All generated files are human-readable markdown.** No proprietary formats.

---

## 7. Rollout Plan

| Phase       | Duration | Key Deliverable                              | Gate to Next Phase                                        |
| ----------- | -------- | -------------------------------------------- | --------------------------------------------------------- |
| **Phase 1** | 8 weeks  | Lean configs + slash commands + first prompt | Config quality score ≥ 85%, first-session retention ≥ 50% |
| **Phase 2** | 8 weeks  | 5 blueprints + ROADMAP + status command      | 30% blueprint adoption, time to first feature < 30 min    |
| **Phase 3** | 8 weeks  | Session summaries + evolve command           | Returning retention +40%, 20% evolve usage                |
| **Phase 4** | 16 weeks | Marketplace + Entire integration + handoff   | 50+ blueprints, 10+ handoffs/month                        |

### Phase 1 Sprint Breakdown

| Sprint          | Focus             | Deliverables                                                                             |
| --------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| Sprint 1 (w1-2) | Config quality    | Lean CLAUDE.md generation, agent/skill token reduction, "Would Claude Know This?" filter |
| Sprint 2 (w3-4) | Settings & hooks  | Permissions generation, Stop hook, deny rules, stack-aware inference                     |
| Sprint 3 (w5-6) | Guided experience | First prompt guidance, slash command generation, agent reduction logic                   |
| Sprint 4 (w7-8) | Polish & measure  | MCP suggestions, SETUP.md, automated quality scoring, metrics baseline                   |

---

## 8. Risks & Mitigations

| Risk                                                               | Likelihood | Impact | Mitigation                                                                                                                                                   |
| ------------------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Non-technical users still can't use Claude Code even with guidance | High       | High   | Slash commands reduce the "what to type" problem. Blueprint roadmaps decompose work. If still too hard, consider a web-based wrapper in Phase 4.             |
| Claude Code changes its config format                              | Medium     | High   | Abstract config generation behind an adapter. Monitor Claude Code changelogs.                                                                                |
| Entire becomes competitive (adds config generation)                | Low        | Medium | Our value is in the guided experience for non-technical users, not config generation alone. Entire's user is the engineering team, ours is the solo builder. |
| Blueprint quality varies (marketplace)                             | Medium     | Medium | Curation by Cosmico team. Rating system. Verified author badges for Cosmico professionals.                                                                   |
| Context window limits tighten further                              | Low        | High   | Our lean-first approach is already optimized for this. We win if context windows shrink.                                                                     |

---

## 9. What We're NOT Building

- **An IDE.** Claude Code is the IDE. We configure it.
- **A hosting platform.** Vercel, Railway, Supabase handle this. We suggest, not manage.
- **A checkpoint system.** Entire does this. We integrate.
- **A no-code builder.** Users still type prompts. We make the prompts obvious.
- **A project management tool.** ROADMAP.md is lightweight by design. Not Jira.

---

## 10. Open Questions

| Question                                                                                      | Owner       | Deadline | Impact                        |
| --------------------------------------------------------------------------------------------- | ----------- | -------- | ----------------------------- |
| Should blueprints include starter code or just config + roadmap?                              | Product     | Week 8   | Phase 2 scope                 |
| How do we measure "project shipped" without deploy integration?                               | Engineering | Week 6   | North star metric feasibility |
| Should `superagents evolve` require AI generation (costs tokens) or use static analysis only? | Engineering | Week 14  | Phase 3 cost model            |
| How does blueprint pricing work with Cosmico's existing revenue model?                        | Business    | Week 20  | Phase 4 business model        |
| Should we build a web dashboard for project status, or keep it CLI-only?                      | Product     | Week 16  | Phase 3/4 scope expansion     |

---

_This PRD is a living document. Update as we validate assumptions and ship phases. Every feature ships only when its predecessor's gate metrics are met._
