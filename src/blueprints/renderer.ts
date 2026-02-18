/**
 * ROADMAP.md renderer — generates clean parseable markdown from a blueprint
 */

import type { BlueprintDefinition } from '../types/blueprint.js';
import type { GenerationContext } from '../types/generation.js';

/**
 * Render a ROADMAP.md from a blueprint definition.
 *
 * Format uses `## Phase N:` headers and `- [ ]`/`- [x]` task markers
 * so the status command can parse progress.
 */
export function renderRoadmap(blueprint: BlueprintDefinition, _context: GenerationContext): string {
  const lines: string[] = [];

  lines.push(`# ${blueprint.name} Roadmap`);
  lines.push('');

  blueprint.phases.forEach((phase, index) => {
    lines.push(`## Phase ${index + 1}: ${phase.name}`);
    lines.push(phase.description);
    lines.push('');

    for (const task of phase.tasks) {
      lines.push(`- [ ] ${task.title}`);
      lines.push(`  ${task.description}`);
    }

    lines.push('');
  });

  return lines.join('\n').trimEnd() + '\n';
}
