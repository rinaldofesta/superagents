/**
 * Cache management for SuperAgents
 * Caches codebase analysis and AI-generated responses
 */

// Node.js built-ins
import crypto from 'crypto';
import os from 'os';
import path from 'path';

// External packages
import fs from 'fs-extra';

// Internal modules
import { log } from '../utils/logger.js';
import { CacheEntryMetaSchema, CodebaseAnalysisSchema, GenerationCacheMetaSchema } from '../schemas/index.js';

// Type imports
import type { CodebaseAnalysis } from '../types/codebase.js';

const CACHE_DIR = path.join(os.homedir(), '.superagents', 'cache');
const CACHE_VERSION = '1'; // Increment when cache format changes

interface CacheEntry<T> {
  version: string;
  hash: string;
  timestamp: string;
  data: T;
}

export interface GenerationCacheKey {
  goalDescription: string;
  codebaseHash: string;
  itemType: 'agent' | 'skill' | 'claude-md';
  itemName: string;
  model: string;
}

export class CacheManager {
  private cacheDir: string;

  // TTL constants - centralized for easy modification
  private readonly CODEBASE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly GENERATION_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor(customCacheDir?: string) {
    this.cacheDir = customCacheDir || CACHE_DIR;
  }

  /**
   * Initialize cache directory
   */
  async init(): Promise<void> {
    await fs.ensureDir(this.cacheDir);
    log.debug(`Cache directory: ${this.cacheDir}`);
  }

  /**
   * Get cache directory path
   */
  getCacheDir(): string {
    return this.cacheDir;
  }

  // ============================================================
  // CODEBASE CACHE
  // ============================================================

  /**
   * Generate a hash representing the current state of a codebase
   *
   * Hash strategy: Lock files (package.json, tsconfig.json) + directory structure.
   * We hash structure (filenames) not content to keep hash stable across minor edits.
   * This avoids cache invalidation on trivial changes like adding a comment.
   *
   * Based on key configuration files and directory structure
   */
  async getCodebaseHash(projectRoot: string): Promise<string> {
    const filesToHash = [
      'package.json',
      'tsconfig.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'requirements.txt',
      'pyproject.toml',
      'go.mod',
      'Cargo.toml',
    ];

    // Hash key configuration files in parallel
    const hashPromises = filesToHash.map(async (file) => {
      const filePath = path.join(projectRoot, file);
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');
        log.debug(`Hashed ${file}`);
        return crypto.createHash('md5').update(content).digest('hex');
      }
      return null;
    });

    const hashResults = await Promise.all(hashPromises);
    const hashes: string[] = hashResults.filter((h): h is string => h !== null);

    // Hash the src directory structure (not content, just file names)
    const srcDir = path.join(projectRoot, 'src');
    if (await fs.pathExists(srcDir)) {
      const files = await this.getFileList(srcDir);
      hashes.push(crypto.createHash('md5').update(files.join('\n')).digest('hex'));
      log.debug(`Hashed ${files.length} files in src/`);
    }

    // Also check app directory (Next.js App Router)
    const appDir = path.join(projectRoot, 'app');
    if (await fs.pathExists(appDir)) {
      const files = await this.getFileList(appDir);
      hashes.push(crypto.createHash('md5').update(files.join('\n')).digest('hex'));
      log.debug(`Hashed ${files.length} files in app/`);
    }

    const finalHash = crypto.createHash('md5').update(hashes.join('-')).digest('hex');
    log.debug(`Codebase hash: ${finalHash}`);
    return finalHash;
  }

  /**
   * Recursively get list of files in a directory
   */
  private async getFileList(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip hidden files, node_modules, and common build directories
      if (
        entry.name.startsWith('.') ||
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === 'build' ||
        entry.name === '.next' ||
        entry.name === '__pycache__'
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...(await this.getFileList(fullPath)));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }

    return files.sort();
  }

  /**
   * Get cached codebase analysis if available and valid
   */
  async getCachedAnalysis(projectRoot: string): Promise<CodebaseAnalysis | null> {
    // Validate input to prevent cryptic errors
    if (!projectRoot || projectRoot.trim() === '') {
      throw new Error('projectRoot cannot be empty');
    }

    if (!path.isAbsolute(projectRoot)) {
      throw new Error(`projectRoot must be absolute path, got: ${projectRoot}`);
    }

    const hash = await this.getCodebaseHash(projectRoot);
    const cacheFile = path.join(this.cacheDir, `analysis-${hash}.json`);

    if (await fs.pathExists(cacheFile)) {
      try {
        const raw = await fs.readJson(cacheFile);

        // Validate cache structure
        const metaResult = CacheEntryMetaSchema.safeParse(raw);
        if (!metaResult.success) {
          log.debug('Cache validation failed (metadata)');
          return null;
        }

        const dataResult = CodebaseAnalysisSchema.safeParse(raw.data);
        if (!dataResult.success) {
          log.debug('Cache validation failed (analysis data)');
          return null;
        }

        const entry = raw as CacheEntry<CodebaseAnalysis>;

        // Check version compatibility
        if (entry.version !== CACHE_VERSION) {
          log.debug('Cache version mismatch, invalidating');
          return null;
        }

        // Check if cache is too old (24 hours)
        const age = Date.now() - new Date(entry.timestamp).getTime();

        if (age > this.CODEBASE_CACHE_TTL) {
          log.debug('Cache expired (>24 hours), invalidating');
          return null;
        }

        log.debug(`Using cached analysis (${Math.round(age / 1000 / 60)} minutes old)`);
        return entry.data;
      } catch (error) {
        log.debug(`Cache read error: ${error}`);
        return null;
      }
    }

    log.debug('No cached analysis found');
    return null;
  }

  /**
   * Save codebase analysis to cache
   */
  async setCachedAnalysis(projectRoot: string, analysis: CodebaseAnalysis): Promise<void> {
    const hash = await this.getCodebaseHash(projectRoot);
    const cacheFile = path.join(this.cacheDir, `analysis-${hash}.json`);

    const entry: CacheEntry<CodebaseAnalysis> = {
      version: CACHE_VERSION,
      hash,
      timestamp: new Date().toISOString(),
      data: analysis,
    };

    await fs.writeJson(cacheFile, entry, { spaces: 2 });
    log.debug(`Cached codebase analysis: ${cacheFile}`);
  }

  // ============================================================
  // GENERATION CACHE
  // ============================================================

  /**
   * Generate hash for a generation cache key
   */
  getGenerationHash(key: GenerationCacheKey): string {
    const str = JSON.stringify(key);
    return crypto.createHash('md5').update(str).digest('hex');
  }

  /**
   * Get cached generation result if available
   */
  async getCachedGeneration(key: GenerationCacheKey): Promise<string | null> {
    const hash = this.getGenerationHash(key);
    const cacheFile = path.join(this.cacheDir, `gen-${hash}.txt`);
    const metaFile = path.join(this.cacheDir, `gen-${hash}.meta.json`);

    if ((await fs.pathExists(cacheFile)) && (await fs.pathExists(metaFile))) {
      try {
        const raw = await fs.readJson(metaFile);

        // Validate cache metadata
        const metaResult = GenerationCacheMetaSchema.safeParse(raw);
        if (!metaResult.success) {
          log.debug('Generation cache validation failed');
          return null;
        }

        const entry = raw as CacheEntry<null>;

        // Check version compatibility
        if (entry.version !== CACHE_VERSION) {
          log.debug('Generation cache version mismatch');
          return null;
        }

        // Generation cache lasts 7 days
        const age = Date.now() - new Date(entry.timestamp).getTime();

        if (age > this.GENERATION_CACHE_TTL) {
          log.debug('Generation cache expired (>7 days)');
          return null;
        }

        const content = await fs.readFile(cacheFile, 'utf-8');
        log.debug(`Using cached ${key.itemType}: ${key.itemName}`);
        return content;
      } catch (error) {
        log.debug(`Generation cache read error: ${error}`);
        return null;
      }
    }

    return null;
  }

  /**
   * Save generation result to cache
   */
  async setCachedGeneration(key: GenerationCacheKey, content: string): Promise<void> {
    const hash = this.getGenerationHash(key);
    const cacheFile = path.join(this.cacheDir, `gen-${hash}.txt`);
    const metaFile = path.join(this.cacheDir, `gen-${hash}.meta.json`);

    const entry: CacheEntry<null> = {
      version: CACHE_VERSION,
      hash,
      timestamp: new Date().toISOString(),
      data: null,
    };

    await fs.writeFile(cacheFile, content, 'utf-8');
    await fs.writeJson(metaFile, entry, { spaces: 2 });
    log.debug(`Cached ${key.itemType}: ${key.itemName}`);
  }

  // ============================================================
  // CACHE MANAGEMENT
  // ============================================================

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await fs.emptyDir(this.cacheDir);
    log.debug('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    analysisCount: number;
    generationCount: number;
    totalSize: number;
  }> {
    if (!(await fs.pathExists(this.cacheDir))) {
      return { analysisCount: 0, generationCount: 0, totalSize: 0 };
    }

    const files = await fs.readdir(this.cacheDir);
    let totalSize = 0;
    let analysisCount = 0;
    let generationCount = 0;

    for (const file of files) {
      const filePath = path.join(this.cacheDir, file);
      const stat = await fs.stat(filePath);
      totalSize += stat.size;

      if (file.startsWith('analysis-')) {
        analysisCount++;
      } else if (file.startsWith('gen-') && file.endsWith('.txt')) {
        generationCount++;
      }
    }

    return { analysisCount, generationCount, totalSize };
  }
}

// Singleton instance
export const cache = new CacheManager();
