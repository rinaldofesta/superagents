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
     * Generate an agent using local template or Claude AI (with caching)
     * Priority: 1. Cache, 2. Local template, 3. API
     */
    private generateAgent;
    /**
     * Generate a skill using local template or Claude AI (with caching)
     * Priority: 1. Cache, 2. Local template, 3. API
     */
    private generateSkill;
    /**
     * Generate CLAUDE.md using Claude AI (with caching)
     */
    private generateClaudeMdWithAI;
    /**
     * Build compressed prompt for agent generation
     * Uses centralized templates for consistency and reduced token usage
     */
    private buildAgentPrompt;
    /**
     * Build compressed prompt for skill generation
     * Uses centralized templates for consistency and reduced token usage
     */
    private buildSkillPrompt;
    /**
     * Build compressed prompt for CLAUDE.md generation
     * Uses centralized templates for consistency and reduced token usage
     */
    private buildClaudeMdPrompt;
    private generatePlaceholderAgent;
    private generatePlaceholderSkill;
    private generateContextLoaderHook;
    private generateClaudeMd;
    /**
     * Execute a prompt using the appropriate auth method
     * @param generationType - Type of generation for max_tokens scaling
     */
    private executePrompt;
}
//# sourceMappingURL=index.d.ts.map