/**
 * Zod schemas for runtime validation at system boundaries
 */
import { z } from 'zod';
export declare const CacheEntryMetaSchema: z.ZodObject<{
    version: z.ZodString;
    hash: z.ZodString;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    version: string;
    hash: string;
    timestamp: string;
}, {
    version: string;
    hash: string;
    timestamp: string;
}>;
export declare const CodebaseAnalysisSchema: z.ZodObject<{
    projectRoot: z.ZodString;
    projectType: z.ZodString;
    language: z.ZodNullable<z.ZodString>;
    framework: z.ZodNullable<z.ZodString>;
    dependencies: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
        category: string;
    }, {
        name: string;
        version: string;
        category: string;
    }>, "many">;
    devDependencies: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
        category: string;
    }, {
        name: string;
        version: string;
        category: string;
    }>, "many">;
    totalFiles: z.ZodNumber;
    totalLines: z.ZodNumber;
    detectedPatterns: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        paths: z.ZodArray<z.ZodString, "many">;
        confidence: z.ZodNumber;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        paths: string[];
        confidence: number;
        description: string;
    }, {
        type: string;
        paths: string[];
        confidence: number;
        description: string;
    }>, "many">;
    analyzedAt: z.ZodString;
    analysisTimeMs: z.ZodNumber;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    projectRoot: z.ZodString;
    projectType: z.ZodString;
    language: z.ZodNullable<z.ZodString>;
    framework: z.ZodNullable<z.ZodString>;
    dependencies: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
        category: string;
    }, {
        name: string;
        version: string;
        category: string;
    }>, "many">;
    devDependencies: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
        category: string;
    }, {
        name: string;
        version: string;
        category: string;
    }>, "many">;
    totalFiles: z.ZodNumber;
    totalLines: z.ZodNumber;
    detectedPatterns: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        paths: z.ZodArray<z.ZodString, "many">;
        confidence: z.ZodNumber;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        paths: string[];
        confidence: number;
        description: string;
    }, {
        type: string;
        paths: string[];
        confidence: number;
        description: string;
    }>, "many">;
    analyzedAt: z.ZodString;
    analysisTimeMs: z.ZodNumber;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    projectRoot: z.ZodString;
    projectType: z.ZodString;
    language: z.ZodNullable<z.ZodString>;
    framework: z.ZodNullable<z.ZodString>;
    dependencies: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
        category: string;
    }, {
        name: string;
        version: string;
        category: string;
    }>, "many">;
    devDependencies: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
        category: string;
    }, {
        name: string;
        version: string;
        category: string;
    }>, "many">;
    totalFiles: z.ZodNumber;
    totalLines: z.ZodNumber;
    detectedPatterns: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        paths: z.ZodArray<z.ZodString, "many">;
        confidence: z.ZodNumber;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        paths: string[];
        confidence: number;
        description: string;
    }, {
        type: string;
        paths: string[];
        confidence: number;
        description: string;
    }>, "many">;
    analyzedAt: z.ZodString;
    analysisTimeMs: z.ZodNumber;
}, z.ZodTypeAny, "passthrough">>;
export declare const GenerationCacheMetaSchema: z.ZodObject<{
    version: z.ZodString;
    hash: z.ZodString;
    timestamp: z.ZodString;
} & {
    data: z.ZodNull;
}, "strip", z.ZodTypeAny, {
    version: string;
    hash: string;
    timestamp: string;
    data: null;
}, {
    version: string;
    hash: string;
    timestamp: string;
    data: null;
}>;
//# sourceMappingURL=index.d.ts.map