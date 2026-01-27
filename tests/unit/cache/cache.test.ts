/**
 * Unit tests for the CacheManager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheManager } from '../../../src/cache/index.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  let testCacheDir: string;
  let testProjectDir: string;

  beforeEach(async () => {
    // Create temporary directories for testing
    testCacheDir = path.join(os.tmpdir(), `superagents-cache-test-${Date.now()}`);
    testProjectDir = path.join(os.tmpdir(), `superagents-project-test-${Date.now()}`);

    await fs.ensureDir(testCacheDir);
    await fs.ensureDir(testProjectDir);

    // Create test project files
    await fs.writeJson(path.join(testProjectDir, 'package.json'), {
      name: 'test-project',
      version: '1.0.0',
      dependencies: {
        'react': '^18.0.0',
        'next': '^14.0.0'
      }
    });

    await fs.writeJson(path.join(testProjectDir, 'tsconfig.json'), {
      compilerOptions: {
        strict: true
      }
    });

    // Create src directory with some files
    await fs.ensureDir(path.join(testProjectDir, 'src'));
    await fs.writeFile(path.join(testProjectDir, 'src', 'index.ts'), 'console.log("test");');
    await fs.writeFile(path.join(testProjectDir, 'src', 'utils.ts'), 'export function util() {}');

    cacheManager = new CacheManager(testCacheDir);
    await cacheManager.init();
  });

  afterEach(async () => {
    // Clean up test directories
    await fs.remove(testCacheDir);
    await fs.remove(testProjectDir);
  });

  describe('getCodebaseHash', () => {
    it('should generate a consistent hash for the same project', async () => {
      const hash1 = await cacheManager.getCodebaseHash(testProjectDir);
      const hash2 = await cacheManager.getCodebaseHash(testProjectDir);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(32); // MD5 hash length
    });

    it('should generate different hashes when files change', async () => {
      const hash1 = await cacheManager.getCodebaseHash(testProjectDir);

      // Modify package.json
      await fs.writeJson(path.join(testProjectDir, 'package.json'), {
        name: 'test-project',
        version: '2.0.0', // Changed version
        dependencies: {}
      });

      const hash2 = await cacheManager.getCodebaseHash(testProjectDir);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes when src files are added', async () => {
      const hash1 = await cacheManager.getCodebaseHash(testProjectDir);

      // Add a new file
      await fs.writeFile(path.join(testProjectDir, 'src', 'new-file.ts'), 'export const x = 1;');

      const hash2 = await cacheManager.getCodebaseHash(testProjectDir);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('codebase analysis caching', () => {
    const mockAnalysis = {
      projectRoot: '/test',
      projectType: 'nextjs' as const,
      language: 'typescript' as const,
      framework: 'Next.js',
      dependencies: [{ name: 'next', version: '14.0.0', category: 'framework' as const }],
      devDependencies: [],
      fileStructure: [],
      totalFiles: 10,
      totalLines: 500,
      detectedPatterns: [],
      suggestedSkills: ['nextjs', 'typescript'],
      suggestedAgents: ['frontend-engineer'],
      existingClaudeConfig: null,
      mcpServers: [],
      sampledFiles: [],
      analyzedAt: new Date().toISOString(),
      analysisTimeMs: 100
    };

    it('should cache and retrieve analysis', async () => {
      // Cache miss initially
      const initial = await cacheManager.getCachedAnalysis(testProjectDir);
      expect(initial).toBeNull();

      // Save to cache
      await cacheManager.setCachedAnalysis(testProjectDir, mockAnalysis);

      // Cache hit
      const cached = await cacheManager.getCachedAnalysis(testProjectDir);
      expect(cached).not.toBeNull();
      expect(cached?.projectType).toBe('nextjs');
      expect(cached?.framework).toBe('Next.js');
    });

    it('should invalidate cache when project changes', async () => {
      // Cache the analysis
      await cacheManager.setCachedAnalysis(testProjectDir, mockAnalysis);

      // Verify it's cached
      const cached1 = await cacheManager.getCachedAnalysis(testProjectDir);
      expect(cached1).not.toBeNull();

      // Modify the project
      await fs.writeJson(path.join(testProjectDir, 'package.json'), {
        name: 'test-project',
        version: '2.0.0', // Changed
        dependencies: {}
      });

      // Cache should miss (different hash)
      const cached2 = await cacheManager.getCachedAnalysis(testProjectDir);
      expect(cached2).toBeNull();
    });
  });

  describe('generation caching', () => {
    const cacheKey = {
      goalDescription: 'Test project goal',
      codebaseHash: 'abc123',
      itemType: 'agent' as const,
      itemName: 'test-agent',
      model: 'claude-sonnet-4-5-20250929'
    };

    const generatedContent = `---
name: test-agent
description: Test agent
---

# Test Agent

This is a test agent.`;

    it('should cache and retrieve generated content', async () => {
      // Cache miss initially
      const initial = await cacheManager.getCachedGeneration(cacheKey);
      expect(initial).toBeNull();

      // Save to cache
      await cacheManager.setCachedGeneration(cacheKey, generatedContent);

      // Cache hit
      const cached = await cacheManager.getCachedGeneration(cacheKey);
      expect(cached).toBe(generatedContent);
    });

    it('should differentiate between different cache keys', async () => {
      await cacheManager.setCachedGeneration(cacheKey, generatedContent);

      // Different item name
      const differentKey = { ...cacheKey, itemName: 'different-agent' };
      const cached = await cacheManager.getCachedGeneration(differentKey);
      expect(cached).toBeNull();
    });

    it('should differentiate between different models', async () => {
      await cacheManager.setCachedGeneration(cacheKey, generatedContent);

      // Different model
      const differentKey = { ...cacheKey, model: 'claude-3-5-haiku-20241022' };
      const cached = await cacheManager.getCachedGeneration(differentKey);
      expect(cached).toBeNull();
    });
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      // Add some data
      const cacheKey = {
        goalDescription: 'Test',
        codebaseHash: 'xyz',
        itemType: 'skill' as const,
        itemName: 'test-skill',
        model: 'test-model'
      };
      await cacheManager.setCachedGeneration(cacheKey, 'test content');

      // Verify it exists
      const stats1 = await cacheManager.getStats();
      expect(stats1.generationCount).toBeGreaterThan(0);

      // Clear cache
      await cacheManager.clearCache();

      // Verify it's empty
      const stats2 = await cacheManager.getStats();
      expect(stats2.generationCount).toBe(0);
      expect(stats2.analysisCount).toBe(0);
    });

    it('should return accurate stats', async () => {
      // Start fresh
      await cacheManager.clearCache();

      const initialStats = await cacheManager.getStats();
      expect(initialStats.analysisCount).toBe(0);
      expect(initialStats.generationCount).toBe(0);

      // Add analysis
      const mockAnalysis = {
        projectRoot: '/test',
        projectType: 'nextjs' as const,
        language: 'typescript' as const,
        framework: 'Next.js',
        dependencies: [],
        devDependencies: [],
        fileStructure: [],
        totalFiles: 0,
        totalLines: 0,
        detectedPatterns: [],
        suggestedSkills: [],
        suggestedAgents: [],
        existingClaudeConfig: null,
        mcpServers: [],
        sampledFiles: [],
        analyzedAt: new Date().toISOString(),
        analysisTimeMs: 0
      };
      await cacheManager.setCachedAnalysis(testProjectDir, mockAnalysis);

      // Add generations
      await cacheManager.setCachedGeneration(
        { goalDescription: 'Test', codebaseHash: 'a', itemType: 'agent', itemName: 'agent1', model: 'm1' },
        'content1'
      );
      await cacheManager.setCachedGeneration(
        { goalDescription: 'Test', codebaseHash: 'a', itemType: 'skill', itemName: 'skill1', model: 'm1' },
        'content2'
      );

      const finalStats = await cacheManager.getStats();
      expect(finalStats.analysisCount).toBe(1);
      expect(finalStats.generationCount).toBe(2);
      expect(finalStats.totalSize).toBeGreaterThan(0);
    });
  });
});
