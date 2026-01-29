/**
 * Types for AI generation
 */

import type { ProjectGoal } from './goal.js';
import type { CodebaseAnalysis, SampledFile } from './codebase.js';
import type { AuthMethod } from '../utils/auth.js';

export interface GenerationContext {
  // User's vision
  goal: ProjectGoal;

  // Current state
  codebase: CodebaseAnalysis;

  // Selections
  selectedAgents: string[];
  selectedSkills: string[];
  selectedModel: 'opus' | 'sonnet';

  // Authentication
  authMethod: AuthMethod;
  apiKey?: string;  // Only for 'api-key' method

  // Sampled files for context
  sampledFiles: SampledFile[];

  // CLI options
  verbose?: boolean;  // Show detailed output
  dryRun?: boolean;   // Preview without API calls

  // Metadata
  generatedAt: string;
}

export interface AgentOutput {
  filename: string;
  content: string;
  agentName: string;
}

export interface SkillOutput {
  filename: string;
  content: string;
  skillName: string;
}

export interface HookOutput {
  filename: string;
  content: string;
  hookName: string;
}

export interface SettingsJson {
  $schema?: string;
  version?: string;
  defaultAgent?: string;
  agents?: Record<string, { path: string }> | string[];
  skills?: Record<string, { path: string }> | string[];
  hooks?: {
    userPromptSubmit?: string[];
  };
  model?: string;
  generatedAt?: string;
}

export interface GeneratedOutputs {
  claudeMd: string;
  agents: AgentOutput[];
  skills: SkillOutput[];
  hooks: HookOutput[];
  settings: SettingsJson;
}

export interface WriteSummary {
  totalFiles: number;
  agents: string[];
  skills: string[];
  projectRoot: string;
  claudeDir: string;
}
