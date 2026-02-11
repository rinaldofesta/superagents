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
        await fs.ensureDir(path.join(claudeDir, 'commands'));
        await fs.ensureDir(path.join(this.projectRoot, 'docs'));
        // Prepare all write operations for parallel execution
        const writeOperations = [];
        // Write CLAUDE.md to project root (not inside .claude/)
        writeOperations.push(fs.writeFile(path.join(this.projectRoot, 'CLAUDE.md'), outputs.claudeMd, 'utf-8'));
        // Write agents in parallel
        for (const agent of outputs.agents) {
            writeOperations.push(fs.writeFile(path.join(claudeDir, 'agents', agent.filename), agent.content, 'utf-8'));
        }
        // Write skills in parallel
        for (const skill of outputs.skills) {
            writeOperations.push(fs.writeFile(path.join(claudeDir, 'skills', skill.filename), skill.content, 'utf-8'));
        }
        // Write commands in parallel
        for (const cmd of outputs.commands) {
            writeOperations.push(fs.writeFile(path.join(claudeDir, 'commands', cmd.filename), cmd.content, 'utf-8'));
        }
        // Write settings.json
        writeOperations.push(fs.writeFile(path.join(claudeDir, 'settings.json'), JSON.stringify(outputs.settings, null, 2), 'utf-8'));
        // Execute all writes in parallel
        await Promise.all(writeOperations);
        // Write docs files
        for (const doc of outputs.docs) {
            const docDir = doc.subfolder
                ? path.join(this.projectRoot, 'docs', doc.subfolder)
                : path.join(this.projectRoot, 'docs');
            await fs.ensureDir(docDir);
            await fs.writeFile(path.join(docDir, doc.filename), doc.content, 'utf-8');
        }
        return {
            totalFiles: outputs.agents.length + outputs.skills.length + outputs.commands.length + outputs.docs.length + 2,
            agents: outputs.agents.map(a => a.agentName),
            skills: outputs.skills.map(s => s.skillName),
            commands: outputs.commands.map(c => c.commandName),
            docs: outputs.docs.map(d => d.filename),
            projectRoot: this.projectRoot,
            claudeDir
        };
    }
}
//# sourceMappingURL=index.js.map