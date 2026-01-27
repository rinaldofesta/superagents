# SuperAgents

> **Goal-Aware Claude Code Configuration Generator**

SuperAgents is an intelligent CLI tool that generates highly customized Claude Code configurations (agents, skills, and hooks) based on both your existing codebase AND your project goals. Unlike traditional analyzers that only look at what you have, SuperAgents asks "What are you building?" to create forward-looking configurations that help you achieve your goals faster.

## ✨ Features

- 🎯 **Goal-First Approach** - Understands what you're building, not just what you have
- 🔍 **Deep Codebase Analysis** - Detects 20+ frameworks automatically
- 🤖 **Smart Agent Selection** - Context-aware recommendations based on your goals
- 📚 **100+ Skill Library** - Only relevant skills installed
- 🎨 **Beautiful CLI** - Interactive prompts with progress indicators
- 🔒 **Privacy-First** - Local processing, smart file sampling
- ⚡ **Fast & Efficient** - Optimized analysis and generation

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

## 🔐 Authentication

SuperAgents supports two authentication methods:

| Method          | Command                               | Best For               |
| --------------- | ------------------------------------- | ---------------------- |
| **Claude Plan** | Select in CLI                         | Claude Max subscribers |
| **API Key**     | `export ANTHROPIC_API_KEY=sk-ant-...` | API users              |

## 🏗️ How It Works

1. **Ask Your Goal** - "What are you building?"
2. **Analyze Your Code** - Deep codebase scan
3. **Smart Recommendations** - AI-powered agent & skill suggestions
4. **Generate Configuration** - Custom `.claude/` folder with:
   - `CLAUDE.md` - Project overview
   - `agents/` - Specialized sub-agents
   - `skills/` - Tech-specific knowledge
   - `hooks/` - Auto-loading scripts
   - `settings.json` - Claude Code configuration

## 💡 Example Usage

```bash
$ superagents

╔═══════════════════════════════════════════════════════════════╗
║   SUPERAGENTS - Goal-Aware Configuration Generator           ║
╚═══════════════════════════════════════════════════════════════╝

? What are you building?
> A SaaS analytics dashboard with real-time charts

? Project type
> SaaS Dashboard (detected)

? Which AI model should we use?
> Claude Sonnet 4.5 (Fast & capable)

⠋ Analyzing codebase...
⠋ Generating recommendations...

Recommended Agents:
  ✓ frontend-engineer (score: 95) - Dashboard UI development
  ✓ backend-engineer (score: 90) - API and data layer

? Select agents to include
☑ frontend-engineer
☑ backend-engineer
☑ reviewer

? Select skills to include
☑ nextjs
☑ react
☑ typescript
☑ tailwind

⠋ Generating configurations with Claude...

✓ Success! Your Claude Code configuration is ready.

Created files:
  .claude/CLAUDE.md
  .claude/settings.json

Agents: (3)
  → frontend-engineer
  → backend-engineer
  → reviewer

Skills: (4)
  → nextjs
  → react
  → typescript
  → tailwind

Next steps:
  1. Run claude to start using your enhanced Claude Code
  2. Use /agent <name> to switch between agents
  3. Use Skill(<name>) to load domain knowledge
```

## 📁 Output Structure

SuperAgents creates a `.claude/` folder in your project:

```
.claude/
├── CLAUDE.md              # Project overview for Claude
├── settings.json          # Configuration
├── agents/                # Specialized AI agents
│   ├── frontend-engineer.md
│   ├── backend-engineer.md
│   └── reviewer.md
├── skills/                # Domain knowledge
│   ├── nextjs.md
│   ├── typescript.md
│   └── react.md
└── hooks/
    └── skill-loader.sh    # Auto-loads relevant skills
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

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide for contributors
- [Architecture.md](./Architecture.md) - Detailed technical architecture

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
