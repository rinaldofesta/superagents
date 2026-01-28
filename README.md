# SuperAgents

> **Context-Aware Claude Code Configuration Generator**

SuperAgents is an intelligent CLI tool that generates highly customized Claude Code configurations (agents, skills, and hooks) based on both your existing codebase AND your project goals. Unlike traditional analyzers that only look at what you have, SuperAgents asks "What are you building?" to create forward-looking configurations that help you achieve your goals faster.

## ✨ Features

- 🎯 **Goal-First Approach** - Understands what you're building, not just what you have
- 🔍 **Deep Codebase Analysis** - Detects 20+ frameworks automatically
- 🤖 **Smart Agent Selection** - Context-aware recommendations based on your goals
- 📚 **100+ Skill Library** - Only relevant skills installed
- 🎨 **Beautiful CLI** - Interactive prompts with progress indicators
- 🔒 **Privacy-First** - Local processing, smart file sampling
- ⚡ **Fast & Efficient** - Parallel generation, smart caching, tiered models
- 💾 **Smart Caching** - Caches analysis and responses for faster subsequent runs
- ✅ **Input Validation** - Clear error messages prevent runtime failures
- 🖥️ **Multi-IDE Support** - Works with Claude Code and Cursor
- 📦 **Monorepo Support** - Detects npm/yarn/pnpm/lerna/turborepo/nx workspaces
- 🔄 **Incremental Updates** - Update existing configs without regenerating everything
- 📤 **Export/Import** - Share configurations with your team

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

### Examples

```bash
# Standard run
superagents

# Preview without API calls (see cost estimate)
superagents --dry-run

# Verbose mode with debug information
superagents --verbose

# Update existing configuration (add/remove agents/skills)
superagents --update

# Check cache status
superagents cache --stats

# List available templates
superagents templates --list

# Export config to share with team
superagents export my-config.zip

# Import shared config
superagents import my-config.zip
```

## 🖥️ IDE Support

SuperAgents supports multiple IDEs:

| IDE | Output Location | Format |
|-----|-----------------|--------|
| **Claude Code** | `.claude/` + `CLAUDE.md` | Markdown |
| **Cursor** | `.cursor/rules/` | `.mdc` files |

When you run SuperAgents, you'll be asked which IDE you're using:

```
? Which IDE are you using?
> Claude Code (Official Anthropic CLI)
  Cursor (AI-powered code editor)
```

## 🔐 Authentication

SuperAgents supports two authentication methods:

| Method          | Command                               | Best For               |
| --------------- | ------------------------------------- | ---------------------- |
| **Claude Plan** | Select in CLI                         | Claude Max subscribers |
| **API Key**     | `export ANTHROPIC_API_KEY=sk-ant-...` | API users              |

For Cursor users, authentication is optional - you can use template-only mode without an API key.

## 🏗️ How It Works

1. **Select IDE** - Choose between Claude Code or Cursor
2. **Ask Your Goal** - "What are you building?" (tech stack detected automatically)
3. **Analyze Your Code** - Deep codebase scan with monorepo detection
4. **Smart Recommendations** - AI-powered agent & skill suggestions based on your goal
5. **Generate Configuration** - Custom configuration folder with:
   - Project overview (CLAUDE.md or project.mdc)
   - `agents/` - Specialized sub-agents
   - `skills/` - Tech-specific knowledge
   - `hooks/` - Auto-loading scripts
   - `settings.json` - Configuration

## 🧠 Smart Recommendations

SuperAgents parses your goal description to detect technologies:

```
? What are you building?
> A multi-tenant platform with FastAPI + React + PostgreSQL

Detected technologies: FastAPI, React, PostgreSQL
→ Recommending: fastapi, python, react, typescript, prisma/drizzle
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

When a monorepo is detected, you can select which packages to configure:

```
┌  Monorepo Detected
│
│  Found 5 packages in this monorepo:
│    • @myapp/web (packages/web)
│    • @myapp/api (packages/api)
│    • @myapp/shared (packages/shared)
│
◇  Select packages to configure
│  ◉ @myapp/web
│  ◉ @myapp/api
│  ◯ @myapp/shared
```

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

```
~/.superagents/templates/
├── agents/
│   └── my-custom-agent.md
└── skills/
    └── my-custom-skill.md
```

Templates support variable substitution:
- `{{projectName}}` - Project name
- `{{goal}}` - User's goal description
- `{{framework}}` - Detected framework
- `{{language}}` - Primary language
- `{{dependencies}}` - Key dependencies

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

The zip includes:
- All agents and skills
- CLAUDE.md
- settings.json
- Metadata (version, goal, timestamps)

## 🔄 Incremental Updates

Update existing configurations without regenerating everything:

```bash
superagents --update
```

Options:
- **Add new agents/skills** - Select from available templates
- **Remove agents/skills** - Clean up unused configurations
- **Regenerate CLAUDE.md** - Update project context

## 💡 Example Usage

```bash
$ superagents

╔═══════════════════════════════════════════════════════════════╗
║   SUPERAGENTS - Context-Aware Configuration Generator         ║
╚═══════════════════════════════════════════════════════════════╝

  Version 1.3.1

? Which IDE are you using?
> Claude Code

? What are you building?
> A SaaS analytics dashboard with React and FastAPI

? Project type
> SaaS Dashboard (detected)

? Which AI model should we use?
> Claude Sonnet 4.5 (Fast & capable)

⠋ Analyzing codebase...
⠋ Generating recommendations...

Recommended Agents:
  ✓ frontend-specialist (score: 95) - Dashboard UI development
  ✓ backend-engineer (score: 90) - API and data layer
  ✓ api-designer (score: 80) - REST API patterns

Recommended Skills:
  ✓ react (score: 100) - Mentioned in your goal
  ✓ fastapi (score: 100) - Mentioned in your goal
  ✓ python (score: 80) - Mentioned in your goal
  ✓ typescript (score: 90) - Type safety

✓ Success! Your Claude Code configuration is ready.

Created files:
  CLAUDE.md
  .claude/settings.json

Agents: (3)
  → frontend-specialist
  → backend-engineer
  → api-designer

Skills: (4)
  → react
  → fastapi
  → python
  → typescript
```

## 📁 Output Structure

### Claude Code

```
project/
├── CLAUDE.md              # Project overview (root folder)
└── .claude/
    ├── settings.json      # Configuration
    ├── agents/            # Specialized AI agents
    │   ├── frontend-specialist.md
    │   ├── backend-engineer.md
    │   └── api-designer.md
    ├── skills/            # Domain knowledge
    │   ├── react.md
    │   ├── fastapi.md
    │   └── python.md
    └── hooks/
        └── skill-loader.sh
```

### Cursor

```
project/
└── .cursor/
    └── rules/
        ├── project.mdc        # Main project context
        ├── agents/
        │   ├── frontend-specialist.mdc
        │   └── backend-engineer.mdc
        └── skills/
            ├── react.mdc
            └── fastapi.mdc
```

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

### Agents (11)
- backend-engineer, frontend-specialist, code-reviewer, debugger
- devops-specialist, security-analyst, database-specialist
- api-designer, testing-specialist, docs-writer, performance-optimizer

### Skills (16)
- typescript, nodejs, react, nextjs, vue, tailwind
- prisma, drizzle, express, supabase, vitest
- graphql, docker, python, fastapi, mcp

## ⚡ Performance & Cost Optimization

| Feature | Benefit |
|---------|---------|
| **Parallel Generation** | 3x faster with concurrent API calls |
| **Tiered Models** | Uses Haiku for simple tasks (~80% cost savings) |
| **Local Templates** | 27 built-in templates (no API needed) |
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

# Build
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

**Built with ❤️ for the Claude Code community**
