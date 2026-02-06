/**
 * ASCII art banner and branding
 */

import { createRequire } from 'module';

import pc from "picocolors";

import { orange } from './colors.js';

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
  'product-manager': { expert: 'Marty Cagan', domain: 'Product Discovery' }
};

export function displayBanner(): void {
  console.log(orange(BANNER));
  console.log(pc.dim(`  Version ${pkg.version}\n`));
}

export function displaySuccess(summary: {
  agents: string[];
  skills: string[];
  projectRoot: string;
  claudeDir: string;
}): void {
  console.log(
    "\n" +
      pc.green("✓") +
      pc.bold(" Done! Your AI specialists are ready to work.\n"),
  );

  console.log(pc.bold("Created: ") + orange(summary.projectRoot));
  console.log(pc.dim(`  CLAUDE.md                    Your project context`));
  console.log(pc.dim(`  .claude/settings.json        Configuration`));
  console.log(pc.dim(`  .claude/agents/              ${summary.agents.length} specialists`));
  console.log(pc.dim(`  .claude/skills/              ${summary.skills.length} areas of expertise`));

  console.log(pc.bold("\nYour team:"));
  summary.agents.forEach((agent) => {
    const expertInfo = AGENT_EXPERTS[agent];
    if (expertInfo) {
      console.log(
        pc.green(`  ✓ `) +
        pc.bold(agent) +
        pc.dim(` — ${expertInfo.domain} (${expertInfo.expert})`)
      );
    } else {
      console.log(pc.green(`  ✓ `) + pc.bold(agent));
    }
  });

  console.log(pc.bold("\nTheir expertise:"));
  summary.skills.forEach((skill) => {
    console.log(pc.green(`  ✓ `) + pc.bold(skill));
  });

  console.log("\n" + pc.bold("Why this matters:"));
  console.log(orange("  Your AI team follows proven methods from industry experts"));
  console.log(orange("  Each specialist brings deep knowledge to their domain"));
  console.log(orange("  Results match the quality of seasoned professionals"));

  console.log("\n" + pc.bold("Get started:"));
  console.log(
    pc.dim("  1. ") +
      pc.bold("claude") +
      pc.dim(" — Open Claude in your project"),
  );
  console.log(
    pc.dim("  2. ") +
      pc.bold("/agent copywriter") +
      pc.dim(" — Switch to a specialist (e.g., copywriter, architect)"),
  );
  console.log(
    pc.dim("  3. ") +
      pc.dim("Ask for help — your team's expertise kicks in automatically\n"),
  );
}

export function displayError(error: string): void {
  console.log("\n" + pc.red("✗") + pc.bold(" Something went wrong\n"));
  console.log(pc.dim(`  ${error}\n`));
}
