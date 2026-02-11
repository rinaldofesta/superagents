/**
 * Zod schemas for runtime validation at system boundaries
 */
import { z } from 'zod';
// Schema for cache metadata (wraps cached data)
export const CacheEntryMetaSchema = z.object({
    version: z.string(),
    hash: z.string(),
    timestamp: z.string(),
});
// Schema for CodebaseAnalysis (validate key fields, not every nested detail)
export const CodebaseAnalysisSchema = z.object({
    projectRoot: z.string(),
    projectType: z.string(),
    language: z.string().nullable(),
    framework: z.string().nullable(),
    dependencies: z.array(z.object({
        name: z.string(),
        version: z.string(),
        category: z.string(),
    })),
    devDependencies: z.array(z.object({
        name: z.string(),
        version: z.string(),
        category: z.string(),
    })),
    totalFiles: z.number(),
    totalLines: z.number(),
    detectedPatterns: z.array(z.object({
        type: z.string(),
        paths: z.array(z.string()),
        confidence: z.number(),
        description: z.string(),
    })),
    analyzedAt: z.string(),
    analysisTimeMs: z.number(),
}).passthrough(); // Allow additional fields without failing
// Schema for generation cache metadata
export const GenerationCacheMetaSchema = CacheEntryMetaSchema.extend({
    data: z.null(),
});
// Schema for published blueprint metadata (validated at import boundary)
export const PublishedBlueprintMetaSchema = z.object({
    format: z.literal('superagents-blueprint'),
    formatVersion: z.number(),
    name: z.string(),
    author: z.string(),
    description: z.string(),
    version: z.string(),
    keywords: z.array(z.string()),
    stack: z.array(z.string()),
    phases: z.array(z.object({
        name: z.string(),
        description: z.string(),
        tasks: z.array(z.object({
            title: z.string(),
            description: z.string(),
        })),
    })),
    agents: z.array(z.string()),
    skills: z.array(z.string()),
    publishedAt: z.string(),
});
//# sourceMappingURL=index.js.map