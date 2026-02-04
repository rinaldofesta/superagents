/**
 * Config updater - incrementally update .claude/ folder
 */

// Node.js built-ins
import path from 'path';

// External packages
import * as p from '@clack/prompts';
import fs from 'fs-extra';
import pc from 'picocolors';

// Internal modules
import { AIGenerator } from '../generator/index.js';
import { log } from '../utils/logger.js';

// Type imports
import type { GenerationContext, SettingsJson } from '../types/generation.js';

interface ExistingConfig {
  agents: string[];
  skills: string[];
  settings: SettingsJson;
}

export class ConfigUpdater {
  private claudeDir: string;

  constructor(private projectRoot: string) {
    this.claudeDir = path.join(projectRoot, '.claude');
  }

  /**
   * Check if .claude/ directory exists
   */
  async hasExistingConfig(): Promise<boolean> {
    return fs.pathExists(this.claudeDir);
  }

  /**
   * Read existing configuration
   */
  async readExisting(): Promise<ExistingConfig> {
    const agentsDir = path.join(this.claudeDir, 'agents');
    const skillsDir = path.join(this.claudeDir, 'skills');
    const settingsPath = path.join(this.claudeDir, 'settings.json');

    // Read agents
    const agents: string[] = [];
    if (await fs.pathExists(agentsDir)) {
      const files = await fs.readdir(agentsDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          agents.push(file.replace('.md', ''));
        }
      }
    }

    // Read skills
    const skills: string[] = [];
    if (await fs.pathExists(skillsDir)) {
      const files = await fs.readdir(skillsDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          skills.push(file.replace('.md', ''));
        }
      }
    }

    // Read settings
    let settings: SettingsJson = {};
    if (await fs.pathExists(settingsPath)) {
      settings = await fs.readJSON(settingsPath);
    }

    return { agents, skills, settings };
  }

  /**
   * Prompt user to select what to update
   */
  async promptUpdateOptions(existing: ExistingConfig, available: {
    agents: string[];
    skills: string[];
  }): Promise<{
    agentsToAdd: string[];
    agentsToRemove: string[];
    skillsToAdd: string[];
    skillsToRemove: string[];
    regenerateClaudeMd: boolean;
  }> {
    // Find what can be added (not already present)
    const addableAgents = available.agents.filter(a => !existing.agents.includes(a));
    const addableSkills = available.skills.filter(s => !existing.skills.includes(s));

    p.note(
      [
        pc.bold('Current configuration:'),
        `  Agents: ${existing.agents.join(', ') || pc.dim('none')}`,
        `  Skills: ${existing.skills.join(', ') || pc.dim('none')}`
      ].join('\n'),
      'Existing Config'
    );

    // Ask what to do
    const action = await p.select({
      message: 'What would you like to do?',
      options: [
        { value: 'add', label: 'Add new agents/skills', hint: 'Keep existing, add more' },
        { value: 'remove', label: 'Remove agents/skills', hint: 'Remove some configurations' },
        { value: 'both', label: 'Add and remove', hint: 'Modify the full configuration' },
        { value: 'regenerate', label: 'Regenerate CLAUDE.md only', hint: 'Update project context' }
      ]
    });

    if (p.isCancel(action)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    let agentsToAdd: string[] = [];
    let agentsToRemove: string[] = [];
    let skillsToAdd: string[] = [];
    let skillsToRemove: string[] = [];

    // Add agents
    if ((action === 'add' || action === 'both') && addableAgents.length > 0) {
      const selected = await p.multiselect({
        message: 'Select agents to add:',
        options: addableAgents.map(a => ({ value: a, label: a })),
        required: false
      });
      if (!p.isCancel(selected)) {
        agentsToAdd = selected as string[];
      }
    }

    // Add skills
    if ((action === 'add' || action === 'both') && addableSkills.length > 0) {
      const selected = await p.multiselect({
        message: 'Select skills to add:',
        options: addableSkills.map(s => ({ value: s, label: s })),
        required: false
      });
      if (!p.isCancel(selected)) {
        skillsToAdd = selected as string[];
      }
    }

    // Remove agents
    if ((action === 'remove' || action === 'both') && existing.agents.length > 0) {
      const selected = await p.multiselect({
        message: 'Select agents to remove:',
        options: existing.agents.map(a => ({ value: a, label: a })),
        required: false
      });
      if (!p.isCancel(selected)) {
        agentsToRemove = selected as string[];
      }
    }

    // Remove skills
    if ((action === 'remove' || action === 'both') && existing.skills.length > 0) {
      const selected = await p.multiselect({
        message: 'Select skills to remove:',
        options: existing.skills.map(s => ({ value: s, label: s })),
        required: false
      });
      if (!p.isCancel(selected)) {
        skillsToRemove = selected as string[];
      }
    }

    return {
      agentsToAdd,
      agentsToRemove,
      skillsToAdd,
      skillsToRemove,
      regenerateClaudeMd: action === 'regenerate'
    };
  }

  /**
   * Apply updates to the configuration
   */
  async applyUpdates(
    context: GenerationContext,
    updates: {
      agentsToAdd: string[];
      agentsToRemove: string[];
      skillsToAdd: string[];
      skillsToRemove: string[];
      regenerateClaudeMd: boolean;
    }
  ): Promise<{
    added: { agents: string[]; skills: string[] };
    removed: { agents: string[]; skills: string[] };
    regenerated: boolean;
  }> {
    const agentsDir = path.join(this.claudeDir, 'agents');
    const skillsDir = path.join(this.claudeDir, 'skills');

    // Generate new content if needed
    const addedAgentNames: string[] = [];
    const addedSkillNames: string[] = [];

    if (updates.agentsToAdd.length > 0 || updates.skillsToAdd.length > 0) {
      const generator = new AIGenerator();

      // Generate all new items at once using generateAll
      const genContext: GenerationContext = {
        ...context,
        selectedAgents: updates.agentsToAdd,
        selectedSkills: updates.skillsToAdd
      };

      // Only generate if there's something to add
      if (genContext.selectedAgents.length > 0 || genContext.selectedSkills.length > 0) {
        const outputs = await generator.generateAll(genContext);

        // Write new agents
        for (const agent of outputs.agents) {
          await fs.writeFile(
            path.join(agentsDir, agent.filename),
            agent.content,
            'utf-8'
          );
          addedAgentNames.push(agent.agentName);
          log.debug(`Added agent: ${agent.agentName}`);
        }

        // Write new skills
        for (const skill of outputs.skills) {
          await fs.writeFile(
            path.join(skillsDir, skill.filename),
            skill.content,
            'utf-8'
          );
          addedSkillNames.push(skill.skillName);
          log.debug(`Added skill: ${skill.skillName}`);
        }

        // Regenerate CLAUDE.md if requested
        if (updates.regenerateClaudeMd) {
          await fs.writeFile(
            path.join(this.projectRoot, 'CLAUDE.md'),
            outputs.claudeMd,
            'utf-8'
          );
          log.debug('Regenerated CLAUDE.md');
        }
      }
    } else if (updates.regenerateClaudeMd) {
      // Only regenerating CLAUDE.md, need minimal generation
      const generator = new AIGenerator();
      const genContext: GenerationContext = {
        ...context,
        selectedAgents: ['code-reviewer'],  // Need at least one to generate
        selectedSkills: ['typescript']
      };
      const outputs = await generator.generateAll(genContext);
      await fs.writeFile(
        path.join(this.projectRoot, 'CLAUDE.md'),
        outputs.claudeMd,
        'utf-8'
      );
      log.debug('Regenerated CLAUDE.md');
    }

    // Remove agents
    for (const agentName of updates.agentsToRemove) {
      const agentPath = path.join(agentsDir, `${agentName}.md`);
      if (await fs.pathExists(agentPath)) {
        await fs.remove(agentPath);
        log.debug(`Removed agent: ${agentName}`);
      }
    }

    // Remove skills
    for (const skillName of updates.skillsToRemove) {
      const skillPath = path.join(skillsDir, `${skillName}.md`);
      if (await fs.pathExists(skillPath)) {
        await fs.remove(skillPath);
        log.debug(`Removed skill: ${skillName}`);
      }
    }

    // Update settings.json
    await this.updateSettings(updates);

    return {
      added: {
        agents: addedAgentNames,
        skills: addedSkillNames
      },
      removed: {
        agents: updates.agentsToRemove,
        skills: updates.skillsToRemove
      },
      regenerated: updates.regenerateClaudeMd
    };
  }

  /**
   * Update settings.json after changes
   */
  private async updateSettings(updates: {
    agentsToAdd: string[];
    agentsToRemove: string[];
    skillsToAdd: string[];
    skillsToRemove: string[];
  }): Promise<void> {
    const settingsPath = path.join(this.claudeDir, 'settings.json');
    let settings: SettingsJson = {};

    if (await fs.pathExists(settingsPath)) {
      settings = await fs.readJSON(settingsPath);
    }

    // Update agents list
    if (Array.isArray(settings.agents)) {
      // Add new agents
      for (const agent of updates.agentsToAdd) {
        if (!settings.agents.includes(agent)) {
          settings.agents.push(agent);
        }
      }
      // Remove agents
      settings.agents = settings.agents.filter(a => !updates.agentsToRemove.includes(a as string));
    }

    // Update skills list
    if (Array.isArray(settings.skills)) {
      // Add new skills
      for (const skill of updates.skillsToAdd) {
        if (!settings.skills.includes(skill)) {
          settings.skills.push(skill);
        }
      }
      // Remove skills
      settings.skills = settings.skills.filter(s => !updates.skillsToRemove.includes(s as string));
    }

    settings.generatedAt = new Date().toISOString();

    await fs.writeJSON(settingsPath, settings, { spaces: 2 });
  }
}
