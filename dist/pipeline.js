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
import { cache } from './cache/index.js';
import { displayDryRunPreview } from './cli/dry-run.js';
import { collectProjectGoal, collectNewProjectSpec, detectProjectMode, specToGoal, selectModel, confirmSelections } from './cli/prompts.js';
import { RecommendationEngine } from './context/recommendation-engine.js';
import { AIGenerator } from './generator/index.js';
import { log } from './utils/logger.js';
import { OutputWriter } from './writer/index.js';
/**
 * Run the main generation pipeline.
 *
 * Orchestrates: mode detection -> goal collection -> model selection ->
 * codebase analysis -> recommendations -> confirmation -> generation -> writing.
 *
 * Returns a PipelineResult on success, or undefined if dry-run mode.
 * Throws on failure (caller handles error display).
 */
export async function runGenerationPipeline(options) {
    const { projectRoot, isDryRun, isVerbose, auth } = options;
    // Step 2: Detect project mode (new vs existing)
    const projectMode = await detectProjectMode(projectRoot);
    log.debug(`Project mode: ${projectMode}`);
    // Step 3: Collect project goal based on mode
    let goal;
    if (projectMode === 'new') {
        // New project: guided spec gathering
        console.log(pc.dim('  Detected: New/minimal project\n'));
        const spec = await collectNewProjectSpec();
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
    }
    else {
        // Existing codebase: standard flow
        console.log(pc.dim('  Detected: Existing codebase\n'));
        const goalData = await collectProjectGoal();
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
    // Step 3b: Select AI model
    const model = await selectModel(isVerbose);
    log.debug(`Selected model: ${model}`);
    // Initialize cache
    await cache.init();
    // Step 4: Analyze codebase (with caching)
    const spinner = p.spinner();
    spinner.start('Scanning your project...');
    let codebaseAnalysis;
    const cachedAnalysis = await cache.getCachedAnalysis(projectRoot);
    if (cachedAnalysis) {
        codebaseAnalysis = cachedAnalysis;
        spinner.stop(pc.green('✓') + ' Project scanned ' + pc.dim('(cached)'));
        log.verbose('Using cached codebase analysis');
    }
    else {
        const analyzer = new CodebaseAnalyzer(projectRoot);
        codebaseAnalysis = await analyzer.analyze();
        await cache.setCachedAnalysis(projectRoot, codebaseAnalysis);
        spinner.stop(pc.green('✓') + ' Project scanned');
        log.verbose('Codebase analysis cached for future runs');
    }
    log.section('Codebase Analysis');
    log.table({
        'Project Type': codebaseAnalysis.projectType,
        'Language': codebaseAnalysis.language || 'Unknown',
        'Framework': codebaseAnalysis.framework || 'None',
        'Total Files': codebaseAnalysis.totalFiles,
        'Dependencies': codebaseAnalysis.dependencies.length
    });
    // Step 5: Generate recommendations
    spinner.start('Finding the best agents for your project...');
    const recommendationEngine = new RecommendationEngine();
    const recommendations = await recommendationEngine.recommend(goal, codebaseAnalysis);
    spinner.stop(pc.green('✓') + ' Found ' + recommendations.defaultAgents.length + ' recommended agents');
    log.section('Recommendations');
    log.verbose(`Agents: ${recommendations.agents.map(a => `${a.name}(${a.score})`).join(', ')}`);
    log.verbose(`Skills: ${recommendations.skills.map(s => `${s.name}(${s.score})`).join(', ')}`);
    // Step 6: Confirm selections
    const selections = await confirmSelections(recommendations);
    log.debug(`Selected agents: ${selections.agents.join(', ')}`);
    log.debug(`Selected skills: ${selections.skills.join(', ')}`);
    // Build context
    const context = {
        goal,
        codebase: codebaseAnalysis,
        selectedAgents: selections.agents,
        selectedSkills: selections.skills,
        selectedModel: model,
        authMethod: auth.method,
        apiKey: auth.apiKey,
        sampledFiles: codebaseAnalysis.sampledFiles || [],
        verbose: isVerbose,
        dryRun: isDryRun,
        generatedAt: new Date().toISOString()
    };
    // If dry-run, show preview and exit
    if (isDryRun) {
        displayDryRunPreview(context);
        return undefined;
    }
    // Step 7: Generate with AI
    console.log(''); // Add spacing
    const generator = new AIGenerator();
    const outputs = await generator.generateAll(context);
    console.log(''); // Add spacing after generation
    // Step 8: Write output
    spinner.start('Saving configuration...');
    const writer = new OutputWriter(projectRoot);
    const summary = await writer.writeAll(outputs);
    spinner.stop(pc.green('✓') + ' Configuration saved');
    return { summary };
}
//# sourceMappingURL=pipeline.js.map