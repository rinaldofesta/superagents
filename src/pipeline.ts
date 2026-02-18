/**
 * Generation pipeline orchestration
 *
 * Manages the main generation flow from project analysis through output writing.
 * Called by the CLI after authentication and banner display.
 */

// External packages
import * as p from '@clack/prompts';
import pc from 'picocolors';

// Internal modules
import { CodebaseAnalyzer } from './analyzer/codebase-analyzer.js';
import { matchBlueprints } from './blueprints/matcher.js';
import { cache } from './cache/index.js';
import { displayDryRunPreview } from './cli/dry-run.js';
import { collectProjectGoal, collectNewProjectSpec, detectProjectMode, specToGoal, selectModel, selectTeam, selectBlueprint, computeAutoLinkedSkills, categorizeGoalFromText } from './cli/prompts.js';
import { RecommendationEngine } from './context/recommendation-engine.js';
import { AIGenerator } from './generator/index.js';
import { log } from './utils/logger.js';
import { OutputWriter } from './writer/index.js';

// Type imports
import type { BlueprintId } from './types/blueprint.js';
import type { AuthResult } from './utils/auth.js';
import type { CodebaseAnalysis } from './types/codebase.js';
import type { GenerationContext, WriteSummary } from './types/generation.js';
import type { ProjectGoal, ProjectMode, ProjectSpec } from './types/goal.js';

export interface PipelineOptions {
  projectRoot: string;
  isDryRun: boolean;
  isVerbose: boolean;
  auth: AuthResult;
  jsonMode?: boolean;
  goalOverride?: string;
  agentOverrides?: string[];
  skillOverrides?: string[];
}

export interface PipelineResult {
  summary: WriteSummary;
  codebaseAnalysis: CodebaseAnalysis;
  projectMode: ProjectMode;
}

/**
 * Run the main generation pipeline.
 *
 * Orchestrates: mode detection -> goal collection -> model selection ->
 * codebase analysis -> recommendations -> confirmation -> generation -> writing.
 *
 * Returns a PipelineResult on success, or undefined if dry-run mode.
 * Throws on failure (caller handles error display).
 */
export async function runGenerationPipeline(options: PipelineOptions): Promise<PipelineResult | undefined> {
  const { projectRoot, isDryRun, isVerbose, auth } = options;

  // Step 2: Detect project mode (new vs existing)
  const projectMode: ProjectMode = await detectProjectMode(projectRoot);
  log.debug(`Project mode: ${projectMode}`);

  // Initialize cache early (needed for codebase analysis caching)
  await cache.init();

  // Step 3: Collect goal and analyze codebase
  // For existing projects: analyze first → show detected info → ask focused question
  // For new projects: guided spec gathering → then analyze
  const spinner = options.jsonMode
    ? { start: (_?: string) => {}, stop: (_?: string) => {} }
    : p.spinner();
  let codebaseAnalysis: CodebaseAnalysis;
  let goal: ProjectGoal;
  let selectedBlueprintId: BlueprintId | undefined;
  let spec: ProjectSpec | undefined;

  if (options.jsonMode && options.goalOverride) {
    // JSON mode: derive goal from text, skip interactive prompts
    const category = categorizeGoalFromText(options.goalOverride);
    goal = {
      description: options.goalOverride,
      category,
      technicalRequirements: [],
      suggestedAgents: [],
      suggestedSkills: [],
      timestamp: new Date().toISOString(),
      confidence: 1.0
    };
    const cachedAnalysis = await cache.getCachedAnalysis(projectRoot);
    if (cachedAnalysis) {
      codebaseAnalysis = cachedAnalysis;
    } else {
      const analyzer = new CodebaseAnalyzer(projectRoot);
      codebaseAnalysis = await analyzer.analyze();
      await cache.setCachedAnalysis(projectRoot, codebaseAnalysis);
    }
  } else if (projectMode === 'new') {
    // New project: collect goal first, then analyze
    console.log(pc.dim('  Detected: New/minimal project\n'));
    spec = await collectNewProjectSpec();
    const goalData = specToGoal(spec);
    goal = {
      ...goalData,
      requirements: goalData.requirements,
      technicalRequirements: [],
      suggestedAgents: [],
      suggestedSkills: [],
      timestamp: new Date().toISOString(),
      confidence: 1.0
    };

    // Blueprint matching for new projects
    const blueprintMatches = matchBlueprints(goal, spec);
    if (!options.jsonMode && blueprintMatches.length > 0) {
      const chosen = await selectBlueprint(blueprintMatches);
      if (chosen) {
        selectedBlueprintId = chosen;
        log.debug(`Selected blueprint: ${chosen}`);
      }
    }

    spinner.start('Scanning your project...');
    const cachedAnalysis = await cache.getCachedAnalysis(projectRoot);
    if (cachedAnalysis) {
      codebaseAnalysis = cachedAnalysis;
      spinner.stop(pc.green('✓') + ' Project scanned ' + pc.dim('(cached)'));
    } else {
      const analyzer = new CodebaseAnalyzer(projectRoot);
      codebaseAnalysis = await analyzer.analyze();
      await cache.setCachedAnalysis(projectRoot, codebaseAnalysis);
      spinner.stop(pc.green('✓') + ' Project scanned');
    }
  } else {
    // Existing project: analyze first so prompts can use the context
    spinner.start('Scanning your project...');
    const cachedAnalysis = await cache.getCachedAnalysis(projectRoot);
    if (cachedAnalysis) {
      codebaseAnalysis = cachedAnalysis;
      spinner.stop(pc.green('✓') + ' Project scanned ' + pc.dim('(cached)'));
      log.verbose('Using cached codebase analysis');
    } else {
      const analyzer = new CodebaseAnalyzer(projectRoot);
      codebaseAnalysis = await analyzer.analyze();
      await cache.setCachedAnalysis(projectRoot, codebaseAnalysis);
      spinner.stop(pc.green('✓') + ' Project scanned');
      log.verbose('Codebase analysis cached for future runs');
    }

    if (!options.jsonMode) {
      log.section('Codebase Analysis');
      log.table({
        'Project Type': codebaseAnalysis.projectType,
        'Language': codebaseAnalysis.language || 'Unknown',
        'Framework': codebaseAnalysis.framework || 'None',
        'Total Files': codebaseAnalysis.totalFiles,
        'Dependencies': codebaseAnalysis.dependencies.length
      });
    }

    // Collect goal with codebase context — auto-detects category, skips redundant questions
    const goalData = await collectProjectGoal(codebaseAnalysis);
    goal = {
      ...goalData,
      technicalRequirements: [],
      suggestedAgents: [],
      suggestedSkills: [],
      timestamp: new Date().toISOString(),
      confidence: 1.0
    };
  }

  log.debug(`Goal: ${goal.description}`);
  log.debug(`Category: ${goal.category}`);

  // Step 4b: Select AI model
  const model = options.jsonMode ? 'sonnet' : await selectModel(isVerbose);
  log.debug(`Selected model: ${model}`);

  // Step 5: Generate recommendations
  spinner.start('Finding the best agents for your project...');

  const recommendationEngine = new RecommendationEngine();
  const recommendations = await recommendationEngine.recommend(goal, codebaseAnalysis);

  const totalRelevant = recommendations.agents.filter(a => a.score > 0).length;
  spinner.stop(
    pc.green('✓') + ` Analyzed ${totalRelevant} agents, ${recommendations.defaultAgents.length} recommended`
  );

  if (!options.jsonMode) {
    log.section('Recommendations');
    log.verbose(`Agents: ${recommendations.agents.map(a => `${a.name}(${a.score})`).join(', ')}`);
    log.verbose(`Skills: ${recommendations.skills.map(s => `${s.name}(${s.score})`).join(', ')}`);
  }

  // Step 6: Select team (agents + auto-linked skills)
  let selections: { agents: string[]; skills: string[]; autoLinkedSkills: string[]; qualityGate: 'hard' | 'soft' | 'off' };
  if (options.jsonMode) {
    const agents = options.agentOverrides ?? recommendations.defaultAgents;
    const skills = options.skillOverrides
      ?? [...new Set([...computeAutoLinkedSkills(agents, recommendations), ...recommendations.defaultSkills])];
    selections = { agents, skills, autoLinkedSkills: [], qualityGate: 'off' };
  } else {
    selections = await selectTeam(recommendations, { testCommand: codebaseAnalysis.testCommand });
  }
  const allSkills = [...new Set([...selections.skills, ...selections.autoLinkedSkills])];

  const qualityGate = selections.qualityGate;
  const securityGate = selections.agents.includes('security-analyst');

  log.debug(`Selected agents: ${selections.agents.join(', ')}`);
  log.debug(`Selected skills: ${allSkills.join(', ')}`);

  // Build context
  const context: GenerationContext = {
    goal,
    codebase: codebaseAnalysis,
    selectedAgents: selections.agents,
    selectedSkills: allSkills,
    selectedModel: model,
    authMethod: auth.method,
    apiKey: auth.apiKey,
    sampledFiles: codebaseAnalysis.sampledFiles || [],
    verbose: isVerbose,
    dryRun: isDryRun,
    selectedBlueprint: selectedBlueprintId,
    qualityGate,
    securityGate,
    generatedAt: new Date().toISOString()
  };

  // If dry-run, show preview and exit
  if (isDryRun) {
    displayDryRunPreview(context);
    return undefined;
  }

  // Step 7: Generate with AI
  if (!options.jsonMode) console.log('');  // Add spacing

  const generator = new AIGenerator();
  const outputs = await generator.generateAll(context);

  if (!options.jsonMode) console.log('');  // Add spacing after generation

  // Step 8: Write output
  spinner.start('Saving configuration...');

  const writer = new OutputWriter(projectRoot, options.jsonMode ?? false);
  const summary = await writer.writeAll(outputs);

  spinner.stop(pc.green('✓') + ' Configuration saved');

  return { summary, codebaseAnalysis, projectMode };
}
