/**
 * Status display — progress bars and summary using picocolors
 */

import pc from 'picocolors';

import type { ParsedPhase } from './parser.js';

/**
 * Display project status with progress bars.
 *
 * Shows per-phase progress and overall completion.
 */
export function displayStatus(phases: ParsedPhase[], buildOk: boolean): void {
  console.log('');
  console.log(pc.bold('  Project Status'));
  console.log('');

  let totalDone = 0;
  let totalTasks = 0;

  for (const phase of phases) {
    const done = phase.tasks.filter(t => t.done).length;
    const total = phase.tasks.length;
    totalDone += done;
    totalTasks += total;

    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const bar = renderBar(done, total, 10);
    const pctText = total > 0 ? ` (${pct}%)` : '';

    console.log(
      `  Phase ${phase.number}: ${pc.bold(phase.name)}  ${bar} ${done}/${total} tasks${pctText}`
    );
  }

  console.log('');

  const overallPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;
  console.log(
    pc.bold(`  Overall: `) +
    `${totalDone}/${totalTasks} tasks complete (${overallPct}%)`
  );

  const buildIcon = buildOk ? pc.green('\u2713') : pc.red('\u2717');
  const buildText = buildOk ? 'passing' : 'failing';
  console.log(pc.bold(`  Build: `) + `${buildIcon} ${buildText}`);
  console.log('');
}

function renderBar(done: number, total: number, width: number): string {
  if (total === 0) return pc.dim('\u2591'.repeat(width));
  const filled = Math.round((done / total) * width);
  const empty = width - filled;
  return pc.green('\u2588'.repeat(filled)) + pc.dim('\u2591'.repeat(empty));
}
