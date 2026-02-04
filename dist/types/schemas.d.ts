/**
 * Zod validation schemas for runtime validation
 * Provides type-safe validation at system boundaries
 */
import { z } from 'zod';
export declare const GoalCategorySchema: z.ZodEnum<["saas-dashboard", "ecommerce", "content-platform", "api-service", "mobile-app", "cli-tool", "data-pipeline", "auth-service", "custom"]>;
export declare const TechCategorySchema: z.ZodEnum<["frontend", "backend", "database", "auth", "payments", "deployment"]>;
export declare const PrioritySchema: z.ZodEnum<["required", "recommended", "optional"]>;
export declare const TechRequirementSchema: z.ZodObject<{
    category: z.ZodEnum<["frontend", "backend", "database", "auth", "payments", "deployment"]>;
    description: z.ZodString;
    priority: z.ZodEnum<["required", "recommended", "optional"]>;
    suggestedTechnologies: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    description: string;
    category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
    priority: "required" | "recommended" | "optional";
    suggestedTechnologies: string[];
}, {
    description: string;
    category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
    priority: "required" | "recommended" | "optional";
    suggestedTechnologies: string[];
}>;
export declare const AgentSuggestionSchema: z.ZodObject<{
    name: z.ZodString;
    reason: z.ZodString;
    priority: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    priority: number;
    reason: string;
}, {
    name: string;
    priority: number;
    reason: string;
}>;
export declare const SkillSuggestionSchema: z.ZodObject<{
    name: z.ZodString;
    reason: z.ZodString;
    priority: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    priority: number;
    reason: string;
}, {
    name: string;
    priority: number;
    reason: string;
}>;
export declare const ProjectGoalSchema: z.ZodObject<{
    description: z.ZodString;
    category: z.ZodEnum<["saas-dashboard", "ecommerce", "content-platform", "api-service", "mobile-app", "cli-tool", "data-pipeline", "auth-service", "custom"]>;
    technicalRequirements: z.ZodArray<z.ZodObject<{
        category: z.ZodEnum<["frontend", "backend", "database", "auth", "payments", "deployment"]>;
        description: z.ZodString;
        priority: z.ZodEnum<["required", "recommended", "optional"]>;
        suggestedTechnologies: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        description: string;
        category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
        priority: "required" | "recommended" | "optional";
        suggestedTechnologies: string[];
    }, {
        description: string;
        category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
        priority: "required" | "recommended" | "optional";
        suggestedTechnologies: string[];
    }>, "many">;
    suggestedAgents: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        reason: z.ZodString;
        priority: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        priority: number;
        reason: string;
    }, {
        name: string;
        priority: number;
        reason: string;
    }>, "many">;
    suggestedSkills: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        reason: z.ZodString;
        priority: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        priority: number;
        reason: string;
    }, {
        name: string;
        priority: number;
        reason: string;
    }>, "many">;
    timestamp: z.ZodString;
    confidence: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    suggestedSkills: {
        name: string;
        priority: number;
        reason: string;
    }[];
    suggestedAgents: {
        name: string;
        priority: number;
        reason: string;
    }[];
    description: string;
    category: "saas-dashboard" | "ecommerce" | "content-platform" | "api-service" | "mobile-app" | "cli-tool" | "data-pipeline" | "auth-service" | "custom";
    technicalRequirements: {
        description: string;
        category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
        priority: "required" | "recommended" | "optional";
        suggestedTechnologies: string[];
    }[];
    timestamp: string;
    confidence: number;
}, {
    suggestedSkills: {
        name: string;
        priority: number;
        reason: string;
    }[];
    suggestedAgents: {
        name: string;
        priority: number;
        reason: string;
    }[];
    description: string;
    category: "saas-dashboard" | "ecommerce" | "content-platform" | "api-service" | "mobile-app" | "cli-tool" | "data-pipeline" | "auth-service" | "custom";
    technicalRequirements: {
        description: string;
        category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
        priority: "required" | "recommended" | "optional";
        suggestedTechnologies: string[];
    }[];
    timestamp: string;
    confidence: number;
}>;
export declare const ProjectTypeSchema: z.ZodEnum<["nextjs", "react", "vue", "angular", "svelte", "node", "python", "go", "rust", "java", "csharp", "php", "ruby", "unknown"]>;
export declare const ProgrammingLanguageSchema: z.ZodEnum<["typescript", "javascript", "python", "go", "rust", "java", "csharp", "php", "ruby"]>;
export declare const FrameworkSchema: z.ZodNullable<z.ZodEnum<["nextjs", "nuxtjs", "react", "vue", "angular", "svelte", "express", "fastify", "nestjs", "django", "fastapi", "flask", "gin", "fiber", "actix", "rocket", "spring", "laravel", "rails"]>>;
export declare const DependencyCategorySchema: z.ZodEnum<["framework", "ui", "database", "orm", "auth", "payments", "testing", "build", "other"]>;
export declare const DependencySchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    category: z.ZodEnum<["framework", "ui", "database", "orm", "auth", "payments", "testing", "build", "other"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    version: string;
    category: "framework" | "ui" | "database" | "orm" | "auth" | "payments" | "testing" | "build" | "other";
}, {
    name: string;
    version: string;
    category: "framework" | "ui" | "database" | "orm" | "auth" | "payments" | "testing" | "build" | "other";
}>;
export declare const PatternTypeSchema: z.ZodEnum<["api-routes", "server-actions", "components", "services", "models", "controllers", "middleware", "hooks", "utils", "tests"]>;
export declare const PatternSchema: z.ZodObject<{
    type: z.ZodEnum<["api-routes", "server-actions", "components", "services", "models", "controllers", "middleware", "hooks", "utils", "tests"]>;
    paths: z.ZodArray<z.ZodString, "many">;
    confidence: z.ZodNumber;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    type: "api-routes" | "server-actions" | "components" | "services" | "models" | "controllers" | "middleware" | "hooks" | "utils" | "tests";
    confidence: number;
    paths: string[];
}, {
    description: string;
    type: "api-routes" | "server-actions" | "components" | "services" | "models" | "controllers" | "middleware" | "hooks" | "utils" | "tests";
    confidence: number;
    paths: string[];
}>;
export declare const SampledFileSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodString;
    purpose: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    path: string;
    purpose: string;
}, {
    content: string;
    path: string;
    purpose: string;
}>;
export declare const AuthMethodSchema: z.ZodEnum<["api-key", "claude-plan"]>;
export declare const ModelSelectionSchema: z.ZodEnum<["opus", "sonnet"]>;
export declare const GenerationContextSchema: z.ZodEffects<z.ZodObject<{
    goal: z.ZodObject<{
        description: z.ZodString;
        category: z.ZodEnum<["saas-dashboard", "ecommerce", "content-platform", "api-service", "mobile-app", "cli-tool", "data-pipeline", "auth-service", "custom"]>;
        technicalRequirements: z.ZodArray<z.ZodObject<{
            category: z.ZodEnum<["frontend", "backend", "database", "auth", "payments", "deployment"]>;
            description: z.ZodString;
            priority: z.ZodEnum<["required", "recommended", "optional"]>;
            suggestedTechnologies: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            description: string;
            category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
            priority: "required" | "recommended" | "optional";
            suggestedTechnologies: string[];
        }, {
            description: string;
            category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
            priority: "required" | "recommended" | "optional";
            suggestedTechnologies: string[];
        }>, "many">;
        suggestedAgents: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            reason: z.ZodString;
            priority: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            priority: number;
            reason: string;
        }, {
            name: string;
            priority: number;
            reason: string;
        }>, "many">;
        suggestedSkills: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            reason: z.ZodString;
            priority: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            priority: number;
            reason: string;
        }, {
            name: string;
            priority: number;
            reason: string;
        }>, "many">;
        timestamp: z.ZodString;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        suggestedSkills: {
            name: string;
            priority: number;
            reason: string;
        }[];
        suggestedAgents: {
            name: string;
            priority: number;
            reason: string;
        }[];
        description: string;
        category: "saas-dashboard" | "ecommerce" | "content-platform" | "api-service" | "mobile-app" | "cli-tool" | "data-pipeline" | "auth-service" | "custom";
        technicalRequirements: {
            description: string;
            category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
            priority: "required" | "recommended" | "optional";
            suggestedTechnologies: string[];
        }[];
        timestamp: string;
        confidence: number;
    }, {
        suggestedSkills: {
            name: string;
            priority: number;
            reason: string;
        }[];
        suggestedAgents: {
            name: string;
            priority: number;
            reason: string;
        }[];
        description: string;
        category: "saas-dashboard" | "ecommerce" | "content-platform" | "api-service" | "mobile-app" | "cli-tool" | "data-pipeline" | "auth-service" | "custom";
        technicalRequirements: {
            description: string;
            category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
            priority: "required" | "recommended" | "optional";
            suggestedTechnologies: string[];
        }[];
        timestamp: string;
        confidence: number;
    }>;
    selectedAgents: z.ZodArray<z.ZodString, "many">;
    selectedSkills: z.ZodArray<z.ZodString, "many">;
    selectedModel: z.ZodEnum<["opus", "sonnet"]>;
    authMethod: z.ZodEnum<["api-key", "claude-plan"]>;
    apiKey: z.ZodOptional<z.ZodString>;
    sampledFiles: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        content: z.ZodString;
        purpose: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
        path: string;
        purpose: string;
    }, {
        content: string;
        path: string;
        purpose: string;
    }>, "many">;
    verbose: z.ZodOptional<z.ZodBoolean>;
    dryRun: z.ZodOptional<z.ZodBoolean>;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sampledFiles: {
        content: string;
        path: string;
        purpose: string;
    }[];
    goal: {
        suggestedSkills: {
            name: string;
            priority: number;
            reason: string;
        }[];
        suggestedAgents: {
            name: string;
            priority: number;
            reason: string;
        }[];
        description: string;
        category: "saas-dashboard" | "ecommerce" | "content-platform" | "api-service" | "mobile-app" | "cli-tool" | "data-pipeline" | "auth-service" | "custom";
        technicalRequirements: {
            description: string;
            category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
            priority: "required" | "recommended" | "optional";
            suggestedTechnologies: string[];
        }[];
        timestamp: string;
        confidence: number;
    };
    generatedAt: string;
    selectedAgents: string[];
    selectedSkills: string[];
    selectedModel: "opus" | "sonnet";
    authMethod: "claude-plan" | "api-key";
    apiKey?: string | undefined;
    verbose?: boolean | undefined;
    dryRun?: boolean | undefined;
}, {
    sampledFiles: {
        content: string;
        path: string;
        purpose: string;
    }[];
    goal: {
        suggestedSkills: {
            name: string;
            priority: number;
            reason: string;
        }[];
        suggestedAgents: {
            name: string;
            priority: number;
            reason: string;
        }[];
        description: string;
        category: "saas-dashboard" | "ecommerce" | "content-platform" | "api-service" | "mobile-app" | "cli-tool" | "data-pipeline" | "auth-service" | "custom";
        technicalRequirements: {
            description: string;
            category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
            priority: "required" | "recommended" | "optional";
            suggestedTechnologies: string[];
        }[];
        timestamp: string;
        confidence: number;
    };
    generatedAt: string;
    selectedAgents: string[];
    selectedSkills: string[];
    selectedModel: "opus" | "sonnet";
    authMethod: "claude-plan" | "api-key";
    apiKey?: string | undefined;
    verbose?: boolean | undefined;
    dryRun?: boolean | undefined;
}>, {
    sampledFiles: {
        content: string;
        path: string;
        purpose: string;
    }[];
    goal: {
        suggestedSkills: {
            name: string;
            priority: number;
            reason: string;
        }[];
        suggestedAgents: {
            name: string;
            priority: number;
            reason: string;
        }[];
        description: string;
        category: "saas-dashboard" | "ecommerce" | "content-platform" | "api-service" | "mobile-app" | "cli-tool" | "data-pipeline" | "auth-service" | "custom";
        technicalRequirements: {
            description: string;
            category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
            priority: "required" | "recommended" | "optional";
            suggestedTechnologies: string[];
        }[];
        timestamp: string;
        confidence: number;
    };
    generatedAt: string;
    selectedAgents: string[];
    selectedSkills: string[];
    selectedModel: "opus" | "sonnet";
    authMethod: "claude-plan" | "api-key";
    apiKey?: string | undefined;
    verbose?: boolean | undefined;
    dryRun?: boolean | undefined;
}, {
    sampledFiles: {
        content: string;
        path: string;
        purpose: string;
    }[];
    goal: {
        suggestedSkills: {
            name: string;
            priority: number;
            reason: string;
        }[];
        suggestedAgents: {
            name: string;
            priority: number;
            reason: string;
        }[];
        description: string;
        category: "saas-dashboard" | "ecommerce" | "content-platform" | "api-service" | "mobile-app" | "cli-tool" | "data-pipeline" | "auth-service" | "custom";
        technicalRequirements: {
            description: string;
            category: "database" | "auth" | "payments" | "frontend" | "backend" | "deployment";
            priority: "required" | "recommended" | "optional";
            suggestedTechnologies: string[];
        }[];
        timestamp: string;
        confidence: number;
    };
    generatedAt: string;
    selectedAgents: string[];
    selectedSkills: string[];
    selectedModel: "opus" | "sonnet";
    authMethod: "claude-plan" | "api-key";
    apiKey?: string | undefined;
    verbose?: boolean | undefined;
    dryRun?: boolean | undefined;
}>;
export declare const AgentOutputSchema: z.ZodObject<{
    filename: z.ZodString;
    content: z.ZodString;
    agentName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    filename: string;
    agentName: string;
}, {
    content: string;
    filename: string;
    agentName: string;
}>;
export declare const SkillOutputSchema: z.ZodObject<{
    filename: z.ZodString;
    content: z.ZodString;
    skillName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    filename: string;
    skillName: string;
}, {
    content: string;
    filename: string;
    skillName: string;
}>;
export declare const HookOutputSchema: z.ZodObject<{
    filename: z.ZodString;
    content: z.ZodString;
    hookName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    filename: string;
    hookName: string;
}, {
    content: string;
    filename: string;
    hookName: string;
}>;
export declare const GeneratedOutputsSchema: z.ZodObject<{
    claudeMd: z.ZodString;
    agents: z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        content: z.ZodString;
        agentName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
        filename: string;
        agentName: string;
    }, {
        content: string;
        filename: string;
        agentName: string;
    }>, "many">;
    skills: z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        content: z.ZodString;
        skillName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
        filename: string;
        skillName: string;
    }, {
        content: string;
        filename: string;
        skillName: string;
    }>, "many">;
    hooks: z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        content: z.ZodString;
        hookName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
        filename: string;
        hookName: string;
    }, {
        content: string;
        filename: string;
        hookName: string;
    }>, "many">;
    settings: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    hooks: {
        content: string;
        filename: string;
        hookName: string;
    }[];
    agents: {
        content: string;
        filename: string;
        agentName: string;
    }[];
    skills: {
        content: string;
        filename: string;
        skillName: string;
    }[];
    claudeMd: string;
    settings: Record<string, unknown>;
}, {
    hooks: {
        content: string;
        filename: string;
        hookName: string;
    }[];
    agents: {
        content: string;
        filename: string;
        agentName: string;
    }[];
    skills: {
        content: string;
        filename: string;
        skillName: string;
    }[];
    claudeMd: string;
    settings: Record<string, unknown>;
}>;
export declare const GenerationCacheKeySchema: z.ZodObject<{
    goalDescription: z.ZodString;
    codebaseHash: z.ZodString;
    itemType: z.ZodEnum<["agent", "skill", "claude-md"]>;
    itemName: z.ZodString;
    model: z.ZodString;
}, "strip", z.ZodTypeAny, {
    model: string;
    goalDescription: string;
    codebaseHash: string;
    itemType: "agent" | "skill" | "claude-md";
    itemName: string;
}, {
    model: string;
    goalDescription: string;
    codebaseHash: string;
    itemType: "agent" | "skill" | "claude-md";
    itemName: string;
}>;
export declare const CLIOptionsSchema: z.ZodObject<{
    dryRun: z.ZodOptional<z.ZodBoolean>;
    verbose: z.ZodOptional<z.ZodBoolean>;
    update: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    update?: boolean | undefined;
    verbose?: boolean | undefined;
    dryRun?: boolean | undefined;
}, {
    update?: boolean | undefined;
    verbose?: boolean | undefined;
    dryRun?: boolean | undefined;
}>;
export declare const UpdateOptionsSchema: z.ZodObject<{
    agentsToAdd: z.ZodArray<z.ZodString, "many">;
    agentsToRemove: z.ZodArray<z.ZodString, "many">;
    skillsToAdd: z.ZodArray<z.ZodString, "many">;
    skillsToRemove: z.ZodArray<z.ZodString, "many">;
    regenerateClaudeMd: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    agentsToAdd: string[];
    agentsToRemove: string[];
    skillsToAdd: string[];
    skillsToRemove: string[];
    regenerateClaudeMd: boolean;
}, {
    agentsToAdd: string[];
    agentsToRemove: string[];
    skillsToAdd: string[];
    skillsToRemove: string[];
    regenerateClaudeMd: boolean;
}>;
export type ValidatedProjectGoal = z.infer<typeof ProjectGoalSchema>;
export type ValidatedGenerationContext = z.infer<typeof GenerationContextSchema>;
export type ValidatedGeneratedOutputs = z.infer<typeof GeneratedOutputsSchema>;
export type ValidatedCacheKey = z.infer<typeof GenerationCacheKeySchema>;
export type ValidatedCLIOptions = z.infer<typeof CLIOptionsSchema>;
export type ValidatedUpdateOptions = z.infer<typeof UpdateOptionsSchema>;
/**
 * Validate generation context before starting generation
 * Throws ZodError with detailed messages on validation failure
 */
export declare function validateGenerationContext(context: unknown): ValidatedGenerationContext;
/**
 * Safely validate generation context, returning result object
 */
export declare function safeValidateGenerationContext(context: unknown): z.SafeParseReturnType<unknown, ValidatedGenerationContext>;
/**
 * Validate project goal
 */
export declare function validateProjectGoal(goal: unknown): ValidatedProjectGoal;
/**
 * Validate CLI options
 */
export declare function validateCLIOptions(options: unknown): ValidatedCLIOptions;
/**
 * Format Zod validation errors into user-friendly messages
 */
export declare function formatValidationErrors(error: z.ZodError): string;
//# sourceMappingURL=schemas.d.ts.map