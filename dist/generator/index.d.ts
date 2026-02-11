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
    private anthropicClient;
    constructor();
    /**
     * Get or create a shared Anthropic client instance.
     * Lazily initialized on first API call to avoid requiring an API key
     * when using Claude CLI auth.
     */
    private getClient;
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
    /**
     * Build settings.json with permissions, deny lists, and optional lint/format hook
     */
    private buildSettings;
    /**
     * Generate architecture doc from detected patterns, deps, file structure
     */
    private generateArchitectureDoc;
    /**
     * Generate patterns doc with sampled file references
     */
    private generatePatternsDoc;
    /**
     * Generate setup doc with MCP suggestions, commands, onboarding
     */
    private generateSetupDoc;
    /**
     * Fallback CLAUDE.md - lean, ~700 tokens, ~50 instructions
     */
    private generateClaudeMd;
    /**
     * Generate slash commands from detected project commands
     */
    private generateSlashCommands;
    /**
     * Execute a prompt using the appropriate auth method
     * @param generationType - Type of generation for max_tokens scaling
     */
    private executePrompt;
}
//# sourceMappingURL=index.d.ts.map