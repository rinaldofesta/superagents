/**
 * Types for configuration and library definitions
 */

import type { GoalCategory } from './goal.js';

export interface AgentDefinition {
  name: string;
  category: 'engineering' | 'quality' | 'documentation' | 'operations' | 'security' | 'optimization';
  description: string;
  recommendedFor: GoalCategory[] | ['*'];
  defaultTools: string[];
  defaultSkills: string[];
}

export interface SkillDefinition {
  category: 'framework' | 'language' | 'database' | 'orm' | 'styling' | 'auth' | 'payments' | 'testing' | 'devops' | 'other';
  description: string;
  autoDetect: {
    packageNames?: string[];
    configFiles?: string[];
    filePatterns?: string[];
    envVars?: string[];
  };
  relatedSkills: string[];
}

export interface AgentScore {
  name: string;
  score: number; // 0-100
  reasons: string[];
}

export interface SkillScore {
  name: string;
  score: number; // 0-100
  reasons: string[];
}

export interface Recommendations {
  agents: AgentScore[];
  skills: SkillScore[];
  defaultAgents: string[]; // Pre-selected (high score)
  defaultSkills: string[]; // Pre-selected (high score)
  agentSkillLinks: Record<string, string[]>; // Agent name → auto-linked skill names
}
