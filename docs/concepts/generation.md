# Generation Process

Learn how SuperAgents generates context-aware configurations using AI and optimization techniques.

## Pipeline Architecture

SuperAgents follows a five-stage pipeline:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   CLI Input  │ -> │   Analyzer   │ -> │  Recommender │
│   (prompts)  │    │  (codebase)  │    │ (goal+code)  │
└──────────────┘    └──────────────┘    └──────────────┘
                                                │
                                                v
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    Writer    │ <- │  Generator   │    │  Recommender │
│  (.claude/)  │    │    (AI)      │    │ (continued)  │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 1. CLI Input

Collects information through interactive prompts:

- Authentication method (Claude Plan or API Key)
- Project goal (what you're building)
- Framework preferences (for new projects)
- Agent/skill selection

Uses @clack/prompts for a polished CLI experience.

### 2. Codebase Analysis

Analyzes your project to understand:

**Project Type Detection**
- Node.js (package.json present)
- Python (requirements.txt, pyproject.toml)
- Web (HTML files)
- Fullstack (multiple indicators)

**Framework Detection**

Supports 20+ frameworks:
- React (react in dependencies)
- Next.js (next.config.js)
- Express (express in dependencies)
- FastAPI (fastapi in requirements.txt)
- Vue, Svelte, Angular, and more

**Dependency Analysis**

Parses:
- package.json (JavaScript/TypeScript)
- requirements.txt, pyproject.toml (Python)
- Gemfile (Ruby)
- composer.json (PHP)

**Pattern Recognition**

Detects code patterns:
- API endpoints (Express routes, FastAPI endpoints)
- Database usage (Prisma schema, SQLAlchemy models)
- Testing setup (Vitest, Jest, pytest)
- Monorepo structure (workspaces, Turborepo, Nx)

**Performance**

Analysis takes 5-10 seconds and is cached for 24 hours.

### 3. Recommendation Engine

Combines goal and codebase analysis to recommend agents and skills.

**Scoring Algorithm**

Each potential recommendation gets a score:

```typescript
score = (goalMatch * 0.6) + (frameworkMatch * 0.3) + (patternMatch * 0.1)
```

- **goalMatch**: Keywords in your goal description
- **frameworkMatch**: Detected frameworks
- **patternMatch**: Code patterns found

**Agent Recommendations**

Example goal: "Build a REST API with authentication and testing"

Detected keywords: API, REST, authentication, testing

Recommended agents:
- backend-engineer (0.9 score) - "API", "REST"
- api-designer (0.85 score) - "API", "REST"
- security-analyst (0.7 score) - "authentication"
- testing-specialist (0.8 score) - "testing"

**Skill Recommendations**

Based on:
- Detected frameworks (package.json, imports)
- Goal keywords ("using React", "with Docker")
- Language indicators (tsconfig.json, .py files)

Example: React + TypeScript + Express detected

Recommended skills:
- typescript (framework detected)
- nodejs (framework detected)
- react (framework detected)
- express (framework detected)
- vitest (test framework pattern)

### 4. AI Generation

Generates agent and skill content using Claude API.

**Template vs AI Generation**

SuperAgents uses a two-tier approach:

| Method | Used For | Speed | Cost |
|--------|----------|-------|------|
| Local Templates | Built-in agents/skills | Instant | Free |
| AI Generation | Custom content, CLAUDE.md | 10-30s | API tokens |

31 built-in templates are included. No API call needed for standard agents and skills.

**AI Generation Process**

For custom content or CLAUDE.md:

1. Build prompt with context:
   - Project goal
   - Detected framework
   - Language
   - Dependencies
   - Selected agents/skills

2. Select model tier:
   - Haiku (simple tasks like skills)
   - Sonnet (complex tasks like custom agents)

3. Call Claude API with prompt caching

4. Parse and validate response

**Parallel Generation**

SuperAgents generates multiple items concurrently:

```typescript
// Up to 3 concurrent API calls
const results = await Promise.all([
  generateAgent('backend-engineer', context),
  generateAgent('frontend-specialist', context),
  generateSkill('typescript', context),
]);
```

This reduces total generation time by 3x.

**Tiered Models**

SuperAgents uses different Claude models based on complexity:

| Content | Model | Reason |
|---------|-------|--------|
| Skills | Haiku | Simple, structured content (80% cost savings) |
| Standard Agents | Sonnet | Moderate complexity |
| Custom Agents | Sonnet | Complex reasoning needed |
| CLAUDE.md | Sonnet | Project context requires nuance |

**Prompt Caching**

Claude API caching reduces costs on repeated requests:

- Codebase context marked as cacheable
- Common templates cached
- 40-50% token reduction on cache hits

Cache TTL: 5 minutes (API-managed)

### 5. Output Writing

Writes generated content to `.claude/` directory:

**Directory Structure**

```
.claude/
├── settings.json       # Configuration metadata
├── agents/             # Agent files
│   ├── backend-engineer.md
│   └── ...
├── skills/             # Skill files
│   ├── typescript.md
│   └── ...
└── hooks/
    └── skill-loader.sh # Skill invocation script
```

**CLAUDE.md**

Also creates/updates CLAUDE.md in project root:

```markdown
# Project Name

Project context and tech stack information.

## Tech Stack
...

## Coding Principles
...

## Skill Usage Guide
...
```

## Optimization Techniques

### 1. Caching Strategy

| Cache Type | TTL | Reduces |
|------------|-----|---------|
| Codebase Analysis | 24 hours | Analysis time |
| Generated Content | 7 days | API calls |

Cache location: `~/.superagents/cache/`

Example cache key for generation:

```
hash(goal + frameworkDetection + itemType + model)
```

Cache hit? Use cached content. Cache miss? Generate and cache.

### 2. Local Templates

31 built-in templates bundled with SuperAgents:
- 15 agent templates
- 16 skill templates

No API call needed for these. Instant generation.

### 3. Prompt Compression

Reduces prompt tokens by:
- Summarizing file lists instead of full content
- Extracting key patterns instead of all code
- Using structured data over prose

40-50% token reduction.

### 4. Parallel Generation

Multiple API calls in parallel (up to 3 concurrent).

Sequential: 30 seconds for 6 items
Parallel: 10 seconds for 6 items

### 5. Smart Model Selection

Use Haiku (fast, cheap) for simple tasks:
- Skill generation (structured output)
- Standard agent instantiation

Use Sonnet (powerful) for complex tasks:
- Custom agent creation
- CLAUDE.md generation

80% cost savings with tiered approach.

## Cost Estimation

Preview costs before generating:

```bash
superagents --dry-run
```

Shows:
- Estimated input tokens
- Estimated output tokens
- Approximate cost (API Key mode)

Example output:

```
Estimated Tokens:
  Input: 12,000 tokens
  Output: 8,000 tokens
  Total: 20,000 tokens

Estimated Cost: $0.15
  (3 Haiku calls, 2 Sonnet calls)
```

## Updating Generation

To regenerate content with new context:

```bash
superagents --update
```

Options:
1. Add/remove agents or skills (no regeneration)
2. Regenerate specific items
3. Regenerate everything

Cache is respected unless you force regeneration.

## Dry Run Mode

Preview generation without API calls:

```bash
superagents --dry-run
```

Shows:
- Detected codebase information
- Recommended agents and skills
- Template usage (which items use local templates)
- Estimated token usage and cost

No files are written. No API calls made.

## Verbose Mode

See detailed generation process:

```bash
superagents --verbose
```

Output includes:
- Detailed analysis results
- Recommendation scores
- Cache hit/miss for each item
- API request/response details
- Token usage per API call
- Generation timing

Useful for understanding recommendations or debugging.

## Generation Context

Each generated item receives context:

```typescript
interface GenerationContext {
  goal: string;              // Your project goal
  projectType: string;       // 'node', 'python', 'web', etc.
  framework?: string;        // 'React', 'Express', 'FastAPI', etc.
  language: string;          // 'TypeScript', 'Python', etc.
  dependencies: string[];    // Key dependencies
  agents: string[];          // Selected agents
  skills: string[];          // Selected skills
  patterns: string[];        // Detected code patterns
}
```

This context is used in:
- AI prompts for generation
- Template variable substitution
- CLAUDE.md content

## Next Steps

- [Caching](caching.md) - Learn about cache strategy
- [Agents](agents.md) - Understand agent generation
- [Skills](skills.md) - Understand skill generation
- [CLI Options](../reference/cli-options.md) - Generation command options
