/**
 * Evolve command — detect project changes and update config
 */

// Node.js built-ins
import path from 'path';

// External packages
import * as p from '@clack/prompts';
import fs from 'fs-extra';
import pc from 'picocolors';

// Internal modules
import { CodebaseAnalyzer } from '../analyzer/codebase-analyzer.js';
import { cache } from '../cache/index.js';
import { ConfigUpdater } from '../updater/index.js';
import { log } from '../utils/logger.js';
import { diffAnalyses } from './differ.js';
import { displayDeltas, displayProposals } from './display.js';
import { proposeChanges } from './proposer.js';

export async function runEvolve(projectRoot: string): Promise<void> {
  const claudeDir = path.join(projectRoot, '.claude');

  // Check .claude/ exists
  if (!(await fs.pathExists(claudeDir))) {
    console.log(pc.red('\n  No .claude/ folder found in this project.'));
    console.log(pc.dim('  Run superagents first to create a configuration.\n'));
    return;
  }

  // Load cached analysis
  await cache.init();
  const cached = await cache.getCachedAnalysis(projectRoot);

  if (!cached) {
    console.log(pc.yellow('\n  No previous analysis found in cache.'));
    console.log(pc.dim('  Run superagents first, then use evolve to detect changes.\n'));
    return;
  }

  // Re-scan codebase
  const spinner = p.spinner();
  spinner.start('Scanning codebase for changes...');
  const analyzer = new CodebaseAnalyzer(projectRoot);
  const fresh = await analyzer.analyze();
  spinner.stop(pc.green('\u2713') + ' Scan complete');

  // Diff
  const deltas = diffAnalyses(cached, fresh);

  if (deltas.length === 0) {
    console.log(pc.green('\n  \u2713 Config is up to date — no changes detected.\n'));
    return;
  }

  displayDeltas(deltas);

  // Read existing agents/skills
  const updater = new ConfigUpdater(projectRoot);
  const existing = await updater.readExisting();

  // Propose changes
  const proposals = proposeChanges(deltas, fresh, existing.agents, existing.skills);

  if (proposals.length === 0) {
    console.log(pc.green('\n  \u2713 Changes detected but no config updates needed.\n'));
    // Still save fresh analysis to cache
    await cache.setCachedAnalysis(projectRoot, fresh);
    return;
  }

  displayProposals(proposals);

  // Confirm
  const shouldApply = await p.confirm({
    message: 'Apply these changes?',
  });

  if (p.isCancel(shouldApply) || !shouldApply) {
    console.log(pc.dim('\n  No changes applied.\n'));
    return;
  }

  // Apply proposals via ConfigUpdater
  const agentsToAdd = proposals.filter(p => p.type === 'add-agent').map(p => p.name);
  const agentsToRemove = proposals.filter(p => p.type === 'remove-agent').map(p => p.name);
  const skillsToAdd = proposals.filter(p => p.type === 'add-skill').map(p => p.name);
  const skillsToRemove = proposals.filter(p => p.type === 'remove-skill').map(p => p.name);
  const regenerateClaudeMd = proposals.some(p => p.type === 'update-claude-md');

  const needsGeneration = agentsToAdd.length > 0 || skillsToAdd.length > 0 || regenerateClaudeMd;

  let auth: { method: 'claude-plan' | 'api-key'; apiKey?: string } = { method: 'api-key', apiKey: undefined };

  if (needsGeneration) {
    const { authenticateWithAnthropic } = await import('../utils/auth.js');
    auth = await authenticateWithAnthropic();
    log.debug(`Auth method: ${auth.method}`);
  }

  spinner.start('Applying changes...');

  // Build minimal generation context
  const context = {
    goal: {
      description: 'Evolve existing configuration',
      category: 'custom' as const,
      technicalRequirements: [],
      suggestedAgents: [],
      suggestedSkills: [],
      timestamp: new Date().toISOString(),
      confidence: 1.0,
    },
    codebase: fresh,
    selectedAgents: agentsToAdd,
    selectedSkills: skillsToAdd,
    selectedModel: 'sonnet' as const,
    authMethod: auth.method,
    apiKey: auth.apiKey,
    sampledFiles: fresh.sampledFiles || [],
    verbose: false,
    dryRun: false,
    generatedAt: new Date().toISOString(),
  };

  const result = await updater.applyUpdates(context, {
    agentsToAdd,
    agentsToRemove,
    skillsToAdd,
    skillsToRemove,
    regenerateClaudeMd,
  });

  spinner.stop(pc.green('\u2713') + ' Changes applied');

  // Save fresh analysis to cache
  await cache.setCachedAnalysis(projectRoot, fresh);

  // Display summary
  console.log('\n' + pc.bold(pc.green('  Config evolved!\n')));

  if (result.added.agents.length > 0) {
    console.log(pc.green('  + ') + 'Agents: ' + result.added.agents.join(', '));
  }
  if (result.added.skills.length > 0) {
    console.log(pc.green('  + ') + 'Skills: ' + result.added.skills.join(', '));
  }
  if (result.removed.agents.length > 0) {
    console.log(pc.red('  - ') + 'Agents: ' + result.removed.agents.join(', '));
  }
  if (result.removed.skills.length > 0) {
    console.log(pc.red('  - ') + 'Skills: ' + result.removed.skills.join(', '));
  }
  if (result.regenerated) {
    console.log(pc.yellow('  ~ ') + 'Regenerated CLAUDE.md');
  }
  console.log('');
}
