# SuperAgents Documentation

Welcome to SuperAgents. This CLI tool generates context-aware Claude Code configurations by analyzing your codebase and understanding your goals.

## What is SuperAgents?

SuperAgents creates specialized AI agents and framework skills tailored to your project. Each agent embodies proven software engineering principles from industry experts like Uncle Bob, Dan Abramov, Martin Fowler, and Rinaldo Festa.

## Quick Links

### Getting Started
- [Installation](getting-started/installation.md) - Install SuperAgents
- [Quickstart](getting-started/quickstart.md) - First run and basic usage
- [Authentication](getting-started/authentication.md) - Set up Claude Plan or API Key

### Core Concepts
- [Agents](concepts/agents.md) - Specialized AI agents with expert methodologies
- [Skills](concepts/skills.md) - Framework-specific knowledge modules
- [Generation](concepts/generation.md) - How AI generation works
- [Caching](concepts/caching.md) - Performance optimization

### Configuration
- [CLAUDE.md](configuration/claude-md.md) - Project context file
- [Settings](configuration/settings.md) - Configuration options
- [Custom Templates](configuration/custom-templates.md) - Create your own agents and skills

### Commands
- [Generate](commands/generate.md) - Main generation command
- [Status](commands/status.md) - Show project progress from ROADMAP.md
- [Evolve](commands/evolve.md) - Detect project changes and update config
- [Handoff](commands/handoff.md) - Generate HANDOFF.md for developer hand-off
- [Publish](commands/publish.md) - Package project as a reusable blueprint
- [Use](commands/use.md) - Install a published blueprint
- [Update](commands/update.md) - Update SuperAgents
- [Cache](commands/cache.md) - Manage cache
- [Templates](commands/templates.md) - Template management
- [Export/Import](commands/export-import.md) - Share configurations

### Reference
- [CLI Options](reference/cli-options.md) - All command-line flags
- [Environment Variables](reference/environment-variables.md) - Environment configuration
- [Exit Codes](reference/exit-codes.md) - Exit codes for scripting

## Key Features

- **Context-Aware**: Analyzes your codebase to understand project type, frameworks, and patterns
- **Expert-Backed**: 21 agents built on industry-proven methodologies
- **Framework Skills**: 23 skills covering React, Next.js, Angular, Svelte, FastAPI, and more
- **Smart Caching**: 24-hour codebase cache, 7-day generation cache
- **Cost-Efficient**: Tiered model selection and local templates reduce API costs by 80%
- **Privacy-First**: Local analysis, only sends representative files to API

## Quick Start

```bash
# Install
curl -fsSL https://superagents.playnew.com/install.sh | bash

# Run in your project
cd your-project
superagents
```

## Support

- [GitHub Issues](https://github.com/Play-New/superagents/issues)
- [GitHub Repository](https://github.com/Play-New/superagents)
