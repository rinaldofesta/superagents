/**
 * ASCII art banner and branding
 */
import pc from "picocolors";
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
║  Context-Aware Claude Code Configuration Generator            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;
export function displayBanner() {
  console.log(pc.cyan(BANNER));
  console.log(pc.dim("  Version 1.0.0 - Play New\n"));
}
export function displaySuccess(summary) {
  console.log(
    "\n" +
      pc.green("✓") +
      pc.bold(" Success! Your Claude Code configuration is ready.\n"),
  );
  console.log(pc.bold("Created files:"));
  console.log(pc.dim(`  ${summary.claudeDir}/CLAUDE.md`));
  console.log(pc.dim(`  ${summary.claudeDir}/settings.json`));
  console.log(pc.bold("\nAgents:") + pc.dim(` (${summary.agents.length})`));
  summary.agents.forEach((agent) => {
    console.log(pc.dim(`  → ${agent}`));
  });
  console.log(pc.bold("\nSkills:") + pc.dim(` (${summary.skills.length})`));
  summary.skills.forEach((skill) => {
    console.log(pc.dim(`  → ${skill}`));
  });
  console.log("\n" + pc.bold("Next steps:"));
  console.log(
    pc.cyan("  1. Run ") +
      pc.bold("claude") +
      pc.cyan(" to start using your enhanced Claude Code"),
  );
  console.log(
    pc.cyan("  2. Use ") +
      pc.bold("/agent <name>") +
      pc.cyan(" to switch between agents"),
  );
  console.log(
    pc.cyan("  3. Use ") +
      pc.bold("Skill(<name>)") +
      pc.cyan(" to load domain knowledge\n"),
  );
}
export function displayError(error) {
  console.log("\n" + pc.red("✗") + pc.bold(" Error: ") + error + "\n");
}
//# sourceMappingURL=banner.js.map
