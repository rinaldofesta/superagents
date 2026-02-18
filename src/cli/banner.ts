/**
 * ASCII art banner and branding
 */

import { createRequire } from 'module';

import pc from "picocolors";

import { orange } from './colors.js';
import { DISPLAY_NAMES } from './display-names.js';

import type { CodebaseAnalysis } from '../types/codebase.js';
import type { WriteSummary } from '../types/generation.js';
import type { ProjectMode } from '../types/goal.js';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

export const BANNER = `
  ╭──────────────────────────────────────────╮
  │                                          │
  │        S U P E R A G E N T S             │
  │                                          │
  │   Your AI team, configured in seconds    │
  │   Powered by Play New's community        │
  │                                          │
  ╰──────────────────────────────────────────╯
`;

/**
 * Expert attribution for each agent
 */
export const AGENT_EXPERTS: Record<string, { expert: string; domain: string }> = {
  'backend-engineer': { expert: 'Uncle Bob (Robert C. Martin)', domain: 'Clean Architecture & SOLID' },
  'frontend-specialist': { expert: 'Dan Abramov', domain: 'React Patterns' },
  'code-reviewer': { expert: 'Google Engineering', domain: 'Code Review Practices' },
  'debugger': { expert: 'Julia Evans', domain: 'Systematic Debugging' },
  'devops-specialist': { expert: 'Kelsey Hightower', domain: 'Infrastructure Patterns' },
  'security-analyst': { expert: 'OWASP Foundation', domain: 'Security Best Practices' },
  'database-specialist': { expert: 'Martin Kleppmann', domain: 'Data-Intensive Apps' },
  'api-designer': { expert: 'Stripe', domain: 'API Design Principles' },
  'testing-specialist': { expert: 'Kent Beck', domain: 'Test-Driven Development' },
  'docs-writer': { expert: 'Divio', domain: 'Documentation System' },
  'performance-optimizer': { expert: 'Addy Osmani', domain: 'Web Performance' },
  'copywriter': { expert: 'Paolo Gervasi', domain: 'Conversion Copywriting' },
  'designer': { expert: 'Sarah Corti', domain: 'UI/UX Design' },
  'architect': { expert: 'Martin Fowler', domain: 'Enterprise Patterns' },
  'product-manager': { expert: 'Marty Cagan', domain: 'Product Discovery' },
  'data-engineer': { expert: 'Joe Reis', domain: 'Data Engineering Fundamentals' },
  'mobile-specialist': { expert: 'React Native Team', domain: 'Cross-Platform Mobile' },
  'accessibility-specialist': { expert: 'Heydon Pickering', domain: 'Inclusive Design Patterns' },
  'sre-engineer': { expert: 'Google SRE', domain: 'Site Reliability Engineering' },
  'tech-lead': { expert: 'Rinaldo Festa', domain: 'Pragmatic Technical Leadership' },
  'cfo': { expert: 'Pasquale Tuosto', domain: 'Strategic Finance & Sustainable Growth' }
};

export function displayBanner(): void {
  console.log(orange(BANNER));
  console.log(pc.dim(`  Version ${pkg.version}\n`));
}

export function displaySuccess(
  summary: WriteSummary,
  codebase?: CodebaseAnalysis,
  projectMode?: ProjectMode
): void {
  console.log(
    "\n" +
      pc.green("\u2713") +
      pc.bold(" Done! Your AI specialists are ready to work.\n"),
  );

  console.log(pc.bold("Created: ") + orange(summary.projectRoot));
  console.log(pc.dim(`  CLAUDE.md                    Your project context`));
  console.log(pc.dim(`  .claude/settings.json        Configuration`));
  console.log(pc.dim(`  .claude/agents/              ${summary.agents.length} specialists`));
  console.log(pc.dim(`  .claude/skills/              ${summary.skills.length} areas of expertise`));
  if (summary.commands.length > 0) {
    const cmdList = summary.commands.map(c => `/${c}`).join(', ');
    console.log(pc.dim(`  .claude/commands/            ${summary.commands.length} slash commands (${cmdList})`));
  }
  if (summary.hasRoadmap) {
    console.log(pc.dim(`  ROADMAP.md                   Phased project plan with tasks`));
  }
  console.log(pc.dim(`  docs/                        Architecture & setup guides`));

  console.log(pc.bold("\nYour team:"));
  summary.agents.forEach((agent) => {
    const expertInfo = AGENT_EXPERTS[agent];
    if (expertInfo) {
      console.log(
        pc.green(`  \u2713 `) +
        pc.bold(agent) +
        pc.dim(` \u2014 ${expertInfo.domain} (${expertInfo.expert})`)
      );
    } else {
      console.log(pc.green(`  \u2713 `) + pc.bold(agent));
    }
  });

  console.log(pc.bold("\nTheir expertise:"));
  summary.skills.forEach((skill) => {
    console.log(pc.green(`  \u2713 `) + pc.bold(skill));
  });

  // Project-specific insights (replaces generic "Why this matters")
  const insights = buildProjectInsights(summary, codebase);
  console.log("\n" + pc.bold("Your project:"));
  for (const line of insights) {
    console.log(orange(`  ${line}`));
  }

  // Get started with dynamic first agent
  const firstAgent = summary.agents[0] || 'copywriter';
  console.log("\n" + pc.bold("Get started:"));
  console.log(
    pc.dim("  1. ") +
      pc.bold("claude") +
      pc.dim(" \u2014 Open Claude in your project"),
  );
  console.log(
    pc.dim("  2. ") +
      pc.bold(`/agent ${firstAgent}`) +
      pc.dim(` \u2014 Switch to your ${firstAgent}`),
  );
  console.log(
    pc.dim("  3. ") +
      pc.dim("Ask for help \u2014 your team's expertise kicks in automatically"),
  );

  // First prompt guidance
  const firstPrompt = buildFirstPrompt(summary, codebase, projectMode);
  console.log("\n" + pc.bold("  Your first prompt:"));
  console.log(pc.cyan(`  ┌${'─'.repeat(60)}┐`));
  // Word-wrap the prompt to fit in the box
  const words = firstPrompt.split(' ');
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > 56) {
      console.log(pc.cyan('  │ ') + pc.bold(line.padEnd(57)) + pc.cyan('│'));
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) {
    console.log(pc.cyan('  │ ') + pc.bold(line.padEnd(57)) + pc.cyan('│'));
  }
  console.log(pc.cyan(`  └${'─'.repeat(60)}┘`));
  console.log(pc.dim("  Copy and paste this into Claude Code to get started.\n"));
}

function buildFirstPrompt(
  summary: WriteSummary,
  codebase?: CodebaseAnalysis,
  projectMode?: ProjectMode
): string {
  if (!codebase || projectMode === 'new') {
    if (summary.hasRoadmap) {
      return 'Read CLAUDE.md and ROADMAP.md. Start with Phase 1, Task 1. Check off tasks as you complete them.';
    }
    const framework = codebase?.framework || 'the project';
    return `Read CLAUDE.md, then set up the project structure with ${framework}. Start with the file structure and basic layout.`;
  }
  const hasTests = codebase.detectedPatterns.some(p => p.type === 'tests');
  const priority = hasTests
    ? 'improving test coverage'
    : 'the most important feature';
  return `Read CLAUDE.md, explore the codebase, and tell me what you see. Then let's work on ${priority}.`;
}

function buildProjectInsights(summary: WriteSummary, codebase?: CodebaseAnalysis): string[] {
  if (!codebase) {
    // Fallback for update mode
    return [
      `${summary.agents.length} specialists and ${summary.skills.length} skills configured`,
      'Each specialist follows proven methods from industry experts'
    ];
  }

  const lines: string[] = [];

  // Line 1: Codebase scope
  const lang = codebase.language
    ? (DISPLAY_NAMES[codebase.language] || codebase.language)
    : null;
  const framework = codebase.framework
    ? (DISPLAY_NAMES[codebase.framework] || codebase.framework)
    : null;
  const techLabel = framework || lang || 'Your';
  lines.push(`${techLabel} project with ${codebase.totalFiles} files and ${codebase.dependencies.length} dependencies`);

  // Line 2: Testing insight
  const testPattern = codebase.detectedPatterns.find(p => p.type === 'tests');
  if (testPattern && summary.agents.includes('testing-specialist')) {
    lines.push(`${testPattern.paths.length} test file${testPattern.paths.length === 1 ? '' : 's'} found \u2014 the testing-specialist will help expand coverage`);
  } else if (codebase.testCommand && summary.agents.includes('testing-specialist')) {
    lines.push(`Test runner detected \u2014 the testing-specialist will help expand coverage`);
  }

  // Line 3: Architecture insight
  const utilPattern = codebase.detectedPatterns.find(p => p.type === 'utils');
  if (utilPattern && utilPattern.paths.length > 0 && summary.agents.includes('backend-engineer')) {
    lines.push(`${utilPattern.paths.length} utility modules detected \u2014 the backend-engineer enforces clean architecture`);
  }

  // Ensure at least 2 lines
  if (lines.length < 2) {
    lines.push(`${summary.agents.length} specialists configured, each following proven industry methods`);
  }

  return lines;
}

export function displayError(error: string): void {
  console.log("\n" + pc.red("✗") + pc.bold(" Something went wrong\n"));
  console.log(pc.dim(`  ${error}\n`));
}
