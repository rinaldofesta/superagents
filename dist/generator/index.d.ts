/**
 * AI Generator - generates agents, skills, and CLAUDE.md using Claude AI
 */
import type { GenerationContext, GeneratedOutputs } from '../types/generation.js';
export declare class AIGenerator {
    constructor();
    generateAll(context: GenerationContext): Promise<GeneratedOutputs>;
    /**
     * Generate an agent using Claude AI
     */
    private generateAgent;
    /**
     * Generate a skill using Claude AI
     */
    private generateSkill;
    /**
     * Generate CLAUDE.md using Claude AI
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