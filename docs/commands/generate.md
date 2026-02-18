# Generate Command

The main SuperAgents command generates context-aware Claude Code configurations for your project.

## Basic Usage

```bash
superagents
```

Run from your project directory. SuperAgents will guide you through an interactive process.

## Command Options

```bash
superagents [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--dry-run` | Preview without API calls or writing files | `false` |
| `-v, --verbose` | Show detailed output during generation | `false` |
| `-u, --update` | Update existing configuration incrementally | `false` |
| `--json` | Non-interactive mode — outputs JSON to stdout | `false` |
| `--goal <description>` | Goal text (skips interactive goal prompt) | - |
| `--agents <list>` | Comma-separated agent names (JSON mode) | - |
| `--skills <list>` | Comma-separated skill names (JSON mode) | - |
| `--version` | Show SuperAgents version | - |
| `--help` | Show help text | - |

## Examples

### Basic Generation

Generate configuration with interactive prompts:

```bash
superagents
```

Steps:
1. Choose authentication method
2. Enter project goal
3. Review recommendations
4. Confirm generation

### Preview Mode (Dry Run)

Preview what would be generated:

```bash
superagents --dry-run
```

Shows:
- Detected codebase information
- Recommended agents and skills
- Template vs. API generation
- Estimated token usage and cost

No files are written. No API calls made.

### Verbose Output

See detailed generation process:

```bash
superagents --verbose
```

Displays:
- Detailed analysis results
- Recommendation scores
- Cache hit/miss for each item
- API request/response details
- Token usage per API call

Useful for debugging or understanding recommendations.

### Update Existing Configuration

Modify an existing configuration:

```bash
superagents --update
```

Or:

```bash
superagents -u
```

Options during update:
1. Add agents
2. Remove agents
3. Add skills
4. Remove skills
5. Regenerate CLAUDE.md
6. Regenerate specific items
7. Regenerate everything

### JSON Mode (Non-Interactive)

For CI/CD pipelines and scripting:

```bash
export ANTHROPIC_API_KEY=sk-ant-...

# Minimal — auto-recommends agents
superagents --json --goal "build a REST API with auth"

# Explicit selections
superagents --json \
  --goal "add tests and coverage" \
  --agents "testing-specialist,code-reviewer" \
  --skills "typescript,vitest"
```

Auth is resolved automatically from `ANTHROPIC_API_KEY` or Claude CLI. On success, a `JsonModeOutput` object is written to stdout. On failure, a `JsonModeError` object is written and the process exits with code 1. No interactive prompts are shown. The `.claude` directory is overwritten without confirmation.

See [CLI Options Reference](../reference/cli-options.md#non-interactive-mode-json-mode) for the full JSON schema.

### Quality Gate (testing-specialist only)

When `testing-specialist` is selected and a test command is detected, an additional prompt appears:

```
? Enable test quality gate?
  ● Off     Claude can stop anytime
  ○ Soft    Warn if tests fail, allow stop
  ○ Hard    Block stop until tests pass
```

- **Off** (default): No enforcement. Claude stops whenever it wants.
- **Soft**: Tests run on Stop; a warning is printed if they fail, but Claude can still stop.
- **Hard**: Tests run on Stop; Claude is blocked from stopping until they pass.

The security gate (enabled automatically when `security-analyst` is selected) adds a `PreToolUse` hook that checks every `Write` call for hardcoded secrets (AWS keys, Anthropic keys, GitHub tokens, passwords, etc.) and blocks the write if any are found.

### Combined Options

Combine flags for specific behavior:

```bash
# Preview an update
superagents --update --dry-run

# Verbose dry run
superagents --dry-run --verbose

# Verbose update
superagents --update --verbose
```

## Interactive Flow

### 1. Authentication Selection

```
? How would you like to authenticate?
  ○ Claude Plan (Claude Max subscription)
  ● API Key (ANTHROPIC_API_KEY environment variable)
```

Choose based on your setup:
- **Claude Plan**: No configuration needed, uses Claude CLI
- **API Key**: Requires `ANTHROPIC_API_KEY` environment variable

### 2. Codebase Analysis

For existing projects, SuperAgents analyzes:

```
⠋ Analyzing codebase...
```

Detects:
- Project type (node, python, web, fullstack)
- Framework (React, Express, FastAPI, etc.)
- Dependencies and versions
- Code patterns

Takes 5-10 seconds. Cached for 24 hours.

### 3. Goal Input

```
? What are you building?
> A task management API with authentication and real-time updates
```

Enter your project goal. Be specific about:
- What you're building (app type, features)
- Technologies you're using
- Key requirements

SuperAgents parses this to detect technologies and features.

### 4. New Project Questions (Optional)

For empty directories, additional questions:

```
? What tech stack will you use?
  ⬚ TypeScript
  ⬚ React
  ⬚ Next.js
  ☑ Node.js
  ☑ Express
  ⬚ Python
  ... (select multiple with spacebar)

? What's your primary focus?
  ○ Frontend
  ● Backend
  ○ Fullstack
  ○ API Development

? Do you need any of these features?
  ☑ Authentication
  ☑ Database
  ⬚ Real-time (WebSocket)
  ⬚ File uploads
  ... (select multiple)
```

### 5. Agent Recommendations

```
Recommended Agents (6):
  ☑ backend-engineer (Clean Architecture & SOLID)
  ☑ api-designer (API Design Principles)
  ☑ security-analyst (Security Best Practices)
  ⬚ testing-specialist (Test-Driven Development)
  ☑ database-specialist (Data-Intensive Apps)
  ⬚ code-reviewer (Code Review Practices)

Navigate with ↑/↓, select with space, confirm with enter
```

Adjust selections:
- Arrow keys: Navigate
- Spacebar: Toggle selection
- Enter: Confirm

### 6. Skill Recommendations

```
Recommended Skills (5):
  ☑ typescript
  ☑ nodejs
  ☑ express
  ☑ prisma
  ⬚ vitest
  ⬚ docker

Navigate with ↑/↓, select with space, confirm with enter
```

Same controls as agent selection.

### 7. Generation Progress

```
⠋ Generating 4 agents...
✓ Generated backend-engineer
✓ Generated api-designer (cached)
✓ Generated security-analyst
✓ Generated database-specialist

⠋ Generating 4 skills...
✓ Generated typescript (template)
✓ Generated nodejs (template)
✓ Generated express (template)
✓ Generated prisma (template)

⠋ Writing configuration...
✓ Configuration written to .claude/
✓ CLAUDE.md created

┌─────────────────────────────────────────┐
│                                         │
│  Configuration generated successfully!  │
│                                         │
│  Location: .claude/                     │
│  Agents: 4                              │
│  Skills: 4                              │
│                                         │
└─────────────────────────────────────────┘
```

Generation takes 10-30 seconds depending on:
- Number of agents and skills
- Cache hits
- Template availability
- API response time

## Output Structure

SuperAgents creates:

```
your-project/
├── CLAUDE.md              # Project context
├── ROADMAP.md             # Generated for blueprint projects
└── .claude/
    ├── settings.json      # Permissions, hooks config
    ├── agents/
    │   ├── backend-engineer.md
    │   ├── api-designer.md
    │   └── ...
    ├── skills/
    │   ├── typescript.md
    │   ├── nodejs.md
    │   └── ...
    ├── commands/
    │   ├── status.md
    │   ├── fix.md
    │   └── ...
    └── hooks/
        └── security-gate.sh   # Present when security-analyst is selected
```

`security-gate.sh` is a `PreToolUse` hook (registered in `settings.json`) that runs before every `Write` call. It detects hardcoded secrets and exits with code 2 to block the write.

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Success | Configuration generated |
| 1 | Error | Check error message, retry |
| 2 | Cancelled | User cancelled during prompts |

Use exit codes for scripting:

```bash
if superagents; then
  echo "Configuration generated"
else
  echo "Generation failed"
  exit 1
fi
```

## Environment Variables

SuperAgents reads these environment variables:

| Variable | Purpose | Required |
|----------|---------|----------|
| `ANTHROPIC_API_KEY` | API authentication | If using API Key mode |
| `HOME` | User home directory for cache | Yes (automatic) |

## Common Workflows

### First-Time Setup

New project setup:

```bash
# Create project
mkdir my-project
cd my-project

# Initialize package.json
npm init -y

# Install dependencies
npm install express typescript

# Generate configuration
superagents
```

### Existing Project

Add to existing project:

```bash
cd existing-project
superagents
```

SuperAgents analyzes existing code and dependencies.

### Experiment with Goals

Try different goals to see recommendations:

```bash
# Goal 1: API focus
superagents --dry-run
# Enter: "Build a REST API"

# Goal 2: Full-stack focus
superagents --dry-run
# Enter: "Build a full-stack app with React and Node.js"
```

Dry run mode lets you experiment without generating files.

### Team Adoption

Generate configuration for team:

```bash
cd team-project
superagents

# Commit to repo
git add CLAUDE.md .claude/
git commit -m "Add SuperAgents configuration"
git push
```

Team members get the configuration on next pull.

## Troubleshooting

### "API key not found"

Problem: `ANTHROPIC_API_KEY` not set.

Solution:
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key
superagents
```

Or choose "Claude Plan" during authentication.

### "Command not found: superagents"

Problem: SuperAgents not installed or not in PATH.

Solution:
```bash
# Reinstall
npm install -g superagents

# Or use npx
npx superagents
```

### "No codebase detected"

Problem: Empty directory or no framework files.

Solution: SuperAgents will ask setup questions for new projects. Answer them to provide context.

### Generation Hangs

Problem: API request timing out or long wait.

Solution:
1. Check internet connection
2. Verify API key is valid
3. Try `--dry-run` to see if analysis works
4. Use `--verbose` to see where it's stuck

### Unexpected Recommendations

Problem: Recommended agents/skills don't match project.

Solution:
1. Clear cache: `superagents cache --clear`
2. Be more specific in goal description
3. Use `--verbose` to see recommendation scores
4. Manually adjust selections during generation

## Next Steps

- [Update Command](update.md) - Modify existing configurations
- [Dry Run Mode](../reference/cli-options.md#dry-run) - Preview generations
- [Caching](../concepts/caching.md) - Understand cache behavior
- [Authentication](../getting-started/authentication.md) - Set up API access
