/**
 * Differ — compares two CodebaseAnalysis snapshots and returns deltas
 */

import type { CodebaseAnalysis } from '../types/codebase.js';
import type { EvolveDelta } from '../types/evolve.js';

export function diffAnalyses(before: CodebaseAnalysis, after: CodebaseAnalysis): EvolveDelta[] {
  const deltas: EvolveDelta[] = [];

  // Dependencies (compare .name arrays)
  const beforeDeps = before.dependencies.map(d => d.name).sort();
  const afterDeps = after.dependencies.map(d => d.name).sort();
  const addedDeps = afterDeps.filter(d => !beforeDeps.includes(d));
  const removedDeps = beforeDeps.filter(d => !afterDeps.includes(d));

  if (addedDeps.length > 0 || removedDeps.length > 0) {
    deltas.push({
      field: 'dependencies',
      label: 'Dependencies',
      before: removedDeps.length > 0 ? removedDeps.join(', ') : '(none)',
      after: addedDeps.length > 0 ? addedDeps.join(', ') : '(none)',
    });
  }

  // Dev dependencies (compare .name arrays)
  const beforeDevDeps = before.devDependencies.map(d => d.name).sort();
  const afterDevDeps = after.devDependencies.map(d => d.name).sort();
  const addedDevDeps = afterDevDeps.filter(d => !beforeDevDeps.includes(d));
  const removedDevDeps = beforeDevDeps.filter(d => !afterDevDeps.includes(d));

  if (addedDevDeps.length > 0 || removedDevDeps.length > 0) {
    deltas.push({
      field: 'devDependencies',
      label: 'Dev Dependencies',
      before: removedDevDeps.length > 0 ? removedDevDeps.join(', ') : '(none)',
      after: addedDevDeps.length > 0 ? addedDevDeps.join(', ') : '(none)',
    });
  }

  // Detected patterns (compare .type arrays)
  const beforePatterns = before.detectedPatterns.map(p => p.type).sort();
  const afterPatterns = after.detectedPatterns.map(p => p.type).sort();
  const newPatterns = afterPatterns.filter(p => !beforePatterns.includes(p));

  if (newPatterns.length > 0) {
    deltas.push({
      field: 'detectedPatterns',
      label: 'Detected Patterns',
      before: '(none new)',
      after: newPatterns.join(', '),
    });
  }

  // Framework (direct equality)
  if (before.framework !== after.framework) {
    deltas.push({
      field: 'framework',
      label: 'Framework',
      before: before.framework || 'none',
      after: after.framework || 'none',
    });
  }

  // Negative constraints (compare .rule arrays)
  const beforeRules = before.negativeConstraints.map(c => c.rule).sort();
  const afterRules = after.negativeConstraints.map(c => c.rule).sort();
  const addedRules = afterRules.filter(r => !beforeRules.includes(r));
  const removedRules = beforeRules.filter(r => !afterRules.includes(r));

  if (addedRules.length > 0 || removedRules.length > 0) {
    deltas.push({
      field: 'negativeConstraints',
      label: 'Constraints',
      before: removedRules.length > 0 ? removedRules.join('; ') : '(none)',
      after: addedRules.length > 0 ? addedRules.join('; ') : '(none)',
    });
  }

  // Commands (direct equality)
  const commandFields = ['lintCommand', 'testCommand', 'buildCommand', 'devCommand'] as const;

  for (const field of commandFields) {
    if (before[field] !== after[field]) {
      deltas.push({
        field,
        label: field.replace('Command', ' command'),
        before: before[field] || '(none)',
        after: after[field] || '(none)',
      });
    }
  }

  return deltas;
}
