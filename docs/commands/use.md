# Use Command

Install a published blueprint from a local file or URL.

## Usage

```bash
superagents use <source> [options]
```

### Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `source` | Path to a `.blueprint.zip` file or a URL | Yes |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-f, --force` | Replace existing `.claude/` configuration | `false` |
| `--preview` | Show blueprint contents without installing | `false` |

## What It Does

Extracts a published blueprint and installs its `.claude/` configuration, `CLAUDE.md`, and `ROADMAP.md` into your project.

Supports local files and HTTP/HTTPS URLs (max 10MB).

## Examples

```bash
# Install from local file
superagents use ./my-saas-starter-v1.0.0.blueprint.zip

# Install from URL
superagents use https://example.com/blueprints/saas-starter.zip

# Preview without installing
superagents use ./blueprint.zip --preview

# Force overwrite existing config
superagents use ./blueprint.zip --force
```

## Preview Mode

```bash
$ superagents use ./my-saas-starter-v1.0.0.blueprint.zip --preview

  Blueprint Preview

  Name: my-saas-starter
  Author: cosmico
  Version: 1.0.0
  Description: SaaS dashboard with auth and Stripe
  Phases: 4
  Agents: backend-engineer, frontend-specialist
  Skills: typescript, nextjs, prisma
  Stack: next, react, prisma, stripe...
```

## Requirements

- No existing `.claude/` directory (unless `--force` is used)

## See Also

- [Publish Command](publish.md) — create a blueprint from your project
- [Export/Import](export-import.md) — share raw config without roadmap
