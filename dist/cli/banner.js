/**
 * ASCII art banner and branding
 */
import pc from "picocolors";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../../package.json');
export const BANNER = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ███████╗██╗   ██╗██████╗ ███████╗██████╗                    ║
║   ██╔════╝██║   ██║██╔══██╗██╔════╝██╔══██╗                   ║
║   ███████╗██║   ██║██████╔╝█████╗  ██████╔╝                   ║
║   ╚════██║██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗                   ║
║   ███████║╚██████╔╝██║     ███████╗██║  ██║                   ║
║   ╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝                   ║
║                                                               ║
║   █████╗  ██████╗ ███████╗███╗   ██╗████████╗███████╗         ║
║  ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔════╝         ║
║  ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ███████╗         ║
║  ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║         ║
║  ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ███████║         ║
║  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝         ║
║                                                               ║
║  Expert-Backed Claude Code Configuration Generator            ║
║  Powered by principles from industry leaders                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;
/**
 * Expert attribution for each agent
 */
export const AGENT_EXPERTS = {
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
export function displayBanner() {
    console.log(pc.cyan(BANNER));
    console.log(pc.dim(`  Version ${pkg.version}\n`));
}
export function displaySuccess(summary) {
    console.log("\n" +
        pc.green("✓") +
        pc.bold(" Success! Your expert-backed configuration is ready.\n"));
    console.log(pc.bold("Created in: ") + pc.cyan(summary.projectRoot));
    console.log(pc.dim(`  CLAUDE.md`));
    console.log(pc.dim(`  .claude/settings.json`));
    console.log(pc.dim(`  .claude/agents/ (${summary.agents.length} files)`));
    console.log(pc.dim(`  .claude/skills/ (${summary.skills.length} files)`));
    console.log(pc.bold("\nAgents:") + pc.dim(` (${summary.agents.length}) - Built on industry-leading principles`));
    summary.agents.forEach((agent) => {
        const expertInfo = AGENT_EXPERTS[agent];
        if (expertInfo) {
            console.log(pc.green(`  ✓ `) +
                pc.bold(agent) +
                pc.dim(` — ${expertInfo.expert}'s ${expertInfo.domain}`));
        }
        else {
            console.log(pc.dim(`  → ${agent}`));
        }
    });
    console.log(pc.bold("\nSkills:") + pc.dim(` (${summary.skills.length}) - Framework-specific best practices`));
    summary.skills.forEach((skill) => {
        console.log(pc.green(`  ✓ `) + pc.bold(skill));
    });
    console.log("\n" + pc.bold("What you get:"));
    console.log(pc.cyan("  • Agents trained on best practices from industry experts"));
    console.log(pc.cyan("  • Karpathy's 4 coding principles baked into every agent"));
    console.log(pc.cyan("  • Context-aware skills tailored to your stack"));
    console.log("\n" + pc.bold("Next steps:"));
    console.log(pc.dim("  1. ") +
        pc.bold("cd your-project && claude") +
        pc.dim(" to start coding"));
    console.log(pc.dim("  2. ") +
        pc.bold("/agent backend-engineer") +
        pc.dim(" to switch agents"));
    console.log(pc.dim("  3. ") +
        pc.dim("Agents auto-apply expert principles to every task\n"));
}
export function displayError(error) {
    console.log("\n" + pc.red("✗") + pc.bold(" Error: ") + error + "\n");
}
//# sourceMappingURL=banner.js.map