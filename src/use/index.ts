/**
 * Use command — install a published blueprint from a local file or URL
 */

// External packages
import * as p from '@clack/prompts';
import pc from 'picocolors';

// Internal modules
import { installBlueprint } from './installer.js';
import { parseSource, resolveToLocalPath } from './resolver.js';

export async function runUse(
  source: string,
  projectRoot: string,
  options: { force?: boolean; preview?: boolean }
): Promise<void> {
  const blueprintSource = parseSource(source);

  const spinner = p.spinner();
  spinner.start(
    blueprintSource.type === 'url'
      ? 'Downloading blueprint...'
      : 'Loading blueprint...'
  );

  const zipPath = await resolveToLocalPath(blueprintSource);

  if (options.preview) {
    spinner.message('Reading blueprint metadata...');
    const { meta } = await installBlueprint(zipPath, projectRoot, { preview: true });

    spinner.stop(pc.green('✓') + ' Blueprint loaded');

    console.log(pc.bold('\n  Blueprint Preview\n'));
    console.log(pc.dim(`  Name: ${meta.name}`));
    console.log(pc.dim(`  Author: ${meta.author}`));
    console.log(pc.dim(`  Version: ${meta.version}`));
    console.log(pc.dim(`  Description: ${meta.description}`));
    console.log(pc.dim(`  Phases: ${meta.phases.length}`));
    console.log(pc.dim(`  Agents: ${meta.agents.join(', ') || 'none'}`));
    console.log(pc.dim(`  Skills: ${meta.skills.join(', ') || 'none'}`));
    console.log(pc.dim(`  Stack: ${meta.stack.slice(0, 10).join(', ')}${meta.stack.length > 10 ? '...' : ''}`));
    console.log('');
    return;
  }

  spinner.message('Installing blueprint...');

  const { meta, filesWritten } = await installBlueprint(zipPath, projectRoot, {
    force: options.force,
  });

  spinner.stop(pc.green('✓') + ' Blueprint installed');

  console.log(pc.green('\n  ✓ Blueprint applied!\n'));
  console.log(pc.dim(`  Name: ${meta.name} v${meta.version}`));
  console.log(pc.dim(`  Author: ${meta.author}`));
  console.log(pc.dim(`  Phases: ${meta.phases.length}`));
  console.log(pc.dim(`  Agents: ${meta.agents.join(', ') || 'none'}`));
  console.log(pc.dim(`  Skills: ${meta.skills.join(', ') || 'none'}`));
  console.log(pc.dim(`  Files written: ${filesWritten}`));
  console.log('');
  console.log(pc.dim('  Run `superagents status` to see the roadmap.'));
  console.log('');
}
