/**
 * AI Generator - generates agents, skills, and CLAUDE.md using Claude AI
 */
import Anthropic from '@anthropic-ai/sdk';
import { executeWithClaudeCLI } from '../utils/claude-cli.js';
import ora from 'ora';
export class AIGenerator {
    constructor() {
        // No need to store API key - we get it from context
    }
    async generateAll(context) {
        const totalItems = context.selectedAgents.length + context.selectedSkills.length + 1;
        let completed = 0;
        const getPercent = () => Math.round((completed / totalItems) * 100);
        const spinner = ora({
            text: `Generating... 0%`,
            spinner: 'dots'
        }).start();
        const updateSpinner = (item) => {
            spinner.text = `[${getPercent()}%] Generating ${item}...`;
        };
        const successItem = (item) => {
            completed++;
            spinner.text = `[${getPercent()}%] ✓ ${item}`;
        };
        const failItem = (item, error) => {
            completed++;
            spinner.warn(`[${getPercent()}%] ⚠ ${item} - ${error}`);
            spinner.start();
        };
        // Generate agents using AI
        const agents = [];
        for (const agentName of context.selectedAgents) {
            updateSpinner(`agent: ${agentName}`);
            try {
                const content = await this.generateAgent(agentName, context);
                agents.push({
                    filename: `${agentName}.md`,
                    content,
                    agentName
                });
                successItem(`Agent ${agentName}`);
            }
            catch (error) {
                failItem(`Agent ${agentName}`, error instanceof Error ? error.message : 'Unknown error');
                // Fallback to placeholder if AI generation fails
                agents.push({
                    filename: `${agentName}.md`,
                    content: this.generatePlaceholderAgent(agentName, context),
                    agentName
                });
            }
        }
        // Generate skills using AI
        const skills = [];
        for (const skillName of context.selectedSkills) {
            updateSpinner(`skill: ${skillName}`);
            try {
                const content = await this.generateSkill(skillName, context);
                skills.push({
                    filename: `${skillName}.md`,
                    content,
                    skillName
                });
                successItem(`Skill ${skillName}`);
            }
            catch (error) {
                failItem(`Skill ${skillName}`, error instanceof Error ? error.message : 'Unknown error');
                // Fallback to placeholder if AI generation fails
                skills.push({
                    filename: `${skillName}.md`,
                    content: this.generatePlaceholderSkill(skillName, context),
                    skillName
                });
            }
        }
        const hooks = [{
                filename: 'skill-loader.sh',
                content: this.generateSkillLoaderHook(context.selectedSkills),
                hookName: 'skill-loader'
            }];
        // Generate CLAUDE.md using AI
        updateSpinner('CLAUDE.md');
        let claudeMd;
        try {
            claudeMd = await this.generateClaudeMdWithAI(context);
            successItem('CLAUDE.md');
        }
        catch (error) {
            failItem('CLAUDE.md', error instanceof Error ? error.message : 'Unknown error');
            claudeMd = this.generateClaudeMd(context);
        }
        spinner.succeed(`Generation complete! [100%]`);
        const settings = {
            agents: context.selectedAgents,
            skills: context.selectedSkills,
            model: context.selectedModel,
            generatedAt: context.generatedAt
        };
        return {
            agents,
            skills,
            hooks,
            claudeMd,
            settings
        };
    }
    /**
     * Generate an agent using Claude AI
     */
    async generateAgent(agentName, context) {
        const prompt = this.buildAgentPrompt(agentName, context);
        const response = await this.executePrompt(prompt, context);
        // Extract agent content if it's wrapped in markdown code blocks
        const cleaned = response.replace(/```markdown\n?/g, '').replace(/```\n?$/g, '').trim();
        return cleaned;
    }
    /**
     * Generate a skill using Claude AI
     */
    async generateSkill(skillName, context) {
        const prompt = this.buildSkillPrompt(skillName, context);
        const response = await this.executePrompt(prompt, context);
        // Extract skill content if it's wrapped in markdown code blocks
        const cleaned = response.replace(/```markdown\n?/g, '').replace(/```\n?$/g, '').trim();
        return cleaned;
    }
    /**
     * Generate CLAUDE.md using Claude AI
     */
    async generateClaudeMdWithAI(context) {
        const prompt = this.buildClaudeMdPrompt(context);
        const response = await this.executePrompt(prompt, context);
        // Extract content if it's wrapped in markdown code blocks
        const cleaned = response.replace(/```markdown\n?/g, '').replace(/```\n?$/g, '').trim();
        return cleaned;
    }
    /**
     * Build comprehensive prompt for agent generation
     */
    buildAgentPrompt(agentName, context) {
        // Limit sampled files to reduce prompt size (max 3 files, 1000 chars each)
        const limitedFiles = context.sampledFiles.slice(0, 3);
        const sampledFilesSection = limitedFiles.length > 0
            ? `\n### Sample Files from Codebase\n\n${limitedFiles.map(f => `**${f.path}**:\n\`\`\`\n${f.content.slice(0, 1000)}\n\`\`\`\n`).join('\n')}`
            : '';
        return `You are generating a specialized Claude Code agent configuration file.

## USER'S PROJECT GOAL

**Goal Description:** ${context.goal.description}

**Project Category:** ${context.goal.category}

**Technical Requirements:**
${context.goal.technicalRequirements?.map(req => `- ${req.category}: ${req.description} (${req.priority})`).join('\n') || 'None specified'}

## CURRENT CODEBASE STATE

**Project Type:** ${context.codebase.projectType}
**Language:** ${context.codebase.language || 'Not detected'}
**Framework:** ${context.codebase.framework || 'None detected'}

**Key Dependencies:**
${context.codebase.dependencies.slice(0, 10).map(d => `- ${d.name}@${d.version} (${d.category})`).join('\n') || 'None detected'}

**Detected Patterns:**
${context.codebase.detectedPatterns.map(p => `- ${p.type}: ${p.description} (${p.paths.length} files)`).join('\n') || 'None detected'}
${sampledFilesSection}

## AGENT TO GENERATE

**Agent Name:** ${agentName}

**Available Skills:** ${context.selectedSkills.join(', ')}

## YOUR TASK

Generate a complete, detailed agent markdown file that:

1. **Understands the PROJECT GOAL** - What the user is trying to build
2. **Knows the CODEBASE** - Framework, patterns, and file structure
3. **Provides SPECIFIC GUIDANCE** - Not generic advice, but tailored to THIS project
4. **Includes REAL EXAMPLES** - Code patterns matching the detected codebase style
5. **Has ACTIONABLE RULES** - Critical rules specific to this project's stack

## OUTPUT FORMAT

Start with YAML frontmatter, then markdown content:

\`\`\`yaml
---
name: ${agentName}
description: |
  [2-3 line description explaining what this agent does and when to use it.
  Be specific to the project goal and tech stack.]
tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
model: ${context.selectedModel}
skills: ${context.selectedSkills.join(', ')}
---
\`\`\`

# ${agentName}

You are a senior ${agentName} working on: **${context.goal.description}**

## Project Context

[Describe the project, goal, and current state. Be specific about what's being built.]

## Tech Stack

[List the specific technologies detected in this codebase]

## Key File Locations

[Based on the sampled files and patterns, describe the actual directory structure]

\`\`\`
[show actual file structure]
\`\`\`

## Code Patterns and Conventions

[Describe the actual patterns detected in the codebase. Include real code examples from the sampled files if relevant.]

## Critical Rules

1. [Numbered list of must-follow rules specific to this project's tech stack]
2. [Include framework-specific best practices]
3. [Include goal-specific requirements]
4. [Reference Context7 usage when appropriate]

## Context7 Usage

When you need up-to-date documentation for any library used in this project:
1. Use mcp__context7__resolve-library-id to find the library
2. Use mcp__context7__query-docs to get specific documentation

---

Be SPECIFIC, ACTIONABLE, and PROJECT-FOCUSED. Avoid generic advice.`;
    }
    /**
     * Build comprehensive prompt for skill generation
     */
    buildSkillPrompt(skillName, context) {
        const relevantFiles = context.sampledFiles.filter(f => f.content.toLowerCase().includes(skillName) ||
            f.path.toLowerCase().includes(skillName));
        const examplesSection = relevantFiles.length > 0
            ? `\n### Examples from This Codebase\n\n${relevantFiles.slice(0, 3).map(f => `**${f.path}**:\n\`\`\`\n${f.content.slice(0, 1500)}\n\`\`\`\n`).join('\n')}`
            : '';
        return `You are generating a skill file for Claude Code that provides domain knowledge about ${skillName}.

## PROJECT CONTEXT

**Goal:** ${context.goal.description}
**Category:** ${context.goal.category}
**Framework:** ${context.codebase.framework || 'None'}
**Language:** ${context.codebase.language || 'Not detected'}

**How ${skillName} is used in this project:**
${context.codebase.dependencies.find(d => d.name.includes(skillName))
            ? `Detected as dependency: ${context.codebase.dependencies.find(d => d.name.includes(skillName))?.version}`
            : 'Part of the tech stack for ' + context.goal.category}

**Detected Patterns:**
${context.codebase.detectedPatterns.map(p => `- ${p.type}: ${p.description}`).join('\n') || 'None'}
${examplesSection}

## YOUR TASK

Generate a comprehensive skill file that provides practical knowledge about ${skillName} specifically for THIS project.

Include:
- When to use this skill
- Key concepts relevant to ${context.goal.category} projects
- Code examples matching this project's style
- Common pitfalls specific to this stack
- Related skills

## OUTPUT FORMAT

\`\`\`markdown
# ${skillName} Skill

> [Brief description of what this skill covers]

## When to Use

[Describe when this skill is relevant, specific to ${context.goal.category} projects]

## Key Concepts

| Concept | Description | Example Use Case |
|---------|-------------|------------------|
| [concept] | [what it is] | [when to use in this project] |

## Project-Specific Patterns

[Describe how ${skillName} is actually used in THIS codebase. Use examples from the sampled files.]

## Code Examples

[Provide 2-3 code examples that match the style and patterns detected in this project]

\`\`\`${context.codebase.language === 'typescript' ? 'typescript' : 'javascript'}
// Example 1: [describe what this shows]
[code example matching project style]
\`\`\`

## Common Pitfalls

- [Pitfall 1 specific to this tech stack]
- [Pitfall 2 with explanation]
- [How to avoid them]

## Related Skills

- [List other skills that work well with this one]

## Context7 Resources

For up-to-date ${skillName} documentation, use:
\`\`\`
mcp__context7__resolve-library-id with "${skillName}"
mcp__context7__query-docs for specific questions
\`\`\`

---

Generated by SuperAgents for ${context.goal.category} project
\`\`\`

Be SPECIFIC to this project, include REAL examples, and focus on PRACTICAL usage.`;
    }
    /**
     * Build prompt for CLAUDE.md generation
     */
    buildClaudeMdPrompt(context) {
        return `You are generating the root CLAUDE.md file for a Claude Code project.

## USER'S GOAL

${context.goal.description}

**Category:** ${context.goal.category}

**Technical Requirements:**
${context.goal.technicalRequirements?.map(req => `- ${req.category}: ${req.description}`).join('\n') || 'To be determined'}

## CURRENT CODEBASE

**Project Type:** ${context.codebase.projectType}
**Language:** ${context.codebase.language || 'Not detected'}
**Framework:** ${context.codebase.framework || 'None'}

**Dependencies:**
${context.codebase.dependencies.slice(0, 10).map(d => `- ${d.name}@${d.version}`).join('\n')}

**Detected Patterns:**
${context.codebase.detectedPatterns.map(p => `- ${p.type}: ${p.paths.length} files`).join('\n') || 'None yet'}

**File Structure:**
${context.sampledFiles.map(f => `- ${f.path}`).join('\n')}

## SELECTED CONFIGURATIONS

**Agents:** ${context.selectedAgents.join(', ')}
**Skills:** ${context.selectedSkills.join(', ')}

## YOUR TASK

Generate a comprehensive CLAUDE.md file that:
1. Describes the project's goal and vision
2. Documents the current tech stack
3. Explains the project structure
4. Lists available agents with when to use each
5. Lists available skills with descriptions
6. Provides quick-start guidance

## OUTPUT FORMAT

\`\`\`markdown
# ${context.goal.description}

## Vision

[Expand on the project goal - what are we building and why?]

**Project Type:** ${context.goal.category}
**Status:** ${context.codebase.totalFiles > 0 ? 'Enhancing existing codebase' : 'Starting new project'}
**Generated:** ${new Date(context.generatedAt).toLocaleString()}

## What We're Building

[Detailed description of the project vision and key objectives]

Key objectives:
${context.goal.technicalRequirements?.map(req => `- ${req.description}`).join('\n') || '- To be defined'}

## Current Tech Stack

[List the actual technologies detected in the codebase]

## Project Structure

[Describe the actual file structure based on detected patterns and sampled files]

## Detected Patterns

[For each detected pattern, explain what it is and how many files]

## Available Agents

Use \`/agent <name>\` to switch to specialized agents:

${context.selectedAgents.map(name => `- **${name}** - [when to use this agent]`).join('\n')}

## Available Skills

Use \`Skill(name)\` to load domain knowledge:

${context.selectedSkills.map(name => `- **${name}** - [what this skill provides]`).join('\n')}

## Quick Start

### Common Workflows

1. **Adding New Features**
   - [Specific steps for this project]

2. **Making Changes**
   - [How to approach changes]

3. **Getting Help**
   - Use Context7 for up-to-date docs
   - Ask agents for specific guidance

---

Generated by SuperAgents - Goal-aware configuration for Claude Code
\`\`\`

Be SPECIFIC, DETAILED, and PROJECT-FOCUSED.`;
    }
    generatePlaceholderAgent(name, context) {
        return `---
name: ${name}
description: |
  ${name} agent for ${context.goal.description}
tools: Read, Edit, Write, Glob, Grep, Bash
model: ${context.selectedModel}
skills: ${context.selectedSkills.join(', ')}
---

# ${name}

## Project Context

**Goal:** ${context.goal.description}
**Category:** ${context.goal.category}
**Project Type:** ${context.codebase.projectType}
**Framework:** ${context.codebase.framework || 'None detected'}

## Responsibilities

This agent helps you achieve your project goals by handling ${name}-related tasks.

## Key Patterns

Detected patterns in your codebase:
${context.codebase.detectedPatterns.map(p => `- ${p.type}: ${p.description}`).join('\n') || '- No patterns detected yet'}

## Critical Rules

1. Always understand the project goal
2. Follow existing codebase patterns
3. Write clean, maintainable code
4. Test your changes

---

Generated by SuperAgents - Goal-aware configuration for Claude Code
`;
    }
    generatePlaceholderSkill(name, context) {
        return `# ${name} Skill

> Knowledge for ${name} in the context of: ${context.goal.description}

## When to Use

Use this skill when working with ${name} related tasks for ${context.goal.category} projects.

## Project-Specific Context

- **Framework:** ${context.codebase.framework || 'None'}
- **Language:** ${context.codebase.language}
- **Dependencies:** ${context.codebase.dependencies.map(d => d.name).join(', ') || 'None detected'}

## Key Concepts

[To be generated with full AI implementation]

## Code Examples

[To be generated with full AI implementation]

## Common Pitfalls

[To be generated with full AI implementation]

---

Generated by SuperAgents
`;
    }
    generateSkillLoaderHook(skills) {
        return `#!/bin/bash
# SuperAgents: Skill Loading Hook
# This hook reminds Claude to load relevant skills before starting work

cat <<'EOF'
📚 SKILL LOADING PROTOCOL

Before starting work, scan available skills and load relevant ones:

Available Skills:
${skills.map(s => `- ${s}`).join('\n')}

Process:
1. Review the user's request
2. Identify which skills are relevant
3. Load them using: Skill(skillname)
4. Then proceed with the task

Example:
User: "Add a new feature"

Response:
I'll help you add that feature. Loading relevant skills:
> Skill(${skills[0] || 'typescript'})
> Skill(${skills[1] || 'nodejs'})

[Then proceed with implementation]

EOF
`;
    }
    generateClaudeMd(context) {
        return `# ${context.goal.description}

## Vision

${context.goal.description}

**Project Type:** ${context.goal.category}
**Generated:** ${new Date(context.generatedAt).toLocaleString()}

## What We're Building

This project aims to create ${context.goal.description.toLowerCase()}.

## Current Tech Stack

- **Project Type:** ${context.codebase.projectType}
- **Language:** ${context.codebase.language}
- **Framework:** ${context.codebase.framework || 'None detected'}
${context.codebase.dependencies.length > 0 ? `- **Key Dependencies:** ${context.codebase.dependencies.slice(0, 5).map(d => d.name).join(', ')}` : ''}

## Project Structure

${context.codebase.detectedPatterns.length > 0
            ? context.codebase.detectedPatterns.map(p => `### ${p.type}\n${p.description} (${p.paths.length} files)`).join('\n\n')
            : 'Project structure will be analyzed as development progresses.'}

## Available Agents

Use \`/agent <name>\` to switch to specialized agents:

${context.selectedAgents.map(name => `- **${name}**`).join('\n')}

## Available Skills

Use \`Skill(name)\` to load domain knowledge:

${context.selectedSkills.map(name => `- **${name}**`).join('\n')}

## Quick Start

### Making Changes

1. Switch to appropriate agent: \`/agent <name>\`
2. Load relevant skills: \`Skill(skillname)\`
3. Describe what you want to build

### Getting Help

- Ask Claude about the codebase
- Request code reviews
- Get implementation suggestions

---

Generated by SuperAgents - Goal-aware configuration for Claude Code
`;
    }
    /**
     * Execute a prompt using the appropriate auth method
     */
    async executePrompt(prompt, context) {
        if (context.authMethod === 'claude-plan') {
            return await executeWithClaudeCLI(prompt, context.selectedModel);
        }
        else {
            if (!context.apiKey) {
                throw new Error('API key is required for api-key auth method');
            }
            const anthropic = new Anthropic({ apiKey: context.apiKey });
            const modelId = context.selectedModel === 'opus'
                ? 'claude-opus-4-5-20251101'
                : 'claude-sonnet-4-5-20250929';
            const response = await anthropic.messages.create({
                model: modelId,
                max_tokens: 8000, // Increased for more detailed responses
                messages: [{ role: 'user', content: prompt }]
            });
            return response.content[0].type === 'text' ? response.content[0].text : '';
        }
    }
}
//# sourceMappingURL=index.js.map