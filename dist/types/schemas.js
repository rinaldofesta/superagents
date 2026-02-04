/**
 * Zod validation schemas for runtime validation
 * Provides type-safe validation at system boundaries
 */
import { z } from 'zod';
// ============================================================
// GOAL SCHEMAS
// ============================================================
export const GoalCategorySchema = z.enum([
    'saas-dashboard',
    'ecommerce',
    'content-platform',
    'api-service',
    'mobile-app',
    'cli-tool',
    'data-pipeline',
    'auth-service',
    'custom'
]);
export const TechCategorySchema = z.enum([
    'frontend',
    'backend',
    'database',
    'auth',
    'payments',
    'deployment'
]);
export const PrioritySchema = z.enum(['required', 'recommended', 'optional']);
export const TechRequirementSchema = z.object({
    category: TechCategorySchema,
    description: z.string().min(1, 'Description is required'),
    priority: PrioritySchema,
    suggestedTechnologies: z.array(z.string())
});
export const AgentSuggestionSchema = z.object({
    name: z.string().min(1, 'Agent name is required'),
    reason: z.string(),
    priority: z.number().min(1).max(10)
});
export const SkillSuggestionSchema = z.object({
    name: z.string().min(1, 'Skill name is required'),
    reason: z.string(),
    priority: z.number().min(1).max(10)
});
export const ProjectGoalSchema = z.object({
    description: z.string().min(10, 'Goal must be at least 10 characters'),
    category: GoalCategorySchema,
    technicalRequirements: z.array(TechRequirementSchema),
    suggestedAgents: z.array(AgentSuggestionSchema),
    suggestedSkills: z.array(SkillSuggestionSchema),
    timestamp: z.string().datetime({ message: 'Invalid timestamp format' }),
    confidence: z.number().min(0).max(1)
});
// ============================================================
// CODEBASE SCHEMAS
// ============================================================
export const ProjectTypeSchema = z.enum([
    'nextjs',
    'react',
    'vue',
    'angular',
    'svelte',
    'node',
    'python',
    'go',
    'rust',
    'java',
    'csharp',
    'php',
    'ruby',
    'unknown'
]);
export const ProgrammingLanguageSchema = z.enum([
    'typescript',
    'javascript',
    'python',
    'go',
    'rust',
    'java',
    'csharp',
    'php',
    'ruby'
]);
export const FrameworkSchema = z.enum([
    'nextjs',
    'nuxtjs',
    'react',
    'vue',
    'angular',
    'svelte',
    'express',
    'fastify',
    'nestjs',
    'django',
    'fastapi',
    'flask',
    'gin',
    'fiber',
    'actix',
    'rocket',
    'spring',
    'laravel',
    'rails'
]).nullable();
export const DependencyCategorySchema = z.enum([
    'framework',
    'ui',
    'database',
    'orm',
    'auth',
    'payments',
    'testing',
    'build',
    'other'
]);
export const DependencySchema = z.object({
    name: z.string().min(1),
    version: z.string(),
    category: DependencyCategorySchema
});
export const PatternTypeSchema = z.enum([
    'api-routes',
    'server-actions',
    'components',
    'services',
    'models',
    'controllers',
    'middleware',
    'hooks',
    'utils',
    'tests'
]);
export const PatternSchema = z.object({
    type: PatternTypeSchema,
    paths: z.array(z.string()),
    confidence: z.number().min(0).max(1),
    description: z.string()
});
export const SampledFileSchema = z.object({
    path: z.string().min(1),
    content: z.string(),
    purpose: z.string()
});
// ============================================================
// GENERATION SCHEMAS
// ============================================================
export const AuthMethodSchema = z.enum(['api-key', 'claude-plan']);
export const ModelSelectionSchema = z.enum(['opus', 'sonnet']);
export const GenerationContextSchema = z.object({
    goal: ProjectGoalSchema,
    selectedAgents: z.array(z.string()).min(1, 'At least one agent is required'),
    selectedSkills: z.array(z.string()),
    selectedModel: ModelSelectionSchema,
    authMethod: AuthMethodSchema,
    apiKey: z.string().optional(),
    sampledFiles: z.array(SampledFileSchema),
    verbose: z.boolean().optional(),
    dryRun: z.boolean().optional(),
    generatedAt: z.string().datetime({ message: 'Invalid timestamp format' })
}).refine((data) => data.authMethod !== 'api-key' || data.apiKey, { message: 'API key is required when using api-key auth method' });
export const AgentOutputSchema = z.object({
    filename: z.string().endsWith('.md', 'Agent filename must end with .md'),
    content: z.string().min(1, 'Agent content cannot be empty'),
    agentName: z.string().min(1)
});
export const SkillOutputSchema = z.object({
    filename: z.string().endsWith('.md', 'Skill filename must end with .md'),
    content: z.string().min(1, 'Skill content cannot be empty'),
    skillName: z.string().min(1)
});
export const HookOutputSchema = z.object({
    filename: z.string().min(1),
    content: z.string().min(1),
    hookName: z.string().min(1)
});
export const GeneratedOutputsSchema = z.object({
    claudeMd: z.string().min(1, 'CLAUDE.md content is required'),
    agents: z.array(AgentOutputSchema),
    skills: z.array(SkillOutputSchema),
    hooks: z.array(HookOutputSchema),
    settings: z.record(z.unknown())
});
// ============================================================
// CACHE SCHEMAS
// ============================================================
export const GenerationCacheKeySchema = z.object({
    goalDescription: z.string().min(1),
    codebaseHash: z.string().length(32, 'Hash must be 32 characters (MD5)'),
    itemType: z.enum(['agent', 'skill', 'claude-md']),
    itemName: z.string().min(1),
    model: z.string().min(1)
});
// ============================================================
// CLI OPTIONS SCHEMAS
// ============================================================
export const CLIOptionsSchema = z.object({
    dryRun: z.boolean().optional(),
    verbose: z.boolean().optional(),
    update: z.boolean().optional()
});
// ============================================================
// CONFIG UPDATE SCHEMAS
// ============================================================
export const UpdateOptionsSchema = z.object({
    agentsToAdd: z.array(z.string()),
    agentsToRemove: z.array(z.string()),
    skillsToAdd: z.array(z.string()),
    skillsToRemove: z.array(z.string()),
    regenerateClaudeMd: z.boolean()
});
// ============================================================
// VALIDATION HELPERS
// ============================================================
/**
 * Validate generation context before starting generation
 * Throws ZodError with detailed messages on validation failure
 */
export function validateGenerationContext(context) {
    return GenerationContextSchema.parse(context);
}
/**
 * Safely validate generation context, returning result object
 */
export function safeValidateGenerationContext(context) {
    return GenerationContextSchema.safeParse(context);
}
/**
 * Validate project goal
 */
export function validateProjectGoal(goal) {
    return ProjectGoalSchema.parse(goal);
}
/**
 * Validate CLI options
 */
export function validateCLIOptions(options) {
    return CLIOptionsSchema.parse(options);
}
/**
 * Format Zod validation errors into user-friendly messages
 */
export function formatValidationErrors(error) {
    return error.errors
        .map((e) => {
        const path = e.path.length > 0 ? `${e.path.join('.')}: ` : '';
        return `${path}${e.message}`;
    })
        .join('\n');
}
//# sourceMappingURL=schemas.js.map