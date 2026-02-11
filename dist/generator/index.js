/**
 * AI Generator - generates agents, skills, and CLAUDE.md using Claude AI
 *
 * Features:
 * - Parallel generation with concurrency limit
 * - Tiered model selection for cost optimization
 * - Verbose logging support
 */
// Node.js built-ins
import fs from 'fs-extra';
import path from 'path';
// External packages
import Anthropic from '@anthropic-ai/sdk';
import ora from 'ora';
// Internal modules
import { BLUEPRINTS } from '../blueprints/definitions.js';
import { renderRoadmap } from '../blueprints/renderer.js';
import { cache } from '../cache/index.js';
import { buildAgentPrompt as buildCompressedAgentPrompt, buildSkillPrompt as buildCompressedSkillPrompt, buildClaudeMdPrompt as buildCompressedClaudeMdPrompt } from '../prompts/templates.js';
import { hasCustomTemplate, loadCustomTemplate } from '../templates/custom.js';
import { hasTemplate, loadTemplate } from '../templates/loader.js';
import { executeWithClaudeCLI } from '../utils/claude-cli.js';
import { parallelGenerateWithErrors, withRetry } from '../utils/concurrency.js';
import { log } from '../utils/logger.js';
import { selectModel, getSkillComplexity, getModelDisplayName } from '../utils/model-selector.js';
// Max tokens scaled by generation type to optimize API costs
const MAX_TOKENS_BY_TYPE = {
    'agent': 2000,
    'skill': 1500,
    'claude-md': 3000,
    'hook': 1000
};
const DEFAULT_MAX_TOKENS = 2000;
export class AIGenerator {
    codebaseHash = '';
    anthropicClient = null;
    constructor() {
        // No need to store API key - we get it from context
    }
    /**
     * Get or create a shared Anthropic client instance.
     * Lazily initialized on first API call to avoid requiring an API key
     * when using Claude CLI auth.
     */
    getClient(apiKey) {
        if (!this.anthropicClient) {
            this.anthropicClient = new Anthropic({ apiKey });
        }
        return this.anthropicClient;
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
        const hooks = [];
        // Generate docs (template-based, no API calls)
        const docs = [
            this.generateArchitectureDoc(context),
            this.generatePatternsDoc(context),
            this.generateSetupDoc(context),
        ];
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
        // Generate slash commands (template-based, no API calls)
        const commands = this.generateSlashCommands(context);
        // Generate ROADMAP.md if a blueprint was selected
        let roadmapMd;
        if (context.selectedBlueprint) {
            const blueprint = BLUEPRINTS.find(b => b.id === context.selectedBlueprint);
            if (blueprint) {
                roadmapMd = renderRoadmap(blueprint, context);
                log.verbose(`Generated ROADMAP.md for blueprint: ${blueprint.name}`);
            }
        }
        spinner.succeed(`Generation complete! [100%]`);
        // Summary logging
        log.section('Generation Summary');
        log.verbose(`Agents generated: ${agents.length} (${agentResults.errors.length} fallbacks)`);
        log.verbose(`Skills generated: ${skills.length} (${skillResults.errors.length} fallbacks)`);
        log.verbose(`Commands generated: ${commands.length}`);
        // Check for git directory to conditionally add git permissions
        const hasGit = await fs.pathExists(path.join(context.codebase.projectRoot, '.git'));
        const settings = this.buildSettings(context, hasGit);
        return {
            agents,
            skills,
            hooks,
            commands,
            claudeMd,
            settings,
            docs,
            roadmapMd
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
description: ${name} agent for ${context.goal.category} projects
tools: Read, Edit, Write, Glob, Grep, Bash
model: ${context.selectedModel}
---

# ${name}

Senior ${name} for: **${context.goal.description}**

## Stack
${context.codebase.language}/${context.codebase.framework || 'none'} | ${context.codebase.projectType}

## Rules
- Follow existing codebase patterns
- Match current naming conventions and file structure
- No generic advice; be project-specific
${context.codebase.negativeConstraints.slice(0, 3).map(c => `- ${c.rule}`).join('\n')}

## Patterns
${context.codebase.detectedPatterns.slice(0, 5).map(p => `- ${p.type}: ${p.description}`).join('\n') || '- No patterns detected yet'}
`;
    }
    generatePlaceholderSkill(name, context) {
        return `# ${name}

> Conventions for ${name} in ${context.codebase.language}/${context.codebase.framework || 'none'} projects.

## Conventions
- Follow patterns established in this codebase
- ${context.codebase.packageManager} for package management
${context.codebase.negativeConstraints.filter(c => c.technology.toLowerCase().includes(name) || c.alternative.toLowerCase().includes(name)).map(c => `- ${c.rule}`).join('\n')}

## Context7
Use mcp__context7__resolve-library-id then mcp__context7__query-docs for up-to-date ${name} docs.
`;
    }
    /**
     * Build settings.json with permissions, deny lists, and optional lint/format hook
     */
    buildSettings(context, hasGit) {
        const pm = context.codebase.packageManager;
        const lintCmd = context.codebase.lintCommand;
        const formatCmd = context.codebase.formatCommand;
        const allowPerms = [
            'Read(*)',
            'Write(src/**)',
            'Write(docs/**)',
            `Bash(${pm} *)`,
            'Bash(npx *)',
        ];
        const denyPerms = [
            'Read(.env*)',
            'Bash(rm -rf *)',
            `Bash(${pm} publish *)`,
        ];
        // Add git permissions only if project has git
        if (hasGit) {
            allowPerms.push('Bash(git status)', 'Bash(git diff *)', 'Bash(git log *)', 'Bash(git add *)');
            denyPerms.push('Bash(git push --force *)', 'Bash(git push *)', 'Bash(git checkout main)');
        }
        const settings = {
            agents: context.selectedAgents,
            skills: context.selectedSkills,
            model: context.selectedModel,
            permissions: {
                allow: allowPerms,
                deny: denyPerms,
            }
        };
        // Build Stop hook with format + lint commands
        if (lintCmd || formatCmd) {
            const hookCommands = [];
            if (formatCmd)
                hookCommands.push(`${formatCmd} 2>/dev/null`);
            if (lintCmd)
                hookCommands.push(`${lintCmd} --fix --quiet 2>/dev/null`);
            hookCommands.push('exit 0');
            settings.hooks = {
                Stop: [{
                        hooks: [{
                                type: 'command',
                                command: hookCommands.join('; ')
                            }]
                    }]
            };
        }
        return settings;
    }
    /**
     * Generate architecture doc from detected patterns, deps, file structure
     */
    generateArchitectureDoc(context) {
        const { codebase } = context;
        const deps = codebase.dependencies.slice(0, 10).map(d => `- ${d.name}@${d.version} (${d.category})`).join('\n');
        const patterns = codebase.detectedPatterns.map(p => `- **${p.type}**: ${p.description} (${p.paths.length} files)`).join('\n');
        const content = `# Architecture

## Stack
${codebase.language}/${codebase.framework || 'none'} | ${codebase.projectType}

## Key Dependencies
${deps || 'None detected'}

## Detected Patterns
${patterns || 'None detected'}

## Directory Layout
${codebase.fileStructure.slice(0, 20).map(n => `- ${n.path} (${n.type})`).join('\n') || 'Not available'}

## Total
${codebase.totalFiles} files, ~${codebase.totalLines} lines
`;
        return { filename: 'architecture.md', content, subfolder: 'docs' };
    }
    /**
     * Generate patterns doc with sampled file references
     */
    generatePatternsDoc(context) {
        const { codebase } = context;
        const patternSections = codebase.detectedPatterns.map(p => {
            const samplePaths = p.paths.slice(0, 5).map(path => `  - \`${path}\``).join('\n');
            return `### ${p.type}
${p.description}
Confidence: ${Math.round(p.confidence * 100)}%
Files:
${samplePaths}`;
        });
        const constraints = codebase.negativeConstraints.map(c => `- ${c.rule}`).join('\n');
        const content = `# Patterns & Conventions

## Detected Patterns
${patternSections.join('\n\n') || 'No patterns detected yet.'}

## Negative Constraints
${constraints || 'None detected.'}
`;
        return { filename: 'patterns.md', content, subfolder: 'docs' };
    }
    /**
     * Generate setup doc with MCP suggestions, commands, onboarding
     */
    generateSetupDoc(context) {
        const { codebase } = context;
        const pm = codebase.packageManager;
        const commands = [
            codebase.testCommand ? `| Test | \`${codebase.testCommand}\` |` : null,
            codebase.lintCommand ? `| Lint | \`${codebase.lintCommand}\` |` : null,
            codebase.devCommand ? `| Dev | \`${codebase.devCommand}\` |` : null,
            codebase.buildCommand ? `| Build | \`${codebase.buildCommand}\` |` : null,
        ].filter(Boolean).join('\n');
        const mcpSection = codebase.mcpSuggestions.length > 0
            ? codebase.mcpSuggestions.map(s => `### ${s.name}\n${s.reason}\n\`\`\`bash\n${s.installCommand}\n\`\`\``).join('\n\n')
            : 'No MCP servers suggested.';
        const content = `# Setup & Onboarding

## Package Manager
${pm}

## Commands
| Action | Command |
|--------|---------|
${commands || '| (none detected) | |'}

## MCP Server Suggestions
${mcpSection}

## Getting Started
1. \`${pm} install\` to install dependencies
${codebase.devCommand ? `2. \`${codebase.devCommand}\` to start development` : ''}
${codebase.testCommand ? `3. \`${codebase.testCommand}\` to run tests` : ''}
`;
        return { filename: 'setup.md', content, subfolder: 'docs' };
    }
    /**
     * Fallback CLAUDE.md - lean, ~700 tokens, ~50 instructions
     */
    generateClaudeMd(context) {
        const { codebase } = context;
        const deps = codebase.dependencies.slice(0, 5).map(d => d.name).join(', ');
        const constraintLines = codebase.negativeConstraints
            .slice(0, 10)
            .map(c => `- ${c.rule}`);
        if (codebase.hasEnvFile) {
            constraintLines.push('- Never commit or read .env files');
        }
        const commandRows = [
            codebase.testCommand ? `| Test | \`${codebase.testCommand}\` |` : null,
            codebase.lintCommand ? `| Lint | \`${codebase.lintCommand}\` |` : null,
            codebase.devCommand ? `| Dev | \`${codebase.devCommand}\` |` : null,
            codebase.buildCommand ? `| Build | \`${codebase.buildCommand}\` |` : null,
        ].filter(Boolean).join('\n');
        const patternLines = codebase.detectedPatterns
            .slice(0, 5)
            .map(p => `- ${p.type}: ${p.description}`).join('\n');
        return `# ${context.goal.description}

## Stack
${codebase.language}/${codebase.framework || 'none'} | ${codebase.projectType}${deps ? ` | ${deps}` : ''}

## Hard Rules
${constraintLines.length > 0 ? constraintLines.join('\n') : '- Follow existing codebase patterns'}
- No features beyond what was asked
- No abstractions for single-use code
- Match existing code style

## Commands
| Action | Command |
|--------|---------|
${commandRows || '| (none detected) | |'}

## Architecture
${patternLines || 'No patterns detected yet.'}

## Conventions
- File naming: match existing convention in the codebase
- Import order: built-ins, external packages, internal modules, type imports
- Named exports preferred over default exports
- Type \`import type\` for type-only imports
- Code style enforced by Stop hook — do not add style rules here

## Before Coding
1. **Think**: State assumptions, surface tradeoffs, ask if unclear
2. **Simplify**: Minimum code that solves the problem, nothing speculative
3. **Surgical**: Touch only what you must, clean up only your own mess
4. **Verify**: Define success criteria, write tests, loop until green

## Session Continuity
- Run /recap at end of each session to save progress
- Check docs/session-recap.md at start of each session for context

## Deep Context
See \`.claude/docs/\` for architecture, patterns, and setup details.
`;
    }
    /**
     * Generate slash commands from detected project commands
     */
    generateSlashCommands(context) {
        const build = context.codebase.buildCommand || 'npm run build';
        const lint = context.codebase.lintCommand || 'npm run lint';
        const test = context.codebase.testCommand || 'npm test';
        return [
            {
                filename: 'status.md',
                commandName: 'status',
                content: `Read the project structure, check for build errors (\`${build}\`), and report:
1. What features/pages exist and are working
2. What's broken (build errors, missing env vars, type errors)
3. What's next based on CLAUDE.md or ROADMAP.md
Report in plain language. No jargon.
`
            },
            {
                filename: 'fix.md',
                commandName: 'fix',
                content: `If a problem description follows this command, investigate that specific issue first.
Otherwise:
1. Run \`${build}\` and capture errors
2. Run \`${lint}\` and capture errors
3. Fix all errors you find
4. Run build again to verify
5. Report what was fixed
`
            },
            {
                filename: 'next.md',
                commandName: 'next',
                content: `Read CLAUDE.md and ROADMAP.md (if exists). Check docs/session-recap.md for context from last session.
Based on current project state:
1. What has already been built? (check existing files and git log)
2. What is the next logical step?
3. Describe the task clearly and ask if I should proceed.
`
            },
            {
                filename: 'recap.md',
                commandName: 'recap',
                content: `Summarize this session:
1. What files were created or changed?
2. What features were added or fixed?
3. What's still incomplete or broken?
4. What should I start with next time?
Write a concise summary (< 20 lines) I can paste into my next session.
`
            },
            {
                filename: 'ship.md',
                commandName: 'ship',
                content: `1. Run \`${build}\` — fix any errors
2. Run \`${test}\` — fix any failures
3. Run \`${lint} --fix\`
4. \`git add -A && git status\` — show what will be committed
5. Suggest a commit message based on changes
6. STOP and ask for confirmation before committing
`
            }
        ];
    }
    /**
     * Execute a prompt using the appropriate auth method
     * @param generationType - Type of generation for max_tokens scaling
     */
    async executePrompt(prompt, context, model, generationType = 'agent') {
        if (context.authMethod === 'claude-plan') {
            // For Claude CLI, we pass the user's selected model preference
            return await withRetry(() => executeWithClaudeCLI(prompt, context.selectedModel));
        }
        else {
            // For API key method
            if (!context.apiKey) {
                throw new Error('API key is required for api-key auth method');
            }
            const client = this.getClient(context.apiKey);
            const maxTokens = MAX_TOKENS_BY_TYPE[generationType] || DEFAULT_MAX_TOKENS;
            log.debug(`Calling API with model: ${model}, max_tokens: ${maxTokens}`);
            const response = await withRetry(() => client.messages.create({
                model,
                max_tokens: maxTokens,
                messages: [{ role: 'user', content: prompt }]
            }));
            return response.content[0].type === 'text' ? response.content[0].text : '';
        }
    }
}
//# sourceMappingURL=index.js.map