/**
 * Generation pipeline orchestration
 *
 * Manages the main generation flow from project analysis through output writing.
 * Called by the CLI after authentication and banner display.
 */
import type { AuthResult } from './utils/auth.js';
import type { CodebaseAnalysis } from './types/codebase.js';
import type { WriteSummary } from './types/generation.js';
import type { ProjectMode } from './types/goal.js';
export interface PipelineOptions {
    projectRoot: string;
    isDryRun: boolean;
    isVerbose: boolean;
    auth: AuthResult;
}
export interface PipelineResult {
    summary: WriteSummary;
    codebaseAnalysis: CodebaseAnalysis;
    projectMode: ProjectMode;
}
/**
 * Run the main generation pipeline.
 *
 * Orchestrates: mode detection -> goal collection -> model selection ->
 * codebase analysis -> recommendations -> confirmation -> generation -> writing.
 *
 * Returns a PipelineResult on success, or undefined if dry-run mode.
 * Throws on failure (caller handles error display).
 */
export declare function runGenerationPipeline(options: PipelineOptions): Promise<PipelineResult | undefined>;
//# sourceMappingURL=pipeline.d.ts.map