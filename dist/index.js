#!/usr/bin/env node
/**
 * SuperAgents - Goal-Aware Claude Code Configuration Generator
 *
 * Main entry point for the CLI application
 */
import { Command } from 'commander';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { displayBanner, displayError, displaySuccess } from './cli/banner.js';
import { collectProjectGoal, selectModel, confirmSelections } from './cli/prompts.js';
import { authenticateWithAnthropic } from './utils/auth.js';
import { CodebaseAnalyzer } from './analyzer/codebase-analyzer.js';
import { RecommendationEngine } from './context/recommendation-engine.js';
import { AIGenerator } from './generator/index.js';
import { OutputWriter } from './writer/index.js';
const program = new Command();
program
    .name('superagents')
    .description('Goal-aware Claude Code configuration generator')
    .version('1.0.0')
    .action(async () => {
    try {
        // Display banner
        displayBanner();
        // Step 1: Collect project goal
        const goalData = await collectProjectGoal();
        const goal = {
            ...goalData,
            technicalRequirements: [],
            suggestedAgents: [],
            suggestedSkills: [],
            timestamp: new Date().toISOString(),
            confidence: 1.0
        };
        // Step 2: Authenticate with Anthropic
        p.note('', pc.bold('\n🔐 Authentication'));
        const auth = await authenticateWithAnthropic();
        // Step 3: Select AI model
        const model = await selectModel();
        // Step 4: Analyze codebase
        const spinner = p.spinner();
        spinner.start('Analyzing your codebase...');
        const analyzer = new CodebaseAnalyzer(process.cwd());
        const codebaseAnalysis = await analyzer.analyze();
        spinner.stop(pc.green('✓') + ' Codebase analyzed');
        // Step 5: Generate recommendations
        spinner.start('Generating recommendations...');
        const recommendationEngine = new RecommendationEngine();
        const recommendations = await recommendationEngine.recommend(goal, codebaseAnalysis);
        spinner.stop(pc.green('✓') + ' Recommendations generated');
        // Step 6: Confirm selections
        const selections = await confirmSelections(recommendations);
        // Step 7: Generate with AI
        spinner.start('Generating configurations with Claude...');
        const generator = new AIGenerator();
        const context = {
            goal,
            codebase: codebaseAnalysis,
            selectedAgents: selections.agents,
            selectedSkills: selections.skills,
            selectedModel: model,
            authMethod: auth.method,
            apiKey: auth.apiKey,
            sampledFiles: codebaseAnalysis.sampledFiles || [],
            generatedAt: new Date().toISOString()
        };
        const outputs = await generator.generateAll(context);
        spinner.stop(pc.green('✓') + ' Configurations generated');
        // Step 8: Write output
        spinner.start('Writing files to .claude folder...');
        const writer = new OutputWriter(process.cwd());
        const summary = await writer.writeAll(outputs);
        spinner.stop(pc.green('✓') + ' Files written successfully');
        // Display success message
        displaySuccess({
            agents: summary.agents,
            skills: summary.skills,
            claudeDir: summary.claudeDir
        });
    }
    catch (error) {
        if (error instanceof Error) {
            displayError(error.message);
        }
        else {
            displayError('An unknown error occurred');
        }
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=index.js.map