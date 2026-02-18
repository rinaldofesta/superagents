/**
 * Types for AI generation
 */

import type { BlueprintId } from './blueprint.js';
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

  // Blueprint
  selectedBlueprint?: BlueprintId;

  // Quality gates
  qualityGate?: 'hard' | 'soft' | 'off';
  securityGate?: boolean;

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

export interface HookConfig {
  type: 'command';
  command: string;
}

export interface HookMatcher {
  matcher?: string;
  hooks: HookConfig[];
}

export interface SettingsJson {
  $schema?: string;
  version?: string;
  defaultAgent?: string;
  agents?: Record<string, { path: string }> | string[];
  skills?: Record<string, { path: string }> | string[];
  permissions?: {
    allow?: string[];
    deny?: string[];
  };
  hooks?: {
    UserPromptSubmit?: HookMatcher[];
    Stop?: HookMatcher[];
    PreToolUse?: HookMatcher[];
  };
  model?: string;
}

export interface DocOutput {
  filename: string;
  content: string;
  subfolder?: string;
}

export interface CommandOutput {
  filename: string;
  content: string;
  commandName: string;
}

export interface GeneratedOutputs {
  claudeMd: string;
  agents: AgentOutput[];
  skills: SkillOutput[];
  hooks: HookOutput[];
  commands: CommandOutput[];
  settings: SettingsJson;
  docs: DocOutput[];
  roadmapMd?: string;
}

export interface WriteSummary {
  totalFiles: number;
  agents: string[];
  skills: string[];
  commands: string[];
  docs: string[];
  hooks: string[];
  projectRoot: string;
  claudeDir: string;
  hasRoadmap: boolean;
}

export interface JsonModeOutput {
  success: true;
  mode: 'new' | 'existing';
  projectRoot: string;
  agents: string[];
  skills: string[];
  filesWritten: string[];
  warnings: string[];
}

export interface JsonModeError {
  success: false;
  error: string;
  code: string;
}
