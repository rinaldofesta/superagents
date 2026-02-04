/**
 * AI Generator - generates agents, skills, and CLAUDE.md using Claude AI
 *
 * Features:
 * - Parallel generation with concurrency limit
 * - Tiered model selection for cost optimization
 * - Verbose logging support
 */
// External packages
import Anthropic from '@anthropic-ai/sdk';
import ora from 'ora';
// Internal modules
import { cache } from '../cache/index.js';
import { buildAgentPrompt as buildCompressedAgentPrompt, buildSkillPrompt as buildCompressedSkillPrompt, buildClaudeMdPrompt as buildCompressedClaudeMdPrompt } from '../prompts/templates.js';
import { hasCustomTemplate, loadCustomTemplate } from '../templates/custom.js';
import { hasTemplate, loadTemplate } from '../templates/loader.js';
import { executeWithClaudeCLI } from '../utils/claude-cli.js';
import { parallelGenerateWithErrors } from '../utils/concurrency.js';
import { log } from '../utils/logger.js';
import { selectModel, getSkillComplexity, getModelDisplayName } from '../utils/model-selector.js';
// Max tokens scaled by generation type to optimize API costs
const MAX_TOKENS_BY_TYPE = {
    'agent': 8000,
    'skill': 4000,
    'claude-md': 6000,
    'hook': 2000
};
const DEFAULT_MAX_TOKENS = 8000;
export class AIGenerator {
    codebaseHash = '';
    constructor() {
        // No need to store API key - we get it from context
    }
    async generateAll(context) {
        // Validate inputs to prevent cryptic runtime errors
        if (context.selectedAgents.length === 0 && context.selectedSkills.length === 0) {
            throw new Error('No agents or skills selected. Nothing to generate.');
        }
        if (!context.goal || !context.goal.description) {
            throw new Error('Project goal is required for generation.');
        }
        if (!context.codebase || !context.codebase.projectRoot) {
            throw new Error('Codebase analysis is required for generation.');
        }
        // Get codebase hash for caching
        this.codebaseHash = await cache.getCodebaseHash(context.codebase.projectRoot);
        log.debug(`Using codebase hash for cache: ${this.codebaseHash}`);
        const totalItems = context.selectedAgents.length + context.selectedSkills.length + 1;
        let completed = 0;
        const getPercent = () => Math.round((completed / totalItems) * 100);
        const spinner = ora({
            text: `Generating... 0%`,
            spinner: 'dots'
        }).start();
        const updateProgress = (type, name, status, error) => {
            if (status === 'start') {
                spinner.text = `[${getPercent()}%] Generating ${type}: ${name}...`;
            }
            else if (status === 'success') {
                completed++;
                spinner.text = `[${getPercent()}%] ✓ ${type}: ${name}`;
                log.verbose(`Generated ${type}: ${name}`);
            }
            else {
                completed++;
                spinner.warn(`[${getPercent()}%] ⚠ ${type}: ${name} - ${error}`);
                spinner.start();
                log.verbose(`Failed ${type}: ${name} - ${error}`);
            }
        };
        log.section('Starting Generation');
        log.verbose(`Total items to generate: ${totalItems}`);
        log.verbose(`Agents: ${context.selectedAgents.join(', ')}`);
        log.verbose(`Skills: ${context.selectedSkills.join(', ')}`);
        // Generate agents in parallel
        log.debug('Generating agents in parallel...');
        const agentResults = await parallelGenerateWithErrors(context.selectedAgents, async (agentName) => {
            updateProgress('agent', agentName, 'start');
            const model = selectModel({
                userSelectedModel: context.selectedModel,
                generationType: 'agent',
                itemName: agentName // Pass agent name for complexity-based model selection
            });
            log.verbose(`Agent ${agentName} using model: ${getModelDisplayName(model)}`);
            const content = await this.generateAgent(agentName, context, model);
            return {
                filename: `${agentName}.md`,
                content,
                agentName
            };
        }, (agentName, _result) => updateProgress('agent', agentName, 'success'), (agentName, error) => {
            updateProgress('agent', agentName, 'error', error.message);
        });
        // Report aggregate errors for visibility
        if (agentResults.errors.length > 0) {
            log.verbose(`⚠ ${agentResults.errors.length} agent(s) failed, using fallback templates`);
            for (const { item, error } of agentResults.errors) {
                log.debug(`Agent "${item}" error: ${error.message}`);
            }
        }
        // Fail if majority of agents failed (indicates systemic issue)
        const agentFailureThreshold = 0.5;
        if (context.selectedAgents.length > 0 &&
            agentResults.errors.length > context.selectedAgents.length * agentFailureThreshold) {
            const errorSummary = agentResults.errors
                .slice(0, 3)
                .map(e => `${e.item}: ${e.error.message}`)
                .join('; ');
            throw new Error(`Generation failed for ${agentResults.errors.length}/${context.selectedAgents.length} agents. ` +
                `This may indicate an API or authentication issue. Errors: ${errorSummary}`);
        }
        // Add successful agents and fallbacks for failed ones
        const agents = [...agentResults.results];
        for (const { item: agentName } of agentResults.errors) {
            agents.push({
                filename: `${agentName}.md`,
                content: this.generatePlaceholderAgent(agentName, context),
                agentName
            });
        }
        // Generate skills in parallel
        log.debug('Generating skills in parallel...');
        const skillResults = await parallelGenerateWithErrors(context.selectedSkills, async (skillName) => {
            updateProgress('skill', skillName, 'start');
            const complexity = getSkillComplexity(skillName);
            const model = selectModel({
                userSelectedModel: context.selectedModel,
                generationType: 'skill',
                complexity,
                itemName: skillName // Pass skill name for logging consistency
            });
            log.verbose(`Skill ${skillName} (${complexity}) using model: ${getModelDisplayName(model)}`);
            const content = await this.generateSkill(skillName, context, model);
            return {
                filename: `${skillName}.md`,
                content,
                skillName
            };
        }, (skillName, _result) => updateProgress('skill', skillName, 'success'), (skillName, error) => {
            updateProgress('skill', skillName, 'error', error.message);
        });
        // Report aggregate errors for skills
        if (skillResults.errors.length > 0) {
            log.verbose(`⚠ ${skillResults.errors.length} skill(s) failed, using fallback templates`);
            for (const { item, error } of skillResults.errors) {
                log.debug(`Skill "${item}" error: ${error.message}`);
            }
        }
        // Fail if majority of skills failed
        const skillFailureThreshold = 0.5;
        if (context.selectedSkills.length > 0 &&
            skillResults.errors.length > context.selectedSkills.length * skillFailureThreshold) {
            const errorSummary = skillResults.errors
                .slice(0, 3)
                .map(e => `${e.item}: ${e.error.message}`)
                .join('; ');
            throw new Error(`Generation failed for ${skillResults.errors.length}/${context.selectedSkills.length} skills. ` +
                `This may indicate an API or authentication issue. Errors: ${errorSummary}`);
        }
        // Add successful skills and fallbacks for failed ones
        const skills = [...skillResults.results];
        for (const { item: skillName } of skillResults.errors) {
            skills.push({
                filename: `${skillName}.md`,
                content: this.generatePlaceholderSkill(skillName, context),
                skillName
            });
        }
        const hooks = [{
                filename: 'skill-loader.sh',
                content: this.generateSkillLoaderHook(context.selectedSkills),
                hookName: 'skill-loader'
            }];
        // Generate CLAUDE.md using AI
        updateProgress('file', 'CLAUDE.md', 'start');
        let claudeMd;
        try {
            const claudeModel = selectModel({
                userSelectedModel: context.selectedModel,
                generationType: 'claude-md'
            });
            log.verbose(`CLAUDE.md using model: ${getModelDisplayName(claudeModel)}`);
            claudeMd = await this.generateClaudeMdWithAI(context, claudeModel);
            updateProgress('file', 'CLAUDE.md', 'success');
        }
        catch (error) {
            updateProgress('file', 'CLAUDE.md', 'error', error instanceof Error ? error.message : 'Unknown error');
            claudeMd = this.generateClaudeMd(context);
        }
        spinner.succeed(`Generation complete! [100%]`);
        // Summary logging
        log.section('Generation Summary');
        log.verbose(`Agents generated: ${agents.length} (${agentResults.errors.length} fallbacks)`);
        log.verbose(`Skills generated: ${skills.length} (${skillResults.errors.length} fallbacks)`);
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
     * Generate an agent using local template or Claude AI (with caching)
     * Priority: 1. Cache, 2. Local template, 3. API
     */
    async generateAgent(agentName, context, model) {
        // Build cache key
        const cacheKey = {
            goalDescription: context.goal.description,
            codebaseHash: this.codebaseHash,
            itemType: 'agent',
            itemName: agentName,
            model
        };
        // Check cache first
        const cached = await cache.getCachedGeneration(cacheKey);
        if (cached) {
            log.verbose(`Cache hit for agent: ${agentName}`);
            return cached;
        }
        // Check for custom template first (user-provided takes priority)
        if (await hasCustomTemplate('agent', agentName)) {
            const template = await loadCustomTemplate('agent', agentName, context);
            if (template) {
                log.verbose(`Using custom template for agent: ${agentName}`);
                await cache.setCachedGeneration(cacheKey, template);
                return template;
            }
        }
        // Check for built-in template (reduces API calls)
        if (hasTemplate('agent', agentName)) {
            const template = await loadTemplate('agent', agentName, context);
            if (template) {
                log.verbose(`Using built-in template for agent: ${agentName}`);
                await cache.setCachedGeneration(cacheKey, template);
                return template;
            }
        }
        // Generate via API
        const prompt = this.buildAgentPrompt(agentName, context);
        const response = await this.executePrompt(prompt, context, model, 'agent');
        // Extract agent content if it's wrapped in markdown code blocks
        const cleaned = response.replace(/```markdown\n?/g, '').replace(/```\n?$/g, '').trim();
        // Save to cache
        await cache.setCachedGeneration(cacheKey, cleaned);
        log.verbose(`Cached agent: ${agentName}`);
        return cleaned;
    }
    /**
     * Generate a skill using local template or Claude AI (with caching)
     * Priority: 1. Cache, 2. Local template, 3. API
     */
    async generateSkill(skillName, context, model) {
        // Build cache key
        const cacheKey = {
            goalDescription: context.goal.description,
            codebaseHash: this.codebaseHash,
            itemType: 'skill',
            itemName: skillName,
            model
        };
        // Check cache first
        const cached = await cache.getCachedGeneration(cacheKey);
        if (cached) {
            log.verbose(`Cache hit for skill: ${skillName}`);
            return cached;
        }
        // Check for custom template first (user-provided takes priority)
        if (await hasCustomTemplate('skill', skillName)) {
            const template = await loadCustomTemplate('skill', skillName, context);
            if (template) {
                log.verbose(`Using custom template for skill: ${skillName}`);
                await cache.setCachedGeneration(cacheKey, template);
                return template;
            }
        }
        // Check for built-in template (reduces API calls)
        if (hasTemplate('skill', skillName)) {
            const template = await loadTemplate('skill', skillName, context);
            if (template) {
                log.verbose(`Using built-in template for skill: ${skillName}`);
                await cache.setCachedGeneration(cacheKey, template);
                return template;
            }
        }
        // Generate via API
        const prompt = this.buildSkillPrompt(skillName, context);
        const response = await this.executePrompt(prompt, context, model, 'skill');
        // Extract skill content if it's wrapped in markdown code blocks
        const cleaned = response.replace(/```markdown\n?/g, '').replace(/```\n?$/g, '').trim();
        // Save to cache
        await cache.setCachedGeneration(cacheKey, cleaned);
        log.verbose(`Cached skill: ${skillName}`);
        return cleaned;
    }
    /**
     * Generate CLAUDE.md using Claude AI (with caching)
     */
    async generateClaudeMdWithAI(context, model) {
        // Build cache key
        const cacheKey = {
            goalDescription: context.goal.description,
            codebaseHash: this.codebaseHash,
            itemType: 'claude-md',
            itemName: 'CLAUDE.md',
            model
        };
        // Check cache first
        const cached = await cache.getCachedGeneration(cacheKey);
        if (cached) {
            log.verbose(`Cache hit for CLAUDE.md`);
            return cached;
        }
        // Generate via API
        const prompt = this.buildClaudeMdPrompt(context);
        const response = await this.executePrompt(prompt, context, model, 'claude-md');
        // Extract content if it's wrapped in markdown code blocks
        const cleaned = response.replace(/```markdown\n?/g, '').replace(/```\n?$/g, '').trim();
        // Save to cache
        await cache.setCachedGeneration(cacheKey, cleaned);
        log.verbose(`Cached CLAUDE.md`);
        return cleaned;
    }
    /**
     * Build compressed prompt for agent generation
     * Uses centralized templates for consistency and reduced token usage
     */
    buildAgentPrompt(agentName, context) {
        return buildCompressedAgentPrompt(agentName, context);
    }
    /**
     * Build compressed prompt for skill generation
     * Uses centralized templates for consistency and reduced token usage
     */
    buildSkillPrompt(skillName, context) {
        return buildCompressedSkillPrompt(skillName, context);
    }
    /**
     * Build compressed prompt for CLAUDE.md generation
     * Uses centralized templates for consistency and reduced token usage
     */
    buildClaudeMdPrompt(context) {
        return buildCompressedClaudeMdPrompt(context);
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

Generated by SuperAgents - Context-aware configuration for Claude Code
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

## Coding Principles

> Behavioral guidelines to reduce common LLM coding mistakes. These bias toward caution over speed - use judgment for trivial tasks.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
\`\`\`
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
\`\`\`

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

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

Generated by SuperAgents - Context-aware configuration for Claude Code
`;
    }
    /**
     * Execute a prompt using the appropriate auth method
     * @param generationType - Type of generation for max_tokens scaling
     */
    async executePrompt(prompt, context, model, generationType = 'agent') {
        if (context.authMethod === 'claude-plan') {
            // For Claude CLI, we pass the user's selected model preference
            return await executeWithClaudeCLI(prompt, context.selectedModel);
        }
        else {
            // For API key method
            if (!context.apiKey) {
                throw new Error('API key is required for api-key auth method');
            }
            const anthropic = new Anthropic({ apiKey: context.apiKey });
            const maxTokens = MAX_TOKENS_BY_TYPE[generationType] || DEFAULT_MAX_TOKENS;
            log.debug(`Calling API with model: ${model}, max_tokens: ${maxTokens}`);
            const response = await anthropic.messages.create({
                model,
                max_tokens: maxTokens,
                messages: [{ role: 'user', content: prompt }]
            });
            return response.content[0].type === 'text' ? response.content[0].text : '';
        }
    }
}
//# sourceMappingURL=index.js.map