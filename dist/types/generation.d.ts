/**
 * Types for AI generation
 */
import type { ProjectGoal } from './goal.js';
import type { CodebaseAnalysis, SampledFile } from './codebase.js';
import type { AuthMethod } from '../utils/auth.js';
export interface GenerationContext {
    goal: ProjectGoal;
    codebase: CodebaseAnalysis;
    selectedAgents: string[];
    selectedSkills: string[];
    selectedModel: 'opus' | 'sonnet';
    authMethod: AuthMethod;
    apiKey?: string;
    sampledFiles: SampledFile[];
    verbose?: boolean;
    dryRun?: boolean;
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
    hooks: HookConfig[];
}
export interface SettingsJson {
    $schema?: string;
    version?: string;
    defaultAgent?: string;
    agents?: Record<string, {
        path: string;
    }> | string[];
    skills?: Record<string, {
        path: string;
    }> | string[];
    permissions?: {
        allow?: string[];
        deny?: string[];
    };
    hooks?: {
        UserPromptSubmit?: HookMatcher[];
        Stop?: HookMatcher[];
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
}
export interface WriteSummary {
    totalFiles: number;
    agents: string[];
    skills: string[];
    commands: string[];
    docs: string[];
    projectRoot: string;
    claudeDir: string;
}
//# sourceMappingURL=generation.d.ts.map