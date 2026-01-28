/**
 * Tiered model selection for cost optimization
 *
 * Uses cheaper/faster models for simpler tasks:
 * - Haiku: Simple skills, hooks
 * - Sonnet: Agents, complex skills
 * - Opus: CLAUDE.md (only if user selected Opus)
 */
export type ModelTier = 'haiku' | 'sonnet' | 'opus';
export type GenerationType = 'agent' | 'skill' | 'hook' | 'claude-md';
export declare const MODEL_IDS: {
    readonly haiku: "claude-3-5-haiku-20241022";
    readonly sonnet: "claude-sonnet-4-5-20250929";
    readonly opus: "claude-opus-4-5-20251101";
};
export declare const MODEL_COSTS: {
    readonly haiku: {
        readonly input: 0.25;
        readonly output: 1.25;
    };
    readonly sonnet: {
        readonly input: 3;
        readonly output: 15;
    };
    readonly opus: {
        readonly input: 15;
        readonly output: 75;
    };
};
interface ModelSelectionOptions {
    userSelectedModel: 'sonnet' | 'opus';
    generationType: GenerationType;
    complexity?: 'simple' | 'medium' | 'complex';
}
/**
 * Select the appropriate model based on task type and complexity
 *
 * Tiering strategy:
 * - Haiku: Simple tasks (hooks, basic skills) - 80% cost reduction vs Sonnet
 * - Sonnet: Complex tasks (agents, advanced skills) - baseline
 * - Opus: Only when user explicitly selects it for CLAUDE.md
 * Never exceed user's selected tier to respect budget constraints.
 */
export declare function selectModel(options: ModelSelectionOptions): string;
/**
 * Get the tier name from a model ID
 */
export declare function getModelTier(modelId: string): ModelTier;
/**
 * Determine skill complexity based on name
 */
export declare function getSkillComplexity(skillName: string): 'simple' | 'medium' | 'complex';
/**
 * Get a human-readable model name
 */
export declare function getModelDisplayName(modelId: string): string;
export {};
//# sourceMappingURL=model-selector.d.ts.map