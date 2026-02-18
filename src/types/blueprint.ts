/**
 * Types for project blueprints — curated templates with phased roadmaps
 */

import type { GoalCategory } from './goal.js';

export type BlueprintId = 'saas-dashboard' | 'landing-waitlist' | 'api-backend' | 'internal-tool' | 'marketplace';

export interface BlueprintTask {
  title: string;
  description: string;
}

export interface BlueprintPhase {
  name: string;
  description: string;
  tasks: BlueprintTask[];
}

export interface BlueprintDefinition {
  id: BlueprintId;
  name: string;
  description: string;
  categories: GoalCategory[];
  keywords: string[];
  requiredStack: string[];
  phases: BlueprintPhase[];
}

export interface BlueprintMatch {
  blueprint: BlueprintDefinition;
  score: number;
  reasons: string[];
}
