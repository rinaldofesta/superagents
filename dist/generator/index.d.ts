/**
 * AI Generator - generates agents, skills, and CLAUDE.md using Claude AI
 *
 * Features:
 * - Parallel generation with concurrency limit
 * - Tiered model selection for cost optimization
 * - Verbose logging support
 */
import type { GenerationContext, GeneratedOutputs } from '../types/generation.js';
export declare class AIGenerator {
    private codebaseHash;
    constructor();
    generateAll(context: GenerationContext): Promise<GeneratedOutputs>;
    /**
     * Generate an agent using Claude AI (with caching)
     */
    private generateAgent;
    /**
     * Generate a skill using Claude AI (with caching)
     */
    private generateSkill;
    /**
     * Generate CLAUDE.md using Claude AI (with caching)
     */
    private generateClaudeMdWithAI;
    /**
     * Build comprehensive prompt for agent generation
     */
    private buildAgentPrompt;
    /**
     * Build comprehensive prompt for skill generation
     */
    private buildSkillPrompt;
    /**
     * Build prompt for CLAUDE.md generation
     */
    private buildClaudeMdPrompt;
    private generatePlaceholderAgent;
    private generatePlaceholderSkill;
    private generateSkillLoaderHook;
    private generateClaudeMd;
    /**
     * Execute a prompt using the appropriate auth method
     */
    private executePrompt;
}
//# sourceMappingURL=index.d.ts.map