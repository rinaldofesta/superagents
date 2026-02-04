/**
 * ASCII art banner and branding
 */
import pc from "picocolors";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../../package.json');
// PlayNew brand orange: #ff4d00 = RGB(255, 77, 0)
const orange = (text) => `\x1b[38;2;255;77;0m${text}\x1b[39m`;
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
║  Generate Claude Code configs that write expert-level code    ║
║  Built on Uncle Bob, Kent Beck, Dan Abramov & more            ║
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
    console.log(orange(BANNER));
    console.log(pc.dim(`  Version ${pkg.version}\n`));
}
export function displaySuccess(summary) {
    console.log("\n" +
        pc.green("✓") +
        pc.bold(" Done! Your Claude Code setup is ready.\n"));
    console.log(pc.bold("Output: ") + orange(summary.projectRoot));
    console.log(pc.dim(`  CLAUDE.md                    Project context for Claude`));
    console.log(pc.dim(`  .claude/settings.json        Editor configuration`));
    console.log(pc.dim(`  .claude/agents/              ${summary.agents.length} specialized agents`));
    console.log(pc.dim(`  .claude/skills/              ${summary.skills.length} framework guides`));
    console.log(pc.bold("\nYour agents:"));
    summary.agents.forEach((agent) => {
        const expertInfo = AGENT_EXPERTS[agent];
        if (expertInfo) {
            console.log(pc.green(`  ✓ `) +
                pc.bold(agent) +
                pc.dim(` — ${expertInfo.domain} (${expertInfo.expert})`));
        }
        else {
            console.log(pc.green(`  ✓ `) + pc.bold(agent));
        }
    });
    console.log(pc.bold("\nYour skills:"));
    summary.skills.forEach((skill) => {
        console.log(pc.green(`  ✓ `) + pc.bold(skill));
    });
    console.log("\n" + pc.bold("Why this matters:"));
    console.log(orange("  Claude now writes code following proven patterns"));
    console.log(orange("  Each agent applies real engineering principles"));
    console.log(orange("  Skills teach Claude your exact tech stack"));
    console.log("\n" + pc.bold("Start using it:"));
    console.log(pc.dim("  1. ") +
        pc.bold("claude") +
        pc.dim(" — Open Claude Code in your project"));
    console.log(pc.dim("  2. ") +
        pc.bold("/agent backend-engineer") +
        pc.dim(" — Switch to a specific agent"));
    console.log(pc.dim("  3. ") +
        pc.dim("Ask Claude to build something — expert patterns apply automatically\n"));
}
export function displayError(error) {
    console.log("\n" + pc.red("✗") + pc.bold(" Something went wrong\n"));
    console.log(pc.dim(`  ${error}\n`));
}
//# sourceMappingURL=banner.js.map