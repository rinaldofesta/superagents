/**
 * Handoff command — generates HANDOFF.md for developer hand-off
 */
// Node.js built-ins
import path from 'path';
// External packages
import * as p from '@clack/prompts';
import fs from 'fs-extra';
import pc from 'picocolors';
// Internal modules
import { collectHandoffContext } from './collector.js';
import { renderHandoff } from './renderer.js';
export async function runHandoff(projectRoot) {
    const claudeDir = path.join(projectRoot, '.claude');
    if (!(await fs.pathExists(claudeDir))) {
        console.log(pc.red('\n  No .claude/ folder found in this project.'));
        console.log(pc.dim('  Run superagents first to create a configuration.\n'));
        return;
    }
    const spinner = p.spinner();
    spinner.start('Gathering project context...');
    const ctx = await collectHandoffContext(projectRoot);
    spinner.stop(pc.green('✓') + ' Context collected');
    const markdown = renderHandoff(ctx);
    const handoffPath = path.join(projectRoot, 'HANDOFF.md');
    await fs.writeFile(handoffPath, markdown, 'utf-8');
    console.log(pc.green('\n  ✓ HANDOFF.md created!\n'));
    console.log(pc.dim(`  Project: ${ctx.projectName}`));
    console.log(pc.dim(`  Build: ${ctx.buildStatus}`));
    console.log(pc.dim(`  Agents: ${ctx.agents.length} | Skills: ${ctx.skills.length}`));
    if (ctx.roadmapProgress) {
        console.log(pc.dim(`  Progress: ${ctx.roadmapProgress}`));
    }
    console.log(pc.dim(`  Next steps: ${ctx.nextSteps.length} items`));
    console.log('');
}
//# sourceMappingURL=index.js.map