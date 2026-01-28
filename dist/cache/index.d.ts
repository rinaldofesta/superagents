/**
 * Cache management for SuperAgents
 * Caches codebase analysis and AI-generated responses
 */
import type { CodebaseAnalysis } from '../types/codebase.js';
export interface GenerationCacheKey {
    goalDescription: string;
    codebaseHash: string;
    itemType: 'agent' | 'skill' | 'claude-md';
    itemName: string;
    model: string;
}
export declare class CacheManager {
    private cacheDir;
    private readonly CODEBASE_CACHE_TTL;
    private readonly GENERATION_CACHE_TTL;
    constructor(customCacheDir?: string);
    /**
     * Initialize cache directory
     */
    init(): Promise<void>;
    /**
     * Get cache directory path
     */
    getCacheDir(): string;
    /**
     * Generate a hash representing the current state of a codebase
     *
     * Hash strategy: Lock files (package.json, tsconfig.json) + directory structure.
     * We hash structure (filenames) not content to keep hash stable across minor edits.
     * This avoids cache invalidation on trivial changes like adding a comment.
     *
     * Based on key configuration files and directory structure
     */
    getCodebaseHash(projectRoot: string): Promise<string>;
    /**
     * Recursively get list of files in a directory
     */
    private getFileList;
    /**
     * Get cached codebase analysis if available and valid
     */
    getCachedAnalysis(projectRoot: string): Promise<CodebaseAnalysis | null>;
    /**
     * Save codebase analysis to cache
     */
    setCachedAnalysis(projectRoot: string, analysis: CodebaseAnalysis): Promise<void>;
    /**
     * Generate hash for a generation cache key
     */
    getGenerationHash(key: GenerationCacheKey): string;
    /**
     * Get cached generation result if available
     */
    getCachedGeneration(key: GenerationCacheKey): Promise<string | null>;
    /**
     * Save generation result to cache
     */
    setCachedGeneration(key: GenerationCacheKey, content: string): Promise<void>;
    /**
     * Clear all cached data
     */
    clearCache(): Promise<void>;
    /**
     * Get cache statistics
     */
    getStats(): Promise<{
        analysisCount: number;
        generationCount: number;
        totalSize: number;
    }>;
}
export declare const cache: CacheManager;
//# sourceMappingURL=index.d.ts.map