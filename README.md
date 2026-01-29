# SuperAgents

> **Expert-Backed Claude Code Configuration Generator**

SuperAgents is an intelligent CLI tool that generates highly customized Claude Code configurations (agents, skills, and hooks) based on both your existing codebase AND your project goals. Each agent is built on principles from industry-leading experts like Uncle Bob, Dan Abramov, Martin Fowler, and more.

## ✨ Features

- 🎯 **Goal-First Approach** - Understands what you're building, not just what you have
- 🧠 **Expert-Backed Agents** - 15 agents built on principles from industry leaders
- 🔍 **Deep Codebase Analysis** - Detects 20+ frameworks automatically
- 🆕 **Smart Project Detection** - Guided setup for new projects, auto-analysis for existing codebases
- 📚 **16 Skill Templates** - Framework-specific best practices
- 🎨 **Beautiful CLI** - Interactive prompts with progress indicators
- ⚡ **Fast & Efficient** - Parallel generation, smart caching, tiered models
- 💾 **Smart Caching** - Caches analysis and responses for faster subsequent runs
- 📦 **Monorepo Support** - Detects npm/yarn/pnpm/lerna/turborepo/nx workspaces
- 🔄 **Incremental Updates** - Update existing configs without regenerating everything
- 📤 **Export/Import** - Share configurations with your team

## 🧠 Expert-Backed Agents

Every agent is built on principles from recognized industry experts:

| Agent | Expert | Domain |
|-------|--------|--------|
| **backend-engineer** | Uncle Bob (Robert C. Martin) | Clean Architecture & SOLID |
| **frontend-specialist** | Dan Abramov | React Patterns |
| **code-reviewer** | Google Engineering | Code Review Practices |
| **debugger** | Julia Evans | Systematic Debugging |
| **devops-specialist** | Kelsey Hightower | Infrastructure Patterns |
| **security-analyst** | OWASP Foundation | Security Best Practices |
| **database-specialist** | Martin Kleppmann | Data-Intensive Apps |
| **api-designer** | Stripe | API Design Principles |
| **testing-specialist** | Kent Beck | Test-Driven Development |
| **docs-writer** | Divio | Documentation System |
| **performance-optimizer** | Addy Osmani | Web Performance |
| **copywriter** | Paolo Gervasi | Conversion Copywriting |
| **designer** | Sarah Corti | UI/UX Design |
| **architect** | Martin Fowler | Enterprise Patterns |
| **product-manager** | Marty Cagan | Product Discovery |

All agents include **Karpathy's 4 Coding Principles** for systematic, high-quality code:
1. Think Before Coding
2. Simplicity First
3. Surgical Changes
4. Goal-Driven Execution

## 🚀 Installation

### One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/rinaldofesta/superagents/main/install.sh | bash
```

**Requirements:** Node.js 20+

After installation, restart your terminal or run:

```bash
source ~/.zshrc   # for zsh
source ~/.bashrc  # for bash
```

### Alternative: npm

```bash
npm install -g superagents
```

## 📖 Usage

Navigate to any project directory and run:

```bash
superagents
```

That's it! SuperAgents will guide you through the setup.

### CLI Options

```bash
superagents [options]

Options:
  --dry-run       Preview what would be generated without making API calls
  -v, --verbose   Show detailed output and debug information
  -u, --update    Update existing configuration incrementally
  --version       Show version number
  --help          Show help

Commands:
  superagents update              Update SuperAgents to latest version
  superagents cache --stats       Show cache statistics
  superagents cache --clear       Clear all cached data
  superagents templates --list    List all available templates
  superagents export [output]     Export configuration to zip file
  superagents import <source>     Import configuration from zip file
```

## 🔐 Authentication

SuperAgents supports two authentication methods:

| Method          | Command                               | Best For               |
| --------------- | ------------------------------------- | ---------------------- |
| **Claude Plan** | Select in CLI                         | Claude Max subscribers |
| **API Key**     | `export ANTHROPIC_API_KEY=sk-ant-...` | API users              |

## 🏗️ How It Works

### For New Projects (empty/minimal directory)

Guided spec gathering with 4 questions:
1. **What are you building?** - Your project vision
2. **What tech stack?** - Next.js, React+Node, Python+FastAPI, etc.
3. **Primary focus?** - Frontend, backend, fullstack, or API-only
4. **Key requirements?** - Auth, payments, real-time, database, external APIs

### For Existing Codebases

1. **Auto-Analyze** - Deep codebase scan with framework detection
2. **Ask Your Goal** - "What are you working on?"
3. **Smart Recommendations** - Expert-backed agents & skills based on goal + codebase
4. **Generate Configuration** - Custom `.claude/` folder with everything you need

### Output Structure

```
project/
├── CLAUDE.md              # Project overview with Karpathy principles
└── .claude/
    ├── settings.json      # Configuration
    ├── agents/            # Expert-backed agents
    │   ├── backend-engineer.md    (Uncle Bob's principles)
    │   ├── frontend-specialist.md (Dan Abramov's patterns)
    │   └── ...
    ├── skills/            # Framework-specific knowledge
    │   ├── react.md
    │   ├── typescript.md
    │   └── ...
    └── hooks/
        └── skill-loader.sh
```

## 💡 Example Usage

```bash
$ superagents

╔═══════════════════════════════════════════════════════════════╗
║   SUPERAGENTS                                                 ║
║   Expert-Backed Claude Code Configuration Generator           ║
║   Powered by principles from industry leaders                 ║
╚═══════════════════════════════════════════════════════════════╝

  Version 1.3.1

  Detected: Existing codebase

? What are you building?
> A SaaS analytics dashboard with React and Node.js

? Project type
> SaaS Dashboard (detected)

? Which AI model should we use?
> Claude Sonnet 4.5 (Fast & capable)

⠋ Analyzing codebase...
⠋ Generating recommendations...

┌  Expert-Backed Agents
│
│    ✓ frontend-specialist [Dan Abramov]
│       Dashboard UI development
│    ✓ backend-engineer [Uncle Bob]
│       API and data layer
│    ✓ designer [Sarah Corti]
│       UI/UX design and consistency
│
└

? Select agents (built on industry-leading principles)
> frontend-specialist, backend-engineer, designer, code-reviewer

✓ Generation complete! [100%]

✓ Success! Your expert-backed configuration is ready.

Created in: /path/to/your/project
  CLAUDE.md
  .claude/settings.json
  .claude/agents/ (4 files)
  .claude/skills/ (3 files)

Agents: (4) - Built on industry-leading principles
  ✓ frontend-specialist — Dan Abramov's React Patterns
  ✓ backend-engineer — Uncle Bob's Clean Architecture & SOLID
  ✓ designer — Sarah Corti's UI/UX Design
  ✓ code-reviewer — Google Engineering's Code Review Practices

Skills: (3) - Framework-specific best practices
  ✓ react
  ✓ typescript
  ✓ nodejs

What you get:
  • Agents trained on best practices from industry experts
  • Karpathy's 4 coding principles baked into every agent
  • Context-aware skills tailored to your stack

Next steps:
  1. cd your-project && claude to start coding
  2. /agent backend-engineer to switch agents
  3. Agents auto-apply expert principles to every task
```

## 🧠 Smart Recommendations

SuperAgents parses your goal description to detect technologies:

```
? What are you building?
> A multi-tenant platform with FastAPI + React + PostgreSQL

Detected technologies: FastAPI, React, PostgreSQL
→ Recommending: fastapi, python, react, typescript, prisma
→ Agents: backend-engineer, api-designer, frontend-specialist, database-specialist
```

Supported technology keywords include:
- **Python**: FastAPI, Django, Flask, pytest
- **JavaScript/TypeScript**: React, Next.js, Vue, Nuxt, Express, Node.js
- **Databases**: PostgreSQL, MySQL, MongoDB, Redis, Supabase
- **ORMs**: Prisma, Drizzle
- **DevOps**: Docker, Kubernetes, AWS, GCP, Azure
- **Styling**: Tailwind, styled-components
- **Testing**: Vitest, Jest, Playwright
- **API**: GraphQL, REST
- And many more...

## 📦 Monorepo Support

SuperAgents automatically detects monorepos:

| Tool | Detection |
|------|-----------|
| npm/yarn workspaces | `package.json` workspaces field |
| pnpm | `pnpm-workspace.yaml` |
| Lerna | `lerna.json` |
| Turborepo | `turbo.json` |
| Nx | `nx.json` |

## 🎨 Custom Templates

Create your own agent and skill templates:

```bash
# List all templates (built-in + custom)
superagents templates --list

# Export a built-in template for customization
superagents templates --export backend-engineer

# Import a custom template
superagents templates --import ./my-agent.md --type agent

# Delete a custom template
superagents templates --delete my-agent --type agent
```

Custom templates location: `~/.superagents/templates/`

Templates support variable substitution:
- `{{goal}}` - User's goal description
- `{{framework}}` - Detected framework
- `{{language}}` - Primary language
- `{{dependencies}}` - Key dependencies
- `{{model}}` - Selected AI model
- `{{skills}}` - Selected skills

## 📤 Export & Import

Share configurations with your team:

```bash
# Export current configuration
superagents export my-project-config.zip

# Preview a config before importing
superagents import config.zip --preview

# Import and overwrite existing
superagents import config.zip --force
```

## 🔄 Incremental Updates

Update existing configurations without regenerating everything:

```bash
superagents --update
```

Options:
- **Add new agents/skills** - Select from available templates
- **Remove agents/skills** - Clean up unused configurations
- **Regenerate CLAUDE.md** - Update project context

## 🎯 Supported Project Types

- **SaaS Dashboard** - Analytics, metrics, admin panels
- **E-Commerce** - Online stores, marketplaces
- **Content Platform** - Blogs, CMS, publishing
- **API Service** - REST/GraphQL APIs, microservices
- **Mobile App** - iOS, Android, React Native
- **CLI Tool** - Command-line utilities
- **Data Pipeline** - ETL, data processing
- **Auth Service** - Authentication, user management
- **Custom** - Anything else!

## 📚 Built-in Templates

### Agents (15)
- **Core**: backend-engineer, frontend-specialist, code-reviewer, debugger
- **Infrastructure**: devops-specialist, security-analyst, database-specialist
- **Specialized**: api-designer, testing-specialist, docs-writer, performance-optimizer
- **Product**: copywriter, designer, architect, product-manager

### Skills (16)
- typescript, nodejs, react, nextjs, vue, tailwind
- prisma, drizzle, express, supabase, vitest
- graphql, docker, python, fastapi, mcp

## ⚡ Performance & Cost Optimization

| Feature | Benefit |
|---------|---------|
| **Parallel Generation** | 3x faster with concurrent API calls |
| **Tiered Models** | Uses Haiku for simple tasks (~80% cost savings) |
| **Local Templates** | 31 built-in templates (no API needed) |
| **Codebase Caching** | Skip re-analysis on unchanged projects (24h cache) |
| **Response Caching** | Reuse generated content for same goal/codebase (7-day cache) |
| **Prompt Compression** | ~40-50% token reduction |
| **Dry-Run Mode** | Preview & estimate costs before generation |

Cache location: `~/.superagents/cache/`

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in watch mode
npm run dev

# Build (includes template copying)
npm run build

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

## 🔒 Privacy & Security

- **Local-First** - All analysis happens on your machine
- **Smart Sampling** - Only representative files sent to API
- **Excludes Secrets** - Automatically skips `.env`, credentials, etc.
- **Respects .gitignore** - Won't scan ignored files
- **You Control API Key** - Use your own Anthropic API key

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read [CLAUDE.md](./CLAUDE.md) first.

## 🌟 Star History

If you find this useful, please star the repo!

---

**Built with expert principles for the Claude Code community**
