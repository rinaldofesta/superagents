# Quickstart

Get started with SuperAgents in minutes.

## Your First Generation

Navigate to your project directory and run:

```bash
cd your-project
superagents
```

SuperAgents will guide you through an interactive process.

## What Happens

### 1. Authentication Selection

SuperAgents asks which authentication method you want to use:

```
? How would you like to authenticate?
  ○ Claude Plan (Claude Max subscription)
  ○ API Key (ANTHROPIC_API_KEY environment variable)
```

Choose based on your setup:
- **Claude Plan**: For Claude Max subscribers
- **API Key**: If you have an Anthropic API key

See [Authentication](authentication.md) for details.

### 2. Codebase Analysis (Existing Projects)

If your project has existing files, SuperAgents analyzes:
- Project type (node, web, fullstack)
- Framework (React, Next.js, Express, FastAPI, etc.)
- Dependencies from package.json, requirements.txt, etc.
- Code patterns and structure

This takes 5-10 seconds.

### 3. Goal Input (New Projects)

For empty or minimal directories, SuperAgents asks setup questions:

```
? What are you building?
> A task management app with React and Node.js

? What tech stack will you use?
  ⬚ TypeScript
  ⬚ React
  ⬚ Next.js
  ⬚ Node.js
  ⬚ Express
  ... (select multiple)

? What's your primary focus?
  ○ Frontend
  ○ Backend
  ○ Fullstack
  ○ API Development

? Do you need any of these features?
  ⬚ Authentication
  ⬚ Database
  ⬚ API Integration
  ... (select multiple)
```

### 4. Smart Recommendations

Based on your goal and codebase, SuperAgents recommends:

```
Recommended Agents (6):
  ⬚ backend-engineer (Clean Architecture & SOLID)
  ⬚ frontend-specialist (React Patterns)
  ⬚ api-designer (API Design Principles)
  ⬚ testing-specialist (Test-Driven Development)
  ⬚ code-reviewer (Code Review Practices)
  ⬚ debugger (Systematic Debugging)

Recommended Skills (5):
  ⬚ typescript
  ⬚ nodejs
  ⬚ react
  ⬚ express
  ⬚ vitest
```

You can adjust these selections using arrow keys and space.

### 5. Generation

SuperAgents generates your configuration:

```
⣾ Analyzing codebase...
✓ Analysis complete

⣾ Generating agents...
✓ Generated 6 agents

⣾ Generating skills...
✓ Generated 5 skills

✓ Configuration written to .claude/
```

Generation takes 10-30 seconds depending on selections.

## What Gets Created

SuperAgents creates a `.claude/` folder in your project:

```
your-project/
├── CLAUDE.md                    # Project context
└── .claude/
    ├── settings.json            # Configuration
    ├── agents/
    │   ├── backend-engineer.md
    │   ├── frontend-specialist.md
    │   ├── api-designer.md
    │   └── ...
    ├── skills/
    │   ├── typescript.md
    │   ├── nodejs.md
    │   ├── react.md
    │   └── ...
    └── hooks/
        └── skill-loader.sh
```

Each agent and skill is a Markdown file with instructions tailored to your project.

## Using Your Configuration

After generation, Claude Code automatically uses your configuration:

1. Open your project in Claude Code
2. Claude Code reads `.claude/` on startup
3. Invoke agents: Type the agent name (e.g., `backend-engineer`)
4. Invoke skills: Type the skill name (e.g., `typescript`)

Agents and skills provide context-aware assistance for your tasks.

## Preview Mode (Dry Run)

Preview what would be generated without making API calls:

```bash
superagents --dry-run
```

This shows:
- Detected codebase information
- Recommended agents and skills
- Estimated token usage and cost
- No files are written

Useful for experimenting with different goals.

## Verbose Output

See detailed information during generation:

```bash
superagents --verbose
```

Shows:
- Detailed analysis results
- API requests and responses
- Token usage per generation
- Cache hits and misses

## Example: React + Node.js App

Here's a complete example for a full-stack app:

```bash
cd my-app
superagents

? How would you like to authenticate?
> API Key

? What are you building?
> A real-time chat application with React frontend and Node.js backend

# SuperAgents detects package.json, recommends:
# Agents: backend-engineer, frontend-specialist, api-designer, testing-specialist
# Skills: typescript, nodejs, react, express, vitest

✓ Configuration generated successfully
```

Your `.claude/` folder now contains 4 agents and 5 skills tailored to real-time chat development.

## Next Steps

- [Authentication Setup](authentication.md) - Configure API access
- [Agents Guide](../concepts/agents.md) - Learn about specialized agents
- [Skills Guide](../concepts/skills.md) - Understand framework skills
- [Update Command](../commands/update.md) - Update existing configurations
