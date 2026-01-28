#!/usr/bin/env node

/**
 * SuperAgents - Context-Aware Claude Code Configuration Generator
 *
 * Main entry point for the CLI application
 *
 * Features:
 * - --dry-run: Preview what would be generated without API calls
 * - --verbose: Show detailed logging
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import path from 'path';
import { displayBanner, displayError, displaySuccess } from './cli/banner.js';
import { collectProjectGoal, selectModel, confirmSelections } from './cli/prompts.js';
import { displayDryRunPreview } from './cli/dry-run.js';
import { authenticateWithAnthropic } from './utils/auth.js';
import { setVerbose, log } from './utils/logger.js';
import { cache } from './cache/index.js';
import { CodebaseAnalyzer } from './analyzer/codebase-analyzer.js';
import { RecommendationEngine } from './context/recommendation-engine.js';
import { AIGenerator } from './generator/index.js';
import { OutputWriter } from './writer/index.js';
import type { ProjectGoal } from './types/goal.js';
import type { GenerationContext } from './types/generation.js';
import type { CodebaseAnalysis } from './types/codebase.js';

const execAsync = promisify(exec);
const program = new Command();

interface CLIOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

program
  .name('superagents')
  .description('Context-aware Claude Code configuration generator')
  .version('1.3.0')
  .option('--dry-run', 'Preview what would be generated without making API calls')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options: CLIOptions) => {
    try {
      // Set verbose mode
      const isVerbose = options.verbose || false;
      const isDryRun = options.dryRun || false;
      setVerbose(isVerbose);

      log.debug('SuperAgents starting...');
      log.debug(`Working directory: ${process.cwd()}`);
      log.debug(`Dry-run mode: ${isDryRun}`);
      log.debug(`Verbose mode: ${isVerbose}`);

      // Display banner
      displayBanner();

      if (isDryRun) {
        console.log(pc.yellow('\n  Running in DRY-RUN mode - no API calls will be made\n'));
      }

      // Step 1: Collect project goal
      const goalData = await collectProjectGoal();
      const goal: ProjectGoal = {
        ...goalData,
        technicalRequirements: [],
        suggestedAgents: [],
        suggestedSkills: [],
        timestamp: new Date().toISOString(),
        confidence: 1.0
      };

      log.debug(`Goal: ${goal.description}`);
      log.debug(`Category: ${goal.category}`);

      // Step 2: Authenticate with Anthropic (skip in dry-run)
      let auth: { method: 'api-key' | 'claude-plan'; apiKey?: string } = { method: 'api-key', apiKey: undefined };
      if (!isDryRun) {
        p.note('', pc.bold('\n🔐 Authentication'));
        auth = await authenticateWithAnthropic();
        log.debug(`Auth method: ${auth.method}`);
      }

      // Step 3: Select AI model
      const model = await selectModel();
      log.debug(`Selected model: ${model}`);

      // Initialize cache
      await cache.init();

      // Step 4: Analyze codebase (with caching)
      const spinner = p.spinner();
      spinner.start('Analyzing your codebase...');

      let codebaseAnalysis: CodebaseAnalysis;
      const cachedAnalysis = await cache.getCachedAnalysis(process.cwd());

      if (cachedAnalysis) {
        codebaseAnalysis = cachedAnalysis;
        spinner.stop(pc.green('✓') + ' Codebase analyzed ' + pc.dim('(cached)'));
        log.verbose('Using cached codebase analysis');
      } else {
        const analyzer = new CodebaseAnalyzer(process.cwd());
        codebaseAnalysis = await analyzer.analyze();
        await cache.setCachedAnalysis(process.cwd(), codebaseAnalysis);
        spinner.stop(pc.green('✓') + ' Codebase analyzed');
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
      spinner.start('Generating recommendations...');

      const recommendationEngine = new RecommendationEngine();
      const recommendations = await recommendationEngine.recommend(goal, codebaseAnalysis);

      spinner.stop(pc.green('✓') + ' Recommendations generated');

      log.section('Recommendations');
      log.verbose(`Agents: ${recommendations.agents.map(a => `${a.name}(${a.score})`).join(', ')}`);
      log.verbose(`Skills: ${recommendations.skills.map(s => `${s.name}(${s.score})`).join(', ')}`);

      // Step 6: Confirm selections
      const selections = await confirmSelections(recommendations);

      log.debug(`Selected agents: ${selections.agents.join(', ')}`);
      log.debug(`Selected skills: ${selections.skills.join(', ')}`);

      // Build context
      const context: GenerationContext = {
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
        return;
      }

      // Step 7: Generate with AI
      // Generator has its own ora spinner with percentage progress
      console.log('');  // Add spacing

      const generator = new AIGenerator();
      const outputs = await generator.generateAll(context);

      console.log('');  // Add spacing after generation

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

    } catch (error) {
      if (error instanceof Error) {
        log.debug(`Error: ${error.stack}`);
        displayError(error.message);
      } else {
        displayError('An unknown error occurred');
      }
      process.exit(1);
    }
  });

// Update command
program
  .command('update')
  .description('Update SuperAgents to the latest version')
  .action(async () => {
    const installDir = path.join(os.homedir(), '.superagents');

    console.log(pc.blue('\n  Updating SuperAgents...\n'));

    try {
      // Check if installed via git
      const { stdout: gitCheck } = await execAsync(`cd "${installDir}" && git rev-parse --is-inside-work-tree 2>/dev/null`).catch(() => ({ stdout: '' }));

      if (gitCheck.trim() === 'true') {
        // Git-based installation - pull latest
        const { stdout: pullOutput } = await execAsync(`cd "${installDir}" && git pull`);

        if (pullOutput.includes('Already up to date')) {
          console.log(pc.green('  ✓ SuperAgents is already up to date!\n'));
        } else {
          console.log(pc.green('  ✓ SuperAgents updated successfully!\n'));
          console.log(pc.dim('  Changes:'));
          console.log(pc.dim('  ' + pullOutput.trim().split('\n').join('\n  ')));
          console.log('');
        }
      } else {
        // npm-based installation
        console.log(pc.yellow('  Updating via npm...\n'));
        await execAsync('npm update -g superagents');
        console.log(pc.green('  ✓ SuperAgents updated successfully!\n'));
      }
    } catch (error) {
      console.log(pc.red('  ✗ Update failed\n'));
      console.log(pc.dim(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`));
      console.log(pc.dim('  Try manually: cd ~/.superagents && git pull\n'));
      process.exit(1);
    }
  });

// Cache command
program
  .command('cache')
  .description('Manage SuperAgents cache')
  .option('--clear', 'Clear all cached data')
  .option('--stats', 'Show cache statistics')
  .action(async (options: { clear?: boolean; stats?: boolean }) => {
    try {
      await cache.init();

      if (options.clear) {
        await cache.clearCache();
        console.log(pc.green('\n  ✓ Cache cleared successfully\n'));
        return;
      }

      if (options.stats) {
        const stats = await cache.getStats();
        console.log(pc.bold('\n  Cache Statistics\n'));
        console.log(pc.dim(`  Location: ${cache.getCacheDir()}`));
        console.log(pc.dim(`  Analysis entries: ${stats.analysisCount}`));
        console.log(pc.dim(`  Generation entries: ${stats.generationCount}`));
        console.log(pc.dim(`  Total size: ${formatBytes(stats.totalSize)}\n`));
        return;
      }

      // Show help if no option provided
      console.log(pc.bold('\n  Cache Commands\n'));
      console.log(pc.dim('  superagents cache --stats   Show cache statistics'));
      console.log(pc.dim('  superagents cache --clear   Clear all cached data\n'));
    } catch (error) {
      console.log(pc.red('\n  ✗ Cache operation failed\n'));
      console.log(pc.dim(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`));
      process.exit(1);
    }
  });

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

program.parse();
