/**
 * Evolve command — compare installed config against current recommendations.
 *
 * Does NOT rely on a cache snapshot. Instead reads what agents/skills are
 * currently installed from .claude/, runs a fresh codebase analysis, asks the
 * recommendation engine what it would suggest today, and proposes the diff.
 */

// Node.js built-ins
import path from 'path';

// External packages
import * as p from '@clack/prompts';
import fs from 'fs-extra';
import pc from 'picocolors';

// Internal modules
import { CodebaseAnalyzer } from '../analyzer/codebase-analyzer.js';
import { RecommendationEngine } from '../context/recommendation-engine.js';
import { ConfigUpdater } from '../updater/index.js';
import { categorizeGoalFromText, computeAutoLinkedSkills } from '../cli/prompts.js';
import { displayProposals } from './display.js';

// Type imports
import type { CodebaseAnalysis } from '../types/codebase.js';
import type { ProjectGoal } from '../types/goal.js';
import type { EvolveProposal } from '../types/evolve.js';

/**
 * Build a synthetic ProjectGoal from a CodebaseAnalysis so we can run
 * the recommendation engine without asking the user for a goal.
 */
function buildGoalFromAnalysis(analysis: CodebaseAnalysis): ProjectGoal {
  const parts: string[] = [];
  if (analysis.language) parts.push(analysis.language);
  if (analysis.framework) parts.push(analysis.framework);
  else if (analysis.projectType && analysis.projectType !== 'unknown') parts.push(analysis.projectType);

  const depNames = analysis.dependencies.slice(0, 4).map(d => d.name).join(', ');
  const description = `Existing ${parts.join(' ')} project` + (depNames ? ` using ${depNames}` : '');

  return {
    description,
    category: categorizeGoalFromText(description),
    technicalRequirements: [],
    suggestedAgents: [],
    suggestedSkills: [],
    timestamp: new Date().toISOString(),
    confidence: 0.8,
  };
}

export async function runEvolve(projectRoot: string): Promise<void> {
  const claudeDir = path.join(projectRoot, '.claude');

  // Check .claude/ exists
  if (!(await fs.pathExists(claudeDir))) {
    console.log(pc.red('\n  No .claude/ folder found in this project.'));
    console.log(pc.dim('  Run superagents first to create a configuration.\n'));
    return;
  }

  // Read what is currently installed
  const updater = new ConfigUpdater(projectRoot);
  const existing = await updater.readExisting();

  // Fresh codebase scan (no cache dependency)
  const spinner = p.spinner();
  spinner.start('Scanning codebase...');
  const fresh = await new CodebaseAnalyzer(projectRoot).analyze();
  spinner.stop(pc.green('✓') + ' Scan complete');

  // Build goal from codebase context, run recommendation engine
  const goal = buildGoalFromAnalysis(fresh);
  const engine = new RecommendationEngine();
  const recommendations = engine.recommend(goal, fresh);

  // Compute proposals: recommended but not yet installed
  const proposals: EvolveProposal[] = [];

  for (const agent of recommendations.defaultAgents) {
    if (!existing.agents.includes(agent)) {
      const score = recommendations.agents.find(a => a.name === agent);
      proposals.push({
        type: 'add-agent',
        name: agent,
        reason: score?.reasons[0] ?? 'Recommended for your current project',
      });
    }
  }

  // Auto-linked skills from both existing + newly proposed agents
  const allAgentsAfter = [
    ...existing.agents,
    ...recommendations.defaultAgents.filter(a => !existing.agents.includes(a)),
  ];
  const autoLinked = computeAutoLinkedSkills(allAgentsAfter, recommendations);
  const allRecommendedSkills = [...new Set([...recommendations.defaultSkills, ...autoLinked])];

  for (const skill of allRecommendedSkills) {
    if (!existing.skills.includes(skill)) {
      const score = recommendations.skills.find(s => s.name === skill);
      proposals.push({
        type: 'add-skill',
        name: skill,
        reason: score?.reasons[0] ?? 'Recommended for your current project',
      });
    }
  }

  if (proposals.length === 0) {
    console.log(pc.green('\n  ✓ Config looks great — no additions recommended for your current project.\n'));
    return;
  }

  // Show current config summary then proposals
  p.note(
    [
      `Agents: ${existing.agents.join(', ') || pc.dim('none')}`,
      `Skills:  ${existing.skills.join(', ') || pc.dim('none')}`,
    ].join('\n'),
    'Current config'
  );

  displayProposals(proposals);

  // Confirm
  const shouldApply = await p.confirm({ message: 'Apply these changes?' });

  if (p.isCancel(shouldApply) || !shouldApply) {
    console.log(pc.dim('\n  No changes applied.\n'));
    return;
  }

  // Authenticate only if we're adding content that needs generation
  const agentsToAdd = proposals.filter(pr => pr.type === 'add-agent').map(pr => pr.name);
  const skillsToAdd = proposals.filter(pr => pr.type === 'add-skill').map(pr => pr.name);

  let auth: { method: 'claude-plan' | 'api-key'; apiKey?: string } = { method: 'api-key', apiKey: undefined };
  if (agentsToAdd.length > 0 || skillsToAdd.length > 0) {
    const { authenticateWithAnthropic } = await import('../utils/auth.js');
    auth = await authenticateWithAnthropic();
  }

  spinner.start('Applying changes...');

  const context = {
    goal,
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
    agentsToRemove: [],
    skillsToAdd,
    skillsToRemove: [],
    regenerateClaudeMd: false,
  });

  spinner.stop(pc.green('✓') + ' Changes applied');

  console.log('\n' + pc.bold(pc.green('  Config evolved!\n')));
  if (result.added.agents.length > 0) {
    console.log(pc.green('  + ') + 'Agents: ' + result.added.agents.join(', '));
  }
  if (result.added.skills.length > 0) {
    console.log(pc.green('  + ') + 'Skills: ' + result.added.skills.join(', '));
  }
  console.log('');
}
