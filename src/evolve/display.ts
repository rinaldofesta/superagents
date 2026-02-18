/**
 * Display functions for evolve command output
 */

import * as p from '@clack/prompts';
import pc from 'picocolors';

import { orange } from '../cli/colors.js';

import type { EvolveDelta, EvolveProposal } from '../types/evolve.js';

export function displayDeltas(deltas: EvolveDelta[]): void {
  const lines = deltas.map(d => {
    if (d.before === '(none)' || d.before === '(none new)') {
      return pc.green(`  + ${d.label}: ${d.after}`);
    }
    if (d.after === '(none)') {
      return pc.red(`  - ${d.label}: ${d.before}`);
    }
    return orange(`  ~ ${d.label}: ${d.before} → ${d.after}`);
  });

  p.note(lines.join('\n'), 'Changes detected');
}

export function displayProposals(proposals: EvolveProposal[]): void {
  const lines = proposals.map((prop, i) => {
    const prefix = `  ${i + 1}.`;
    const typeLabel = prop.type.replace('-', ' ');
    return `${prefix} [${typeLabel}] ${pc.bold(prop.name)} — ${pc.dim(prop.reason)}`;
  });

  p.note(lines.join('\n'), 'Proposed changes');
}
