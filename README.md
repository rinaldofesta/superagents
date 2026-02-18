# SuperAgents

Build your AI team in 60 seconds. SuperAgents analyzes your project and assembles a squad of expert AI agents — each trained with proven methods from industry leaders.

Free. Open source. Works with any Claude subscription.

<!-- TODO: Add terminal screenshot -->

## Quick Start

**Prerequisites:** Node.js 20+ and a [Claude subscription](https://claude.ai/pricing) (Pro, Max, or Teams) or an [Anthropic API key](https://console.anthropic.com/).

```bash
# Install
npm install -g superagents

# Run in your project
cd your-project
superagents
```

Or install with the one-line script:

```bash
curl -fsSL https://superagents.playnew.com/install.sh | bash
```

SuperAgents will scan your project, recommend AI specialists, and create a `.claude/` folder with everything configured.

## What You Get

SuperAgents creates a `.claude/` folder in your project with three things:

- **CLAUDE.md** — Your project context. Tells Claude about your codebase, goals, and how things are structured.
- **Agents** — AI specialists trained with methods from industry experts. You pick which ones you need.
- **Skills** — Deep knowledge about the technologies you use (React, Python, Docker, etc.)

### Agents

15 expert-backed AI specialists:

| Agent | Built on | Speciality |
|-------|----------|------------|
| backend-engineer | Uncle Bob | Clean code & architecture |
| frontend-specialist | Dan Abramov | React & UI patterns |
| code-reviewer | Google Engineering | Code quality & review |
| debugger | Julia Evans | Systematic debugging |
| testing-specialist | Kent Beck | Test-driven development |
| security-analyst | OWASP | Security best practices |
| api-designer | Stripe | API design |
| database-specialist | Martin Kleppmann | Data systems |
| devops-specialist | Kelsey Hightower | Infrastructure |
| performance-optimizer | Addy Osmani | Web performance |
| architect | Martin Fowler | System design |
| product-manager | Marty Cagan | Product strategy |
| docs-writer | Divio | Documentation |
| copywriter | Paolo Gervasi | Persuasive writing |
| designer | Sarah Corti | UI/UX design |

### Skills

16 technology packs:

`typescript` · `nodejs` · `react` · `nextjs` · `vue` · `tailwind` · `prisma` · `drizzle` · `express` · `supabase` · `vitest` · `graphql` · `docker` · `python` · `fastapi` · `mcp`

## How It Works

1. **Tell SuperAgents what you're building** — describe your project goals in plain language
2. **It scans your project** — detects languages, frameworks, dependencies, and patterns (or helps you start fresh if it's a new project)
3. **AI generates customized configurations** — picks the right agents and skills, then creates personalized instructions for each one
4. **Open Claude Code and start working with your team** — your `.claude/` folder is ready to go

## Commands

| Command | Description |
|---------|-------------|
| `superagents` | Generate config for your project |
| `superagents --dry-run` | Preview without making changes |
| `superagents --update` | Add or remove agents from existing config |
| `superagents --json` | Non-interactive mode — outputs JSON to stdout |
| `superagents --json --goal "..."` | JSON mode with goal (skips all prompts) |
| `superagents --json --agents "backend-engineer,testing-specialist" --skills "typescript"` | JSON mode with explicit agent/skill selection |
| `superagents status` | Show ROADMAP.md progress |
| `superagents evolve` | Detect project changes and propose config updates |
| `superagents handoff` | Generate HANDOFF.md for team hand-offs |
| `superagents publish` | Package project as a reusable .blueprint.zip |
| `superagents use <source>` | Install a blueprint from a file or URL |
| `superagents update` | Update SuperAgents itself |
| `superagents cache --stats` | Check cache usage |
| `superagents cache --clear` | Clear cached data |
| `superagents export config.zip` | Share your config with others |
| `superagents import config.zip` | Load a shared config |

## Authentication

### JSON / Pipeline Mode

Run SuperAgents non-interactively from CI/CD scripts or other tools:

```bash
# With API key in environment
export ANTHROPIC_API_KEY=sk-ant-...
superagents --json --goal "build a REST API with auth"

# Output (stdout):
# {"success":true,"mode":"existing","projectRoot":"/path","agents":["backend-engineer","api-designer"],...}

# Specify agents and skills explicitly
superagents --json --goal "add tests" --agents "testing-specialist" --skills "typescript,vitest"

# On failure:
# {"success":false,"error":"...","code":"AUTH_REQUIRED"}
```

Auth is resolved automatically: `ANTHROPIC_API_KEY` env var is tried first, then the Claude CLI.

SuperAgents needs access to Claude to generate your configurations. Two options:

| Method | Who it's for | Setup |
|--------|-------------|-------|
| **Claude subscription** | Claude Pro, Max, or Teams subscribers | Select "Sign in with Claude" when prompted |
| **API key** | Developers with an Anthropic account | Set `export ANTHROPIC_API_KEY=sk-ant-...` in your terminal |

## Privacy

- All code analysis happens **on your machine**
- Only small code samples are sent to Claude for generation
- Secrets, `.env` files, and credentials are never sent
- Respects your `.gitignore`
- Create a `.superagentsignore` file to exclude additional paths

<details>
<summary><strong>For Developers</strong></summary>

### Development Setup

```bash
git clone https://github.com/Play-New/superagents.git
cd superagents
npm install
npm run dev
```

| Script | Description |
|--------|-------------|
| `npm run dev` | Run in development mode |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run lint` | Lint code |
| `npm run type-check` | Type check without emit |

### Project Structure

```
src/
├── index.ts              # CLI entry point
├── analyzer/             # Codebase detection and analysis
├── cli/                  # Interactive prompts and UI
├── context/              # Agent/skill recommendation engine
├── generator/            # AI generation orchestration
├── templates/            # 15 agent + 16 skill templates
├── types/                # TypeScript type definitions
├── updater/              # Incremental config updates
├── utils/                # Auth, logging, concurrency
└── writer/               # Output file writer
```

### Contributing

Contributions welcome! See [CLAUDE.md](./CLAUDE.md) for architecture details and coding guidelines.

### Custom Templates

You can create your own agent and skill templates:

```bash
superagents templates --list                            # List all templates
superagents templates --export backend-engineer         # Export a template to customize
superagents templates --import ./my-agent.md --type agent  # Add your own template
```

Custom templates are stored in `~/.superagents/templates/` and support variables like `{{goal}}`, `{{framework}}`, `{{language}}`, and `{{dependencies}}`.

</details>

## License

MIT — use it however you want.
