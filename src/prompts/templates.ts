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
 * Targets <=400 tokens, project-specific only
 */
export function buildAgentPrompt(agentName: string, context: GenerationContext): string {
  const contextSection = buildContextSection(context);
  const constraints = context.codebase.negativeConstraints.slice(0, 5).map(c => `- ${c.rule}`).join('\n');

  return `Generate a lean Claude Code agent config for "${agentName}". Max 400 tokens output.

${contextSection}
${constraints ? `\nConstraints:\n${constraints}` : ''}

## Output Structure (follow exactly)

\`\`\`yaml
---
name: ${agentName}
description: [1 line: role for ${context.goal.category}]
tools: Read, Edit, Write, Glob, Grep, Bash
model: ${context.selectedModel}
---
\`\`\`

# ${agentName}
Senior ${agentName} for: **${context.goal.description}**

## Stack
[1-liner: language/framework | project type]

## Rules
[5-15 bullet points: project-specific constraints, negative rules, stack-specific practices]

## Patterns
[Detected patterns from THIS codebase with file paths]

## Context7
Use mcp__context7__resolve-library-id then mcp__context7__query-docs for docs.

---
CRITICAL: No generic methodology. No framework tutorials. No code examples teaching basics. No "Expert Principles" section. Project-specific only.
NEVER include an "Expert Principles" section, methodology overview, or generic best practices.
NEVER list HTTP methods, SOLID principles, or testing pyramid — Claude knows these.`;
}

/**
 * Compressed skill prompt template
 * Targets <=300 tokens, conventions only
 */
export function buildSkillPrompt(skillName: string, context: GenerationContext): string {
  const contextSection = buildContextSection(context);
  const constraints = context.codebase.negativeConstraints
    .filter(c => c.technology.toLowerCase().includes(skillName) || c.alternative.toLowerCase().includes(skillName))
    .map(c => `- ${c.rule}`).join('\n');

  return `Generate a lean skill file for "${skillName}". Max 300 tokens output.

${contextSection}
${constraints ? `\nConstraints:\n${constraints}` : ''}

## Output Structure (follow exactly)

# ${skillName}

> [1-line: what this skill covers for ${context.goal.category} projects]

## Conventions
[5-10 bullet points: how ${skillName} is used in THIS codebase, naming, file structure, patterns]

## Pitfalls
[3-5 bullet points: stack-specific mistakes to avoid]

## Context7
Use mcp__context7__resolve-library-id then mcp__context7__query-docs for ${skillName} docs.

---
CRITICAL: Conventions only. No tutorials. No generic patterns. No Key Concepts table. No code examples teaching basics.
NEVER include a "Key Concepts" section or tutorial content.
Only reference patterns that exist in THIS codebase.`;
}

/**
 * Compressed CLAUDE.md prompt template
 * Targets <=50 instructions, ~700 tokens output
 */
export function buildClaudeMdPrompt(context: GenerationContext): string {
  const deps = context.codebase.dependencies.slice(0, 10).map(d => `${d.name}@${d.version}`).join(', ');
  const patterns = context.codebase.detectedPatterns.map(p => `${p.type}: ${p.paths.length} files`).join('\n');
  const constraints = context.codebase.negativeConstraints.map(c => `- ${c.rule}`).join('\n');

  const commands = [
    context.codebase.testCommand ? `Test: ${context.codebase.testCommand}` : null,
    context.codebase.lintCommand ? `Lint: ${context.codebase.lintCommand}` : null,
    context.codebase.devCommand ? `Dev: ${context.codebase.devCommand}` : null,
    context.codebase.buildCommand ? `Build: ${context.codebase.buildCommand}` : null,
  ].filter(Boolean).join('\n');

  return `IMPORTANT INSTRUCTIONS:
- Output ONLY the markdown content directly
- Do NOT use any tools, function calls, or XML tags
- Do NOT explore or read files - use ONLY the context provided below
- Start your response with the markdown heading immediately
- Target ~700 tokens, max 50 instructions

Generate a lean CLAUDE.md for this project.

## Goal
${context.goal.description}
Category: ${context.goal.category}

## Codebase
Type: ${context.codebase.projectType}
Lang: ${context.codebase.language}
Framework: ${context.codebase.framework || 'none'}
PackageManager: ${context.codebase.packageManager}
Deps: ${deps}
HasEnvFile: ${context.codebase.hasEnvFile}

Patterns:
${patterns || 'none'}

Negative Constraints:
${constraints || 'none'}

Commands:
${commands || 'none detected'}

## Output Format (follow exactly)

# [Project title from goal]

## Stack
[1-liner: language/framework | project type | key deps]

## Hard Rules
[5-15 bullet points: negative constraints from above, security rules if .env exists, "no features beyond asked", "no abstractions for single-use code", "match existing style"]

## Commands
| Action | Command |
|--------|---------|
[detected commands as table rows]

## Architecture
[2-3 lines referencing detected patterns]

## Conventions
[5-7 lines: file naming, import order, export style, type imports, formatting]

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

---
CRITICAL: No agents/skills lists. No "Generated by SuperAgents". No full Coding Principles (use the 4-line "Before Coding" section). No verbose explanations. Lean and specific.
Include a "Session Continuity" section telling the user to run /recap at end of sessions and check docs/session-recap.md at start.
NEVER include code style rules (linting, formatting, indentation) — the Stop hook handles this deterministically.
NEVER include HTTP method explanations, React basics, or framework tutorials.
Target ~700 tokens. Every line must pass: Would Claude already know this without being told? If yes, delete it.`;
}
