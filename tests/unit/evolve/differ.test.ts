import { describe, it, expect } from 'vitest';
import { diffAnalyses } from '../../../src/evolve/differ.js';
import type { CodebaseAnalysis } from '../../../src/types/codebase.js';

function makeAnalysis(overrides: Partial<CodebaseAnalysis> = {}): CodebaseAnalysis {
  return {
    projectRoot: '/test',
    projectType: 'node',
    language: 'typescript',
    framework: null,
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
    monorepo: null,
    sampledFiles: [],
    packageManager: 'npm',
    lintCommand: null,
    formatCommand: null,
    testCommand: null,
    devCommand: null,
    buildCommand: null,
    hasEnvFile: false,
    negativeConstraints: [],
    mcpSuggestions: [],
    analyzedAt: new Date().toISOString(),
    analysisTimeMs: 100,
    ...overrides,
  };
}

describe('diffAnalyses', () => {
  it('returns empty array when nothing changed', () => {
    const a = makeAnalysis();
    const b = makeAnalysis();
    expect(diffAnalyses(a, b)).toEqual([]);
  });

  it('detects added dependencies', () => {
    const before = makeAnalysis({ dependencies: [] });
    const after = makeAnalysis({
      dependencies: [{ name: 'prisma', version: '5.0.0', category: 'orm' }],
    });
    const deltas = diffAnalyses(before, after);
    expect(deltas).toHaveLength(1);
    expect(deltas[0].field).toBe('dependencies');
    expect(deltas[0].after).toBe('prisma');
  });

  it('detects removed dependencies', () => {
    const before = makeAnalysis({
      dependencies: [{ name: 'express', version: '4.0.0', category: 'framework' }],
    });
    const after = makeAnalysis({ dependencies: [] });
    const deltas = diffAnalyses(before, after);
    expect(deltas).toHaveLength(1);
    expect(deltas[0].field).toBe('dependencies');
    expect(deltas[0].before).toBe('express');
  });

  it('detects added dev dependencies', () => {
    const before = makeAnalysis({ devDependencies: [] });
    const after = makeAnalysis({
      devDependencies: [{ name: 'vitest', version: '1.0.0', category: 'testing' }],
    });
    const deltas = diffAnalyses(before, after);
    expect(deltas).toHaveLength(1);
    expect(deltas[0].field).toBe('devDependencies');
    expect(deltas[0].after).toBe('vitest');
  });

  it('detects new patterns', () => {
    const before = makeAnalysis({ detectedPatterns: [] });
    const after = makeAnalysis({
      detectedPatterns: [
        { type: 'api-routes', paths: ['/src/api'], confidence: 0.9, description: 'API routes' },
      ],
    });
    const deltas = diffAnalyses(before, after);
    expect(deltas).toHaveLength(1);
    expect(deltas[0].field).toBe('detectedPatterns');
    expect(deltas[0].after).toBe('api-routes');
  });

  it('detects framework change', () => {
    const before = makeAnalysis({ framework: null });
    const after = makeAnalysis({ framework: 'nextjs' });
    const deltas = diffAnalyses(before, after);
    expect(deltas).toHaveLength(1);
    expect(deltas[0].field).toBe('framework');
    expect(deltas[0].before).toBe('none');
    expect(deltas[0].after).toBe('nextjs');
  });

  it('detects command changes', () => {
    const before = makeAnalysis({ testCommand: 'npm test' });
    const after = makeAnalysis({ testCommand: 'vitest' });
    const deltas = diffAnalyses(before, after);
    expect(deltas).toHaveLength(1);
    expect(deltas[0].field).toBe('testCommand');
    expect(deltas[0].before).toBe('npm test');
    expect(deltas[0].after).toBe('vitest');
  });

  it('detects negative constraint changes', () => {
    const before = makeAnalysis({ negativeConstraints: [] });
    const after = makeAnalysis({
      negativeConstraints: [
        { technology: 'Prisma', alternative: 'Drizzle', rule: 'Use Prisma, NOT Drizzle' },
      ],
    });
    const deltas = diffAnalyses(before, after);
    expect(deltas).toHaveLength(1);
    expect(deltas[0].field).toBe('negativeConstraints');
  });

  it('detects multiple changes at once', () => {
    const before = makeAnalysis({
      framework: null,
      testCommand: null,
    });
    const after = makeAnalysis({
      framework: 'nextjs',
      testCommand: 'vitest',
      dependencies: [{ name: 'next', version: '14.0.0', category: 'framework' }],
    });
    const deltas = diffAnalyses(before, after);
    expect(deltas.length).toBeGreaterThanOrEqual(3);
  });
});
