/**
 * Output writer - creates .claude folder structure
 */
import fs from 'fs-extra';
import path from 'path';
import { confirmOverwrite } from '../cli/prompts.js';
export class OutputWriter {
    projectRoot;
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
    }
    async writeAll(outputs) {
        const claudeDir = path.join(this.projectRoot, '.claude');
        // Check for existing .claude directory
        if (await fs.pathExists(claudeDir)) {
            const overwrite = await confirmOverwrite();
            if (!overwrite) {
                throw new Error('User cancelled: .claude directory already exists');
            }
            await fs.remove(claudeDir);
        }
        // Create directory structure
        await fs.ensureDir(path.join(claudeDir, 'agents'));
        await fs.ensureDir(path.join(claudeDir, 'skills'));
        await fs.ensureDir(path.join(claudeDir, 'hooks'));
        // Write CLAUDE.md
        await fs.writeFile(path.join(claudeDir, 'CLAUDE.md'), outputs.claudeMd, 'utf-8');
        // Write agents
        for (const agent of outputs.agents) {
            await fs.writeFile(path.join(claudeDir, 'agents', agent.filename), agent.content, 'utf-8');
        }
        // Write skills
        for (const skill of outputs.skills) {
            await fs.writeFile(path.join(claudeDir, 'skills', skill.filename), skill.content, 'utf-8');
        }
        // Write hooks
        if (outputs.hooks) {
            for (const hook of outputs.hooks) {
                const hookPath = path.join(claudeDir, 'hooks', hook.filename);
                await fs.writeFile(hookPath, hook.content, 'utf-8');
                // Make hooks executable
                await fs.chmod(hookPath, '755');
            }
        }
        // Write settings.json
        await fs.writeFile(path.join(claudeDir, 'settings.json'), JSON.stringify(outputs.settings, null, 2), 'utf-8');
        return {
            totalFiles: outputs.agents.length + outputs.skills.length + (outputs.hooks?.length || 0) + 2,
            agents: outputs.agents.map(a => a.agentName),
            skills: outputs.skills.map(s => s.skillName),
            claudeDir
        };
    }
}
//# sourceMappingURL=index.js.map