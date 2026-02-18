/**
 * Blueprint matcher — scores blueprints against project goal and spec
 * Pure logic, no AI calls
 */

import { BLUEPRINTS } from './definitions.js';

import type { BlueprintMatch } from '../types/blueprint.js';
import type { ProjectGoal, ProjectSpec } from '../types/goal.js';

/**
 * Match blueprints against a project goal and optional spec.
 *
 * Scoring:
 * - Category match: +40 per matching category
 * - Keyword overlap: +5 per keyword found in goal description or spec fields
 * - Stack match: +15 per stack signal in spec.stack
 * - Focus match: +10 if blueprint aligns with spec.focus
 *
 * Returns top 3 matches with score > 20, sorted descending.
 */
export function matchBlueprints(goal: ProjectGoal, spec?: ProjectSpec): BlueprintMatch[] {
  const matches: BlueprintMatch[] = [];

  for (const blueprint of BLUEPRINTS) {
    let score = 0;
    const reasons: string[] = [];

    // Category match: +40 per matching category
    if (blueprint.categories.includes(goal.category)) {
      score += 40;
      reasons.push(`Matches your ${goal.category} project type`);
    }

    // Keyword overlap: +5 per keyword found in description or spec fields
    const searchText = buildSearchText(goal, spec);
    for (const keyword of blueprint.keywords) {
      if (searchText.includes(keyword)) {
        score += 5;
      }
    }
    const keywordHits = blueprint.keywords.filter(k => searchText.includes(k));
    if (keywordHits.length > 0) {
      reasons.push(`Keywords: ${keywordHits.slice(0, 3).join(', ')}`);
    }

    // Stack match: +15 per stack signal
    if (spec?.stack && blueprint.requiredStack.includes(spec.stack)) {
      score += 15;
      reasons.push(`Works with your ${spec.stack} stack`);
    }

    // Focus match: +10 if blueprint aligns with focus
    if (spec?.focus) {
      const focusMatch = checkFocusMatch(blueprint.id, spec.focus);
      if (focusMatch) {
        score += 10;
        reasons.push(`Aligns with ${spec.focus} focus`);
      }
    }

    if (score > 20) {
      matches.push({ blueprint, score, reasons });
    }
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function buildSearchText(goal: ProjectGoal, spec?: ProjectSpec): string {
  const parts = [goal.description.toLowerCase()];
  if (spec) {
    parts.push(spec.vision.toLowerCase());
    parts.push(spec.focus);
    parts.push(...spec.requirements);
  }
  return parts.join(' ');
}

function checkFocusMatch(blueprintId: string, focus: string): boolean {
  const focusMap: Record<string, string[]> = {
    'saas-dashboard': ['fullstack', 'frontend'],
    'landing-waitlist': ['frontend', 'fullstack'],
    'api-backend': ['backend', 'api'],
    'internal-tool': ['fullstack', 'frontend'],
    'marketplace': ['fullstack']
  };

  return (focusMap[blueprintId] || []).includes(focus);
}
