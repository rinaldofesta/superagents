# SuperAgents

Generate context-aware Claude Code configurations for your project. SuperAgents analyzes your codebase and goals to recommend specialized AI agents with proven software engineering principles built in.

## Install

```bash
curl -fsSL https://superagents.playnew.com/install.sh | bash
```

Requires Node.js 20+. After installation, restart your terminal or run `source ~/.zshrc` (zsh) or `source ~/.bashrc` (bash).

Alternatively, install via npm:

```bash
npm install -g superagents
```

## Quick Start

Navigate to your project directory and run:

```bash
superagents
```

SuperAgents will:
1. Analyze your codebase (or guide you through setup for new projects)
2. Ask what you're building
3. Recommend agents and skills
4. Generate a `.claude/` configuration folder

## What You Get

```
project/
├── CLAUDE.md              # Project context
└── .claude/
    ├── settings.json      # Configuration
    ├── agents/            # Specialized AI agents
    ├── skills/            # Framework-specific knowledge
    └── hooks/
        └── skill-loader.sh
```

Each agent embodies principles from software engineering experts. Each skill contains framework patterns and best practices.

## Authentication

SuperAgents supports two authentication methods:

| Method | Setup | Use Case |
|--------|-------|----------|
| Claude Plan | Select in CLI | Claude Max subscribers |
| API Key | `export ANTHROPIC_API_KEY=sk-ant-...` | API users |

## Commands

```bash
superagents [options]        # Main generation flow
superagents update           # Update SuperAgents to latest version
superagents cache --stats    # Show cache statistics
superagents cache --clear    # Clear cached data
superagents templates --list # List available templates
superagents export [output]  # Export config to zip file
superagents import <source>  # Import config from zip file
```

### Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview without API calls |
| `-v, --verbose` | Show detailed output |
| `-u, --update` | Update existing config incrementally |
| `--version` | Show version number |
| `--help` | Show help |

## Agents

15 specialized agents built on industry-proven principles:

| Agent | Expert Source | Domain |
|-------|---------------|--------|
| backend-engineer | Uncle Bob | Clean Architecture & SOLID |
| frontend-specialist | Dan Abramov | React Patterns |
| code-reviewer | Google Engineering | Code Review Practices |
| debugger | Julia Evans | Systematic Debugging |
| devops-specialist | Kelsey Hightower | Infrastructure Patterns |
| security-analyst | OWASP Foundation | Security Best Practices |
| database-specialist | Martin Kleppmann | Data-Intensive Applications |
| api-designer | Stripe | API Design Principles |
| testing-specialist | Kent Beck | Test-Driven Development |
| docs-writer | Divio | Documentation System |
| performance-optimizer | Addy Osmani | Web Performance |
| copywriter | Paolo Gervasi | Conversion Copywriting |
| designer | Sarah Corti | UI/UX Design |
| architect | Martin Fowler | Enterprise Patterns |
| product-manager | Marty Cagan | Product Discovery |

All agents include Karpathy's 4 Coding Principles:
1. Think Before Coding
2. Simplicity First
3. Surgical Changes
4. Goal-Driven Execution

## Skills

16 framework-specific skills:

typescript, nodejs, react, nextjs, vue, tailwind, prisma, drizzle, express, supabase, vitest, graphql, docker, python, fastapi, mcp

Each skill provides framework patterns, common workflows, and documentation queries via Context7 MCP.

## How It Works

### New Projects

For empty or minimal directories, SuperAgents guides you through 4 questions:
1. What are you building?
2. What tech stack?
3. Primary focus (frontend/backend/fullstack/API)?
4. Key requirements (auth, payments, database, etc.)?

### Existing Codebases

1. Analyzes your codebase (detects 20+ frameworks)
2. Asks what you're building
3. Recommends agents and skills based on goal + codebase
4. Generates configuration

SuperAgents detects project types, frameworks, dependencies, and patterns automatically. It understands monorepos (npm/yarn/pnpm workspaces, Lerna, Turborepo, Nx).

## Smart Recommendations

SuperAgents parses your goal description to detect technologies:

```
? What are you building?
> A multi-tenant platform with FastAPI + React + PostgreSQL

Detected: FastAPI, React, PostgreSQL
Recommending: fastapi, python, react, typescript, prisma
Agents: backend-engineer, api-designer, frontend-specialist, database-specialist
```

Technology keywords include Python (FastAPI, Django, Flask), JavaScript/TypeScript (React, Next.js, Vue, Express, Node.js), databases (PostgreSQL, MySQL, MongoDB, Supabase), ORMs (Prisma, Drizzle), DevOps (Docker, Kubernetes), testing frameworks, and more.

## Custom Templates

Create your own agent and skill templates:

```bash
# List all templates
superagents templates --list

# Export built-in template for customization
superagents templates --export backend-engineer

# Import custom template
superagents templates --import ./my-agent.md --type agent

# Delete custom template
superagents templates --delete my-agent --type agent
```

Custom templates are stored in `~/.superagents/templates/`.

Templates support variable substitution: `{{goal}}`, `{{framework}}`, `{{language}}`, `{{dependencies}}`, `{{model}}`, `{{skills}}`.

## Export and Import

Share configurations with your team:

```bash
# Export
superagents export my-project-config.zip

# Preview before importing
superagents import config.zip --preview

# Import and overwrite
superagents import config.zip --force
```

## Incremental Updates

Update existing configurations without regenerating everything:

```bash
superagents --update
```

Add new agents/skills, remove unused ones, or regenerate `CLAUDE.md`.

## Performance

| Feature | Benefit |
|---------|---------|
| Parallel Generation | 3x faster with concurrent API calls |
| Tiered Models | Uses Haiku for simple tasks (80% cost savings) |
| Local Templates | 31 built-in templates (no API needed) |
| Codebase Caching | Skip re-analysis on unchanged projects (24h cache) |
| Response Caching | Reuse generated content (7-day cache) |
| Prompt Compression | 40-50% token reduction |
| Dry-Run Mode | Preview and estimate costs |

Cache location: `~/.superagents/cache/`

## Privacy and Security

- All analysis happens locally
- Only representative files sent to API
- Automatically excludes `.env`, credentials, secrets
- Respects `.gitignore`
- You control your API key

## Development

```bash
npm install        # Install dependencies
npm run dev        # Run in watch mode
npm run build      # Build for production
npm test           # Run tests
npm run type-check # Type check without emit
npm run lint       # Lint code
```

## License

MIT

## Contributing

Contributions are welcome. Read [CLAUDE.md](./CLAUDE.md) for project context and guidelines.
