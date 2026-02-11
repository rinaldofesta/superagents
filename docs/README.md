# SuperAgents Documentation

Comprehensive documentation for the SuperAgents CLI tool.

## Documentation Structure

This documentation follows the **Divio documentation system** with four distinct types of content:

### 📚 Getting Started (Tutorials - Learning-Oriented)

Step-by-step guides to get you up and running.

- [Installation](getting-started/installation.md) - Install SuperAgents via curl, npm, or npx
- [Quickstart](getting-started/quickstart.md) - Your first generation walkthrough
- [Authentication](getting-started/authentication.md) - Set up Claude Plan or API Key

### 💡 Concepts (Explanation - Understanding-Oriented)

Understand how SuperAgents works and why.

- [Agents](concepts/agents.md) - Expert-backed methodologies and the 15 built-in agents
- [Skills](concepts/skills.md) - Framework-specific knowledge and the 16 built-in skills
- [Generation](concepts/generation.md) - AI generation pipeline and optimization techniques
- [Caching](concepts/caching.md) - How caching saves time and reduces costs

### ⚙️ Configuration (How-To - Problem-Oriented)

Configure SuperAgents for your specific needs.

- [CLAUDE.md File](configuration/claude-md.md) - Project context configuration
- [Settings](configuration/settings.md) - settings.json options and structure
- [Custom Templates](configuration/custom-templates.md) - Create custom agents and skills

### 🔧 Commands (How-To - Task-Oriented)

Guides for specific command usage.

- [Generate](commands/generate.md) - Main generation command with all options
- [Status](commands/status.md) - Show project progress from ROADMAP.md
- [Evolve](commands/evolve.md) - Detect project changes and update config
- [Handoff](commands/handoff.md) - Generate HANDOFF.md for developer hand-off
- [Publish](commands/publish.md) - Package project as a reusable blueprint
- [Use](commands/use.md) - Install a published blueprint from file or URL
- [Update](commands/update.md) - Update SuperAgents or modify configurations
- [Cache](commands/cache.md) - Manage cache statistics and clearing
- [Templates](commands/templates.md) - List, export, import, and delete templates
- [Export/Import](commands/export-import.md) - Share configurations via ZIP files

### 📖 Reference (Information-Oriented)

Complete technical reference for scripting and automation.

- [CLI Options](reference/cli-options.md) - All command-line flags and options
- [Environment Variables](reference/environment-variables.md) - Environment configuration
- [Exit Codes](reference/exit-codes.md) - Exit codes for scripting

## Quick Navigation

### I want to...

**Get started with SuperAgents**
→ [Installation](getting-started/installation.md) → [Quickstart](getting-started/quickstart.md)

**Understand what agents and skills are**
→ [Agents](concepts/agents.md) → [Skills](concepts/skills.md)

**Set up authentication**
→ [Authentication](getting-started/authentication.md)

**Create a custom agent or skill**
→ [Custom Templates](configuration/custom-templates.md)

**Share my configuration with the team**
→ [Export/Import](commands/export-import.md)

**Update my existing configuration**
→ [Update Command](commands/update.md)

**Reduce API costs**
→ [Caching](concepts/caching.md) → [Generation](concepts/generation.md)

**Script SuperAgents in CI/CD**
→ [CLI Options](reference/cli-options.md) → [Exit Codes](reference/exit-codes.md)

**Troubleshoot issues**
→ Check relevant command docs → Use `--verbose` flag

## Documentation Principles

### Conversational Yet Professional

Documentation uses clear, direct language. No unnecessary jargon.

### Explanation-First Approach

Concepts explain *why* before showing *how*.

### Task-Oriented

How-to guides focus on accomplishing specific goals.

### Progressive Disclosure

Basic usage comes before advanced topics.

### Working Examples

Every code example is copy-pasteable and actually works.

## Contributing to Documentation

Found an issue or want to improve documentation?

1. **Typos and small fixes**: Open a PR with changes
2. **New sections**: Open an issue first to discuss
3. **Examples**: Add real-world examples to relevant guides

Documentation files are in `/docs` and written in Markdown.

## External Resources

- [SuperAgents Repository](https://github.com/Play-New/superagents)
- [Issue Tracker](https://github.com/Play-New/superagents/issues)
- [npm Package](https://www.npmjs.com/package/superagents)
- [Website](https://superagents.playnew.com)

## Documentation Version

This documentation corresponds to **SuperAgents v1.5.0**.

For older versions, see the [GitHub releases](https://github.com/Play-New/superagents/releases).

---

**Next Step:** Start with [Installation](getting-started/installation.md) to install SuperAgents.
