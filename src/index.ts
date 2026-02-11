#!/usr/bin/env node

// Suppress punycode deprecation warning from transitive dependencies
// This must be before any imports to catch warnings from module loading
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    return;
  }
  console.warn(warning);
});

/**
 * SuperAgents - Context-Aware Claude Code Configuration Generator
 *
 * Main entry point for the CLI application
 *
 * Features:
 * - --dry-run: Preview what would be generated without API calls
 * - --verbose: Show detailed logging
 */

// Node.js built-ins
import { exec } from 'child_process';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

// External packages
import * as p from '@clack/prompts';
import { Command } from 'commander';
import pc from 'picocolors';

// Internal modules
import { CodebaseAnalyzer } from './analyzer/codebase-analyzer.js';
import { cache } from './cache/index.js';
import { displayBanner, displayError, displaySuccess } from './cli/banner.js';
import { orange } from './cli/colors.js';
import { EXIT_CODES, getExitCodeForError } from './cli/exit-codes.js';
import { runGenerationPipeline } from './pipeline.js';
import { ConfigUpdater } from './updater/index.js';
import { authenticateWithAnthropic } from './utils/auth.js';
import { setVerbose, log } from './utils/logger.js';
import { checkForUpdates, displayUpdateNotification, getCurrentVersion } from './utils/version-check.js';

// Type imports
import type { GenerationContext } from './types/generation.js';

const execAsync = promisify(exec);
const program = new Command();

interface CLIOptions {
  dryRun?: boolean;
  verbose?: boolean;
  update?: boolean;
}

/**
 * Handle update mode - incrementally update existing .claude/ configuration
 */
async function handleUpdateMode(isVerbose: boolean): Promise<void> {
  const updater = new ConfigUpdater(process.cwd());

  // Check if .claude/ exists
  if (!(await updater.hasExistingConfig())) {
    console.log(pc.red('\n  No .claude/ folder found in this project.'));
    console.log(pc.dim('  Run superagents first to create a configuration.\n'));
    process.exit(1);
  }

  // Read existing configuration
  const spinner = p.spinner();
  spinner.start('Reading current config...');
  const existing = await updater.readExisting();
  spinner.stop(pc.green('✓') + ' Config loaded');

  // Get available agents and skills from templates
  const { getAvailableTemplates } = await import('./templates/loader.js');
  const available = getAvailableTemplates();

  // Prompt user for what to update
  const updates = await updater.promptUpdateOptions(existing, available);

  // Check if there's anything to do
  const hasChanges = updates.agentsToAdd.length > 0 ||
    updates.agentsToRemove.length > 0 ||
    updates.skillsToAdd.length > 0 ||
    updates.skillsToRemove.length > 0 ||
    updates.regenerateClaudeMd;

  if (!hasChanges) {
    console.log(pc.yellow('\n  Nothing to update. Use space to select items.\n'));
    return;
  }

  // Authenticate if adding new content
  let auth: { method: 'claude-plan' | 'api-key'; apiKey?: string } = { method: 'api-key', apiKey: undefined };
  if (updates.agentsToAdd.length > 0 || updates.skillsToAdd.length > 0 || updates.regenerateClaudeMd) {
    p.note('', pc.bold('\n🔐 Sign in to generate new content'));
    auth = await authenticateWithAnthropic();
    log.debug(`Auth method: ${auth.method}`);
  }

  // Build minimal context for generation
  spinner.start('Scanning your codebase...');
  const analyzer = new CodebaseAnalyzer(process.cwd());
  const codebaseAnalysis = await analyzer.analyze();
  spinner.stop(pc.green('✓') + ' Codebase scanned');

  const context: GenerationContext = {
    goal: {
      description: 'Update existing configuration',
      category: 'custom',
      technicalRequirements: [],
      suggestedAgents: [],
      suggestedSkills: [],
      timestamp: new Date().toISOString(),
      confidence: 1.0
    },
    codebase: codebaseAnalysis,
    selectedAgents: updates.agentsToAdd,
    selectedSkills: updates.skillsToAdd,
    selectedModel: 'sonnet',
    authMethod: auth.method,
    apiKey: auth.apiKey,
    sampledFiles: codebaseAnalysis.sampledFiles || [],
    verbose: isVerbose,
    dryRun: false,
    generatedAt: new Date().toISOString()
  };

  // Apply updates
  spinner.start('Applying changes...');
  const result = await updater.applyUpdates(context, updates);
  spinner.stop(pc.green('✓') + ' Changes applied');

  // Display summary
  console.log('\n' + pc.bold(pc.green('  Config updated!\n')));

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
    console.log(orange('  ~ ') + 'Regenerated CLAUDE.md');
  }
  console.log('');

  // Check for CLI updates
  const updateInfo = await checkForUpdates();
  if (updateInfo) {
    displayUpdateNotification(updateInfo);
  }
}

program
  .name('superagents')
  .description('Generate expert-backed Claude Code configurations for your project')
  .version(getCurrentVersion())
  .option('--dry-run', 'Preview generation without API calls or file changes')
  .option('-v, --verbose', 'Show detailed logs')
  .option('-u, --update', 'Add or remove agents from existing config')
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

      // Start version check in background (non-blocking)
      const updateCheckPromise = checkForUpdates();

      if (isDryRun) {
        console.log(pc.yellow('\n  Preview mode: no files will be created\n'));
      }

      // Handle update mode
      if (options.update) {
        await handleUpdateMode(isVerbose);
        return;
      }

      // Step 1: AUTHENTICATION FIRST (skip in dry-run)
      let auth: { method: 'claude-plan' | 'api-key'; apiKey?: string } = { method: 'api-key', apiKey: undefined };
      if (!isDryRun) {
        console.log(pc.dim('\n  SuperAgents creates an AI team customized for your project.'));
        console.log(pc.dim('  Sign in to get started \u2014 it only takes a minute.\n'));
        auth = await authenticateWithAnthropic();
        log.debug(`Auth method: ${auth.method}`);
      }

      // Steps 2-8: Run the generation pipeline
      const result = await runGenerationPipeline({
        projectRoot: process.cwd(),
        isDryRun,
        isVerbose,
        auth
      });

      // Dry-run returns no result
      if (result) {
        displaySuccess(result.summary, result.codebaseAnalysis, result.projectMode);
      }

      // Show update notification if available (after success)
      const updateInfo = await updateCheckPromise;
      if (updateInfo) {
        displayUpdateNotification(updateInfo);
      }

    } catch (error) {
      if (error instanceof Error) {
        log.debug(`Error: ${error.stack}`);
        displayError(error.message);
        process.exit(getExitCodeForError(error));
      } else {
        displayError('An unknown error occurred');
        process.exit(EXIT_CODES.SYSTEM_ERROR);
      }
    }
  });

// Update command
program
  .command('update')
  .description('Get the latest version of SuperAgents')
  .action(async () => {
    const installDir = path.join(os.homedir(), '.superagents');

    console.log(orange('\n  Checking for updates...\n'));

    try {
      // Check if installed via git
      const { stdout: gitCheck } = await execAsync(`cd "${installDir}" && git rev-parse --is-inside-work-tree 2>/dev/null`).catch(() => ({ stdout: '' }));

      if (gitCheck.trim() === 'true') {
        // Git-based installation - fetch and hard reset to avoid conflicts
        // Get current commit before update
        const { stdout: beforeCommit } = await execAsync(`cd "${installDir}" && git rev-parse HEAD`);

        console.log(pc.dim('  Downloading latest version...'));
        await execAsync(`cd "${installDir}" && git fetch origin main`);
        await execAsync(`cd "${installDir}" && git reset --hard origin/main`);

        // Get commit after update
        const { stdout: afterCommit } = await execAsync(`cd "${installDir}" && git rev-parse HEAD`);

        if (beforeCommit.trim() === afterCommit.trim()) {
          console.log(pc.green('  ✓ You have the latest version!\n'));
        } else {
          // Rebuild after update
          console.log(pc.dim('  Installing dependencies...'));
          await execAsync(`cd "${installDir}" && npm install`);
          console.log(pc.dim('  Building...'));
          await execAsync(`cd "${installDir}" && npm run build`);

          console.log(pc.green('\n  ✓ Updated to latest version!\n'));
        }
      } else {
        // npm-based installation
        console.log(pc.dim('  Updating via npm...\n'));
        await execAsync('npm update -g superagents');
        console.log(pc.green('  ✓ Updated to latest version!\n'));
      }
    } catch (error) {
      console.log(pc.red('  ✗ Update failed\n'));
      console.log(pc.dim(`  ${error instanceof Error ? error.message : 'Unknown error'}\n`));
      console.log(pc.dim('  Manual fix: cd ~/.superagents && git reset --hard && git pull && npm install && npm run build\n'));
      process.exit(1);
    }
  });

// Cache command
program
  .command('cache')
  .description('View or clear cached data')
  .option('--clear', 'Delete all cached data')
  .option('--stats', 'Show cache size and entries')
  .action(async (options: { clear?: boolean; stats?: boolean }) => {
    try {
      await cache.init();

      if (options.clear) {
        await cache.clearCache();
        console.log(pc.green('\n  ✓ Cache cleared\n'));
        return;
      }

      if (options.stats) {
        const stats = await cache.getStats();
        console.log(pc.bold('\n  Cache Info\n'));
        console.log(pc.dim(`  Location: ${cache.getCacheDir()}`));
        console.log(pc.dim(`  Saved analyses: ${stats.analysisCount}`));
        console.log(pc.dim(`  Saved generations: ${stats.generationCount}`));
        console.log(pc.dim(`  Disk usage: ${formatBytes(stats.totalSize)}\n`));
        return;
      }

      // Show help if no option provided
      console.log(pc.bold('\n  Cache Commands\n'));
      console.log(pc.dim('  superagents cache --stats   View cache size'));
      console.log(pc.dim('  superagents cache --clear   Delete cached data\n'));
    } catch (error) {
      console.log(pc.red('\n  ✗ Cache operation failed\n'));
      console.log(pc.dim(`  ${error instanceof Error ? error.message : 'Unknown error'}\n`));
      process.exit(1);
    }
  });

// Templates command
program
  .command('templates')
  .description('Create and manage custom agent templates')
  .option('--list', 'Show all available templates')
  .option('--export <name>', 'Copy a built-in template to customize')
  .option('--import <path>', 'Add a template from file')
  .option('--delete <name>', 'Remove a custom template')
  .option('--type <type>', 'Template type: agent or skill', 'agent')
  .action(async (options: {
    list?: boolean;
    export?: string;
    import?: string;
    delete?: string;
    type?: string;
  }) => {
    const {
      listCustomTemplates,
      exportTemplate,
      importTemplate,
      deleteCustomTemplate,
      getCustomTemplatesDir,
      initCustomTemplatesDir
    } = await import('./templates/custom.js');
    const { getAvailableTemplates } = await import('./templates/loader.js');
    const { fileURLToPath } = await import('url');

    try {
      await initCustomTemplatesDir();
      const templateType = (options.type === 'skill' ? 'skill' : 'agent') as 'agent' | 'skill';

      if (options.list) {
        const builtin = getAvailableTemplates();
        const custom = await listCustomTemplates();

        console.log(pc.bold('\n  Built-in (') + builtin.agents.length + ' agents, ' + builtin.skills.length + ' skills)\n');
        console.log(pc.dim('  Agents: ') + builtin.agents.join(', '));
        console.log(pc.dim('  Skills: ') + builtin.skills.join(', '));

        console.log(pc.bold('\n  Your Custom Templates\n'));
        console.log(pc.dim('  Folder: ') + getCustomTemplatesDir());
        console.log(pc.dim('  Agents: ') + (custom.agents.length > 0 ? custom.agents.join(', ') : 'none yet'));
        console.log(pc.dim('  Skills: ') + (custom.skills.length > 0 ? custom.skills.join(', ') : 'none yet'));
        console.log('');
        return;
      }

      if (options.export) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const builtInDir = path.join(__dirname, 'templates');

        const success = await exportTemplate(templateType, options.export, builtInDir);
        if (success) {
          console.log(pc.green(`\n  ✓ Copied "${options.export}" to your templates\n`));
          console.log(pc.dim(`  Edit it at: ${getCustomTemplatesDir()}/${templateType}s/${options.export.toLowerCase()}.md\n`));
        } else {
          console.log(pc.red(`\n  ✗ No ${templateType} named "${options.export}" exists\n`));
          console.log(pc.dim('  Run superagents templates --list to see available templates\n'));
        }
        return;
      }

      if (options.import) {
        const success = await importTemplate(templateType, options.import);
        if (success) {
          const name = path.basename(options.import, '.md');
          console.log(pc.green(`\n  ✓ Added "${name}" to your templates\n`));
        } else {
          console.log(pc.red(`\n  ✗ Could not find file: ${options.import}\n`));
        }
        return;
      }

      if (options.delete) {
        const success = await deleteCustomTemplate(templateType, options.delete);
        if (success) {
          console.log(pc.green(`\n  ✓ Removed "${options.delete}" from your templates\n`));
        } else {
          console.log(pc.red(`\n  ✗ No custom ${templateType} named "${options.delete}" found\n`));
        }
        return;
      }

      // Show help if no option provided
      console.log(pc.bold('\n  Template Commands\n'));
      console.log(pc.dim('  superagents templates --list              Show all templates'));
      console.log(pc.dim('  superagents templates --export <name>     Copy built-in to customize'));
      console.log(pc.dim('  superagents templates --import <path>     Add template from file'));
      console.log(pc.dim('  superagents templates --delete <name>     Remove custom template'));
      console.log(pc.dim('  superagents templates --type skill ...    Work with skill templates\n'));
    } catch (error) {
      console.log(pc.red('\n  ✗ Template operation failed\n'));
      console.log(pc.dim(`  ${error instanceof Error ? error.message : 'Unknown error'}\n`));
      process.exit(1);
    }
  });

// Export command
program
  .command('export [output]')
  .description('Save your config as a shareable zip file')
  .action(async (output?: string) => {
    const { exportConfig } = await import('./config/export-import.js');

    try {
      const outputPath = output || `superagents-config-${Date.now()}.zip`;
      const absolutePath = path.isAbsolute(outputPath) ? outputPath : path.join(process.cwd(), outputPath);

      console.log(orange('\n  Creating export...\n'));

      const result = await exportConfig(process.cwd(), absolutePath);

      console.log(pc.green('  ✓ Config exported!\n'));
      console.log(pc.dim(`  Saved to: ${result.path}`));
      console.log(pc.dim(`  Contains: ${result.metadata.agents.length} agents, ${result.metadata.skills.length} skills`));
      console.log(pc.dim(`  CLAUDE.md: ${result.metadata.hasCLAUDEmd ? 'included' : 'not included'}\n`));
    } catch (error) {
      console.log(pc.red('\n  ✗ Export failed\n'));
      console.log(pc.dim(`  ${error instanceof Error ? error.message : 'Unknown error'}\n`));
      process.exit(1);
    }
  });

// Import command
program
  .command('import <source>')
  .description('Load config from a zip file')
  .option('-f, --force', 'Replace existing config')
  .option('--preview', 'Show contents without importing')
  .action(async (source: string, options: { force?: boolean; preview?: boolean }) => {
    const { importConfig, previewConfig } = await import('./config/export-import.js');

    try {
      const sourcePath = path.isAbsolute(source) ? source : path.join(process.cwd(), source);

      if (options.preview) {
        console.log(orange('\n  Contents of this export:\n'));

        const metadata = await previewConfig(sourcePath);
        if (metadata) {
          console.log(pc.dim(`  Version: ${metadata.version}`));
          console.log(pc.dim(`  Created: ${metadata.exportedAt}`));
          console.log(pc.dim(`  Source: ${metadata.projectRoot}`));
          console.log(pc.dim(`  Agents: ${metadata.agents.join(', ') || 'none'}`));
          console.log(pc.dim(`  Skills: ${metadata.skills.join(', ') || 'none'}`));
          console.log(pc.dim(`  CLAUDE.md: ${metadata.hasCLAUDEmd ? 'included' : 'not included'}\n`));
        } else {
          console.log(pc.yellow('  This archive has no metadata\n'));
        }
        return;
      }

      console.log(orange('\n  Importing config...\n'));

      const result = await importConfig(sourcePath, process.cwd(), options.force);

      console.log(pc.green('  ✓ Config imported!\n'));
      console.log(pc.dim(`  Files created: ${result.filesWritten}`));
      console.log(pc.dim(`  Agents: ${result.metadata.agents.join(', ') || 'none'}`));
      console.log(pc.dim(`  Skills: ${result.metadata.skills.join(', ') || 'none'}\n`));
    } catch (error) {
      console.log(pc.red('\n  ✗ Import failed\n'));
      console.log(pc.dim(`  ${error instanceof Error ? error.message : 'Unknown error'}\n`));
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
