/**
 * Compressed prompt templates for AI generation
 *
 * Design goals:
 * - Reduce token usage by 30-50%
 * - Remove redundancy and verbose examples
 * - Use concise language while maintaining quality
 */

import type { GenerationContext } from '../types/generation.js';

/**
 * Summarize a file to its essential structure (imports, exports, function signatures)
 * This reduces token usage significantly compared to full file content
 */
export function summarizeFile(content: string, filename: string): string {
  const lines = content.split('\n');
  const summary: string[] = [];

  // Extract imports
  const imports = lines.filter(l => l.trim().startsWith('import ') || l.trim().startsWith('from '));
  if (imports.length > 0) {
    summary.push('// Imports:', ...imports.slice(0, 10));
    if (imports.length > 10) summary.push(`// ... ${imports.length - 10} more imports`);
  }

  // Extract exports
  const exports = lines.filter(l => l.trim().startsWith('export '));
  if (exports.length > 0) {
    summary.push('', '// Exports:');
    for (const exp of exports.slice(0, 15)) {
      // For function exports, just show signature (first line)
      summary.push(exp.replace(/\{[\s\S]*$/, '{ ... }'));
    }
    if (exports.length > 15) summary.push(`// ... ${exports.length - 15} more exports`);
  }

  // Extract function/class signatures (non-exported)
  const signatures = lines.filter(l =>
    (l.trim().startsWith('function ') ||
     l.trim().startsWith('async function ') ||
     l.trim().startsWith('class ') ||
     l.trim().match(/^(const|let)\s+\w+\s*=\s*(async\s*)?\(/)) &&
    !l.trim().startsWith('export')
  );
  if (signatures.length > 0) {
    summary.push('', '// Functions/Classes:');
    summary.push(...signatures.slice(0, 10).map(s => s.replace(/\{[\s\S]*$/, '{ ... }')));
  }

  // For config files (package.json, tsconfig), keep key fields
  if (filename.endsWith('.json')) {
    try {
      const json = JSON.parse(content);
      if (filename === 'package.json') {
        return JSON.stringify({
          name: json.name,
          scripts: json.scripts ? Object.keys(json.scripts) : [],
          dependencies: json.dependencies ? Object.keys(json.dependencies) : [],
          devDependencies: json.devDependencies ? Object.keys(json.devDependencies) : []
        }, null, 2);
      }
      // For other JSON, truncate to essential fields
      return JSON.stringify(json, null, 2).slice(0, 500);
    } catch {
      return content.slice(0, 500);
    }
  }

  return summary.length > 0 ? summary.join('\n') : content.slice(0, 500);
}

/**
 * Build compact context section for prompts
 */
export function buildContextSection(context: GenerationContext): string {
  const deps = context.codebase.dependencies.slice(0, 8).map(d => d.name).join(', ');
  const patterns = context.codebase.detectedPatterns.map(p => `${p.type}(${p.paths.length})`).join(', ');

  return `## Context
Goal: ${context.goal.description}
Category: ${context.goal.category}
Stack: ${context.codebase.language}/${context.codebase.framework || 'none'}
Deps: ${deps || 'none'}
Patterns: ${patterns || 'none'}`;
}

/**
 * Build compact file samples section
 */
export function buildSamplesSection(context: GenerationContext, maxFiles: number = 3): string {
  if (context.sampledFiles.length === 0) return '';

  const samples = context.sampledFiles.slice(0, maxFiles).map(f => {
    const summary = summarizeFile(f.content, f.path);
    return `**${f.path}**:\n\`\`\`\n${summary}\n\`\`\``;
  });

  return `## Code Samples\n${samples.join('\n\n')}`;
}

/**
 * Compressed agent prompt template
 */
export function buildAgentPrompt(agentName: string, context: GenerationContext): string {
  const contextSection = buildContextSection(context);
  const samplesSection = buildSamplesSection(context, 2);

  return `Generate a Claude Code agent config for "${agentName}".

${contextSection}

Skills: ${context.selectedSkills.join(', ')}
${samplesSection}

## Output Format

\`\`\`yaml
---
name: ${agentName}
description: [2-3 lines: what this agent does for ${context.goal.category} projects]
tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
model: ${context.selectedModel}
skills: ${context.selectedSkills.join(', ')}
---
\`\`\`

# ${agentName}

Senior ${agentName} for: **${context.goal.description}**

## Project Context
[What we're building, current state]

## Tech Stack
[Technologies from this codebase]

## Key Locations
\`\`\`
[Actual file structure]
\`\`\`

## Patterns & Conventions
[Detected patterns with code examples]

## Rules
1. [Must-follow rules for this stack]
2. [Framework-specific practices]
3. [Goal-specific requirements]

## Context7
Use mcp__context7__resolve-library-id then mcp__context7__query-docs for docs.

---
Be SPECIFIC and PROJECT-FOCUSED. No generic advice.`;
}

/**
 * Compressed skill prompt template
 */
export function buildSkillPrompt(skillName: string, context: GenerationContext): string {
  const contextSection = buildContextSection(context);

  // Find relevant files for this skill
  const relevantFiles = context.sampledFiles
    .filter(f => f.content.toLowerCase().includes(skillName) || f.path.toLowerCase().includes(skillName))
    .slice(0, 2);

  const examplesSection = relevantFiles.length > 0
    ? `## Examples\n${relevantFiles.map(f => `**${f.path}**:\n\`\`\`\n${summarizeFile(f.content, f.path)}\n\`\`\``).join('\n\n')}`
    : '';

  return `Generate a skill file for "${skillName}".

${contextSection}
${examplesSection}

## Output

# ${skillName} Skill

> [Brief description]

## When to Use
[When relevant for ${context.goal.category} projects]

## Key Concepts
| Concept | Description | Use Case |
|---------|-------------|----------|
| [concept] | [what] | [when] |

## Patterns
[How ${skillName} is used in THIS codebase]

## Examples
\`\`\`${context.codebase.language === 'typescript' ? 'typescript' : 'javascript'}
// [Matching project style]
\`\`\`

## Pitfalls
- [Stack-specific pitfalls]

## Context7
\`mcp__context7__query-docs\` for ${skillName} docs.

---
Be SPECIFIC. Include REAL examples.`;
}

/**
 * Coding Principles - MANDATORY section for all generated CLAUDE.md files
 * These guidelines ensure consistent, high-quality AI-assisted development
 */
const CODING_PRINCIPLES = `## Coding Principles

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

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.`;

/**
 * Compressed CLAUDE.md prompt template
 */
export function buildClaudeMdPrompt(context: GenerationContext): string {
  const deps = context.codebase.dependencies.slice(0, 10).map(d => `${d.name}@${d.version}`).join(', ');
  const patterns = context.codebase.detectedPatterns.map(p => `${p.type}: ${p.paths.length} files`).join('\n');
  const files = context.sampledFiles.map(f => f.path).join('\n');

  return `Generate CLAUDE.md for this project. IMPORTANT: Include the Coding Principles section EXACTLY as provided.

## Goal
${context.goal.description}
Category: ${context.goal.category}

## Codebase
Type: ${context.codebase.projectType}
Lang: ${context.codebase.language}
Framework: ${context.codebase.framework || 'none'}
Deps: ${deps}

Patterns:
${patterns || 'none'}

Files:
${files}

## Config
Agents: ${context.selectedAgents.join(', ')}
Skills: ${context.selectedSkills.join(', ')}

## Output Format (follow exactly)

# ${context.goal.description}

## Vision
[Project goal and vision - expand on what we're building]

**Type:** ${context.goal.category}
**Status:** ${context.codebase.totalFiles > 0 ? 'Enhancing' : 'New project'}
**Generated:** ${new Date(context.generatedAt).toLocaleString()}

## What We're Building
[Detailed description of the project and key objectives]

${CODING_PRINCIPLES}

## Tech Stack
[Detected technologies as table with Category | Technology | Purpose]

## Project Structure
[File structure based on detected patterns]

## Available Agents
Use \`/agent <name>\` to switch:
${context.selectedAgents.map(n => `- **${n}** - [describe when to use this agent]`).join('\n')}

## Available Skills
Use \`Skill(name)\` to load:
${context.selectedSkills.map(n => `- **${n}** - [describe what this skill provides]`).join('\n')}

## Quick Start
1. Switch agent: \`/agent <name>\`
2. Load skill: \`Skill(name)\`
3. Use Context7 for up-to-date docs

---
Generated by SuperAgents - Context-aware configuration for Claude Code`;
}
