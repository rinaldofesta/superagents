/**
 * Handoff renderer — pure function that generates HANDOFF.md markdown
 */
export function renderHandoff(ctx) {
    const lines = [];
    lines.push('# Project Handoff');
    lines.push('');
    lines.push(`Generated: ${ctx.generatedAt}`);
    lines.push('');
    lines.push('## Overview');
    lines.push(ctx.description || ctx.projectName);
    lines.push('');
    lines.push('## Tech Stack');
    lines.push(ctx.techStack);
    lines.push('');
    lines.push('## Current State');
    lines.push(`- Build: ${ctx.buildStatus}`);
    lines.push(`- Files: ${ctx.fileCount}`);
    if (ctx.roadmapProgress) {
        lines.push(`- Progress: ${ctx.roadmapProgress}`);
    }
    lines.push('');
    lines.push('## Team Configuration');
    lines.push(`- Agents: ${ctx.agents.length > 0 ? ctx.agents.join(', ') : 'none'}`);
    lines.push(`- Skills: ${ctx.skills.length > 0 ? ctx.skills.join(', ') : 'none'}`);
    lines.push('');
    lines.push("## What's Next");
    if (ctx.nextSteps.length > 0) {
        ctx.nextSteps.forEach((step, i) => {
            lines.push(`${i + 1}. ${step}`);
        });
    }
    else {
        lines.push('No ROADMAP.md found');
    }
    lines.push('');
    lines.push('## Getting Started');
    lines.push('1. Run `superagents status` to see current progress');
    lines.push('2. Run `superagents evolve` to update config for your setup');
    lines.push('3. Open Claude Code and type `/status` for a full health check');
    lines.push('');
    return lines.join('\n');
}
//# sourceMappingURL=renderer.js.map