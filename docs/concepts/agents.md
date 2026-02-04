# Agents

Agents are specialized AI assistants that embody proven software engineering methodologies from industry experts.

## What Are Agents?

Each agent is a Markdown file in `.claude/agents/` containing:

- Expert methodology (Uncle Bob's Clean Architecture, Dan Abramov's React patterns, etc.)
- Domain-specific knowledge
- Karpathy's 4 Coding Principles
- Project context (your goal, framework, language)
- Best practices and workflows

When you invoke an agent in Claude Code, it provides specialized assistance based on this context.

## The 15 Expert-Backed Agents

### Backend Development

**backend-engineer** (Uncle Bob)
- Clean Architecture and SOLID principles
- Separation of concerns, dependency inversion
- Domain modeling and business logic
- Use for: API design, server architecture, business rules

**api-designer** (Stripe)
- RESTful API design patterns
- Versioning, pagination, error handling
- Developer experience and documentation
- Use for: Public APIs, webhook design, SDK architecture

**database-specialist** (Martin Kleppmann)
- Data-intensive application patterns
- Schema design, indexing, query optimization
- Consistency, replication, transactions
- Use for: Database migrations, query performance, data modeling

### Frontend Development

**frontend-specialist** (Dan Abramov)
- React patterns and component composition
- State management, hooks, performance
- Unidirectional data flow
- Use for: React apps, component architecture, state solutions

**designer** (Sarah Corti)
- UI/UX design principles
- Visual hierarchy, spacing, typography
- Accessibility and responsive design
- Use for: Design systems, component styling, user flows

**performance-optimizer** (Addy Osmani)
- Web performance optimization
- Core Web Vitals, bundle size, lazy loading
- Rendering performance, caching strategies
- Use for: Performance audits, optimization, loading strategies

### Development Process

**testing-specialist** (Kent Beck)
- Test-Driven Development (TDD)
- Unit tests, integration tests, E2E tests
- Test design patterns and maintainability
- Use for: Writing tests, test architecture, TDD workflow

**code-reviewer** (Google Engineering)
- Code review best practices
- Readability, maintainability, security
- Style consistency, edge cases
- Use for: Code reviews, PR feedback, refactoring suggestions

**debugger** (Julia Evans)
- Systematic debugging methodology
- Hypothesis-driven investigation
- Logging, tracing, reproduction
- Use for: Bug investigation, error diagnosis, debugging strategies

### Infrastructure & Operations

**devops-specialist** (Kelsey Hightower)
- Infrastructure as code patterns
- Container orchestration, CI/CD pipelines
- Deployment strategies, monitoring
- Use for: Docker setup, Kubernetes, deployment automation

**security-analyst** (OWASP Foundation)
- Security best practices and OWASP Top 10
- Authentication, authorization, input validation
- Threat modeling, secure coding
- Use for: Security audits, auth implementation, vulnerability fixes

### Product & Documentation

**product-manager** (Marty Cagan)
- Product discovery and validation
- User research, prototyping, metrics
- Product strategy and roadmap
- Use for: Feature planning, user stories, product decisions

**docs-writer** (Divio)
- Documentation system (tutorials, how-to, reference, explanation)
- Clear technical writing
- User-focused documentation
- Use for: README files, API docs, user guides

**architect** (Martin Fowler)
- Enterprise architecture patterns
- System design, microservices, event-driven architecture
- Refactoring strategies, design patterns
- Use for: Architecture decisions, system design, technical planning

**copywriter** (Paolo Gervasi)
- Conversion copywriting techniques
- Clarity, benefits over features, calls-to-action
- Landing pages, email, marketing content
- Use for: Marketing copy, website content, conversion optimization

## Karpathy's 4 Coding Principles

All agents include these principles:

### 1. Think Before Coding

- State assumptions explicitly
- Present multiple interpretations when they exist
- Push back if a simpler approach exists
- Stop and ask if something is unclear

### 2. Simplicity First

- No features beyond what was asked
- No abstractions for single-use code
- No speculative flexibility
- Rewrite 200 lines if they could be 50

### 3. Surgical Changes

- Don't improve adjacent code
- Match existing style
- Only remove orphans YOUR changes created
- Every changed line traces to the request

### 4. Goal-Driven Execution

- Transform tasks into verifiable goals
- Write tests first when possible
- State a brief plan for multi-step tasks
- Define success criteria before implementing

## How Agents Work

### Invocation

In Claude Code, invoke an agent by typing its name:

```
backend-engineer
```

Claude Code loads the agent's Markdown file and applies its context to the conversation.

### Context Awareness

Each agent knows:
- Your project goal (from SuperAgents setup)
- Your framework and language
- Your dependencies
- Related skills available

Example agent header:

```markdown
You are a backend engineer following Uncle Bob's Clean Architecture principles.

Project Goal: Build a REST API for task management
Framework: Express.js with TypeScript
Language: TypeScript (strict mode)
Available Skills: nodejs, typescript, express, vitest
```

### Multiple Agents

You can use multiple agents in the same project. Each provides specialized expertise:

```
# Architecture planning
architect

# Implementation
backend-engineer

# Review
code-reviewer

# Testing
testing-specialist
```

## Choosing Agents

SuperAgents recommends agents based on your goal, but you can customize:

### Goal-Based Selection

SuperAgents detects keywords in your goal:

| Keywords | Recommended Agents |
|----------|-------------------|
| "API", "backend", "server" | backend-engineer, api-designer |
| "React", "frontend", "UI" | frontend-specialist, designer |
| "security", "auth" | security-analyst |
| "performance", "optimization" | performance-optimizer |
| "database", "SQL" | database-specialist |
| "Docker", "CI/CD" | devops-specialist |
| "tests", "TDD" | testing-specialist |
| "documentation", "docs" | docs-writer |

### Manual Selection

During generation, adjust the recommended agents:

```
Recommended Agents (6):
  ☑ backend-engineer
  ☑ api-designer
  ☐ database-specialist    # Add with spacebar
  ☑ testing-specialist
  ☐ security-analyst       # Add with spacebar
  ☑ code-reviewer
```

Use arrow keys to navigate, space to toggle.

### Update Later

Add or remove agents after initial generation:

```bash
superagents --update
```

Select "Add/remove agents" to adjust your configuration.

## Agent Files

Agent files are Markdown with frontmatter:

```markdown
---
name: backend-engineer
description: Clean Architecture & SOLID principles
expert: Uncle Bob
model: claude-sonnet-4-5
---

You are a backend engineer following Uncle Bob's Clean Architecture...

## Principles

1. **Separation of Concerns**
   - Business logic independent of framework
   ...
```

### Frontmatter Fields

| Field | Purpose |
|-------|---------|
| `name` | Agent identifier |
| `description` | One-line summary |
| `expert` | Source of methodology |
| `model` | Recommended Claude model |

## Custom Agents

Create your own agents for specialized needs:

```bash
# Export a built-in agent as starting point
superagents templates --export backend-engineer

# Edit the file
# Save to ~/.superagents/templates/agents/my-agent.md

# Import
superagents templates --import ~/.superagents/templates/agents/my-agent.md --type agent
```

See [Custom Templates](../configuration/custom-templates.md) for details.

## Next Steps

- [Skills Guide](skills.md) - Framework-specific knowledge modules
- [Generation Process](generation.md) - How AI creates agents
- [Custom Templates](../configuration/custom-templates.md) - Create custom agents
- [Update Command](../commands/update.md) - Modify agent selection
