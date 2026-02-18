/**
 * Output writer - creates .claude folder structure
 */

import fs from 'fs-extra';
import path from 'path';
import type { GeneratedOutputs, WriteSummary } from '../types/generation.js';
import { confirmOverwrite } from '../cli/prompts.js';

export class OutputWriter {
  constructor(private projectRoot: string, private forceOverwrite = false) {}

  async writeAll(outputs: GeneratedOutputs): Promise<WriteSummary> {
    const claudeDir = path.join(this.projectRoot, '.claude');

    // Check for existing .claude directory
    if (await fs.pathExists(claudeDir)) {
      if (this.forceOverwrite) {
        await fs.remove(claudeDir);
      } else {
        const overwrite = await confirmOverwrite();
        if (!overwrite) {
          throw new Error('User cancelled: .claude directory already exists');
        }
        await fs.remove(claudeDir);
      }
    }

    // Create directory structure
    await fs.ensureDir(path.join(claudeDir, 'agents'));
    await fs.ensureDir(path.join(claudeDir, 'skills'));
    await fs.ensureDir(path.join(claudeDir, 'commands'));
    if (outputs.hooks.length > 0) {
      await fs.ensureDir(path.join(claudeDir, 'hooks'));
    }
    await fs.ensureDir(path.join(this.projectRoot, 'docs'));

    // Prepare all write operations for parallel execution
    const writeOperations: Promise<void>[] = [];

    // Write CLAUDE.md to project root (not inside .claude/)
    writeOperations.push(
      fs.writeFile(
        path.join(this.projectRoot, 'CLAUDE.md'),
        outputs.claudeMd,
        'utf-8'
      )
    );

    // Write agents in parallel
    for (const agent of outputs.agents) {
      writeOperations.push(
        fs.writeFile(
          path.join(claudeDir, 'agents', agent.filename),
          agent.content,
          'utf-8'
        )
      );
    }

    // Write skills in parallel
    for (const skill of outputs.skills) {
      writeOperations.push(
        fs.writeFile(
          path.join(claudeDir, 'skills', skill.filename),
          skill.content,
          'utf-8'
        )
      );
    }

    // Write commands in parallel
    for (const cmd of outputs.commands) {
      writeOperations.push(
        fs.writeFile(
          path.join(claudeDir, 'commands', cmd.filename),
          cmd.content,
          'utf-8'
        )
      );
    }

    // Write hooks and make executable
    for (const hook of outputs.hooks) {
      const hookPath = path.join(claudeDir, 'hooks', hook.filename);
      writeOperations.push(
        fs.writeFile(hookPath, hook.content, 'utf-8').then(() => fs.chmod(hookPath, 0o755))
      );
    }

    // Write settings.json
    writeOperations.push(
      fs.writeFile(
        path.join(claudeDir, 'settings.json'),
        JSON.stringify(outputs.settings, null, 2),
        'utf-8'
      )
    );

    // Write ROADMAP.md to project root if present
    if (outputs.roadmapMd) {
      writeOperations.push(
        fs.writeFile(
          path.join(this.projectRoot, 'ROADMAP.md'),
          outputs.roadmapMd,
          'utf-8'
        )
      );
    }

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

    const hasRoadmap = !!outputs.roadmapMd;
    return {
      totalFiles: outputs.agents.length + outputs.skills.length + outputs.commands.length + outputs.docs.length + outputs.hooks.length + 2 + (hasRoadmap ? 1 : 0),
      agents: outputs.agents.map(a => a.agentName),
      skills: outputs.skills.map(s => s.skillName),
      commands: outputs.commands.map(c => c.commandName),
      docs: outputs.docs.map(d => d.filename),
      hooks: outputs.hooks.map(h => h.hookName),
      projectRoot: this.projectRoot,
      claudeDir,
      hasRoadmap
    };
  }
}
