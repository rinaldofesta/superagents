import { describe, it, expect } from 'vitest';
import { proposeChanges } from '../../../src/evolve/proposer.js';
import type { CodebaseAnalysis } from '../../../src/types/codebase.js';
import type { EvolveDelta } from '../../../src/types/evolve.js';

function makeAnalysis(): CodebaseAnalysis {
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
  };
}

describe('proposeChanges', () => {
  it('returns empty array for empty deltas', () => {
    const proposals = proposeChanges([], makeAnalysis(), [], []);
    expect(proposals).toEqual([]);
  });

  it('proposes add-skill for new known dependency', () => {
    const deltas: EvolveDelta[] = [
      { field: 'dependencies', label: 'Dependencies', before: '(none)', after: 'prisma' },
    ];
    const proposals = proposeChanges(deltas, makeAnalysis(), [], []);
    expect(proposals).toHaveLength(1);
    expect(proposals[0].type).toBe('add-skill');
    expect(proposals[0].name).toBe('prisma');
  });

  it('does not propose skill if already exists', () => {
    const deltas: EvolveDelta[] = [
      { field: 'dependencies', label: 'Dependencies', before: '(none)', after: 'prisma' },
    ];
    const proposals = proposeChanges(deltas, makeAnalysis(), [], ['prisma']);
    expect(proposals).toHaveLength(0);
  });

  it('proposes remove-skill for removed dependency', () => {
    const deltas: EvolveDelta[] = [
      { field: 'dependencies', label: 'Dependencies', before: 'prisma', after: '(none)' },
    ];
    const proposals = proposeChanges(deltas, makeAnalysis(), [], ['prisma']);
    expect(proposals).toHaveLength(1);
    expect(proposals[0].type).toBe('remove-skill');
    expect(proposals[0].name).toBe('prisma');
  });

  it('proposes add-agent for new pattern', () => {
    const deltas: EvolveDelta[] = [
      { field: 'detectedPatterns', label: 'Detected Patterns', before: '(none new)', after: 'api-routes' },
    ];
    const proposals = proposeChanges(deltas, makeAnalysis(), [], []);
    expect(proposals).toHaveLength(1);
    expect(proposals[0].type).toBe('add-agent');
    expect(proposals[0].name).toBe('backend-engineer');
  });

  it('does not propose agent if already exists', () => {
    const deltas: EvolveDelta[] = [
      { field: 'detectedPatterns', label: 'Detected Patterns', before: '(none new)', after: 'api-routes' },
    ];
    const proposals = proposeChanges(deltas, makeAnalysis(), ['backend-engineer'], []);
    expect(proposals).toHaveLength(0);
  });

  it('proposes update-claude-md for framework change', () => {
    const deltas: EvolveDelta[] = [
      { field: 'framework', label: 'Framework', before: 'none', after: 'nextjs' },
    ];
    const proposals = proposeChanges(deltas, makeAnalysis(), [], []);
    expect(proposals).toHaveLength(1);
    expect(proposals[0].type).toBe('update-claude-md');
  });

  it('proposes update-claude-md for command change', () => {
    const deltas: EvolveDelta[] = [
      { field: 'testCommand', label: 'test command', before: 'npm test', after: 'vitest' },
    ];
    const proposals = proposeChanges(deltas, makeAnalysis(), [], []);
    expect(proposals).toHaveLength(1);
    expect(proposals[0].type).toBe('update-claude-md');
  });

  it('deduplicates update-claude-md proposals', () => {
    const deltas: EvolveDelta[] = [
      { field: 'framework', label: 'Framework', before: 'none', after: 'nextjs' },
      { field: 'testCommand', label: 'test command', before: 'npm test', after: 'vitest' },
      { field: 'buildCommand', label: 'build command', before: '(none)', after: 'next build' },
    ];
    const proposals = proposeChanges(deltas, makeAnalysis(), [], []);
    const claudeMdProposals = proposals.filter(p => p.type === 'update-claude-md');
    expect(claudeMdProposals).toHaveLength(1);
  });

  it('handles multiple dependency additions', () => {
    const deltas: EvolveDelta[] = [
      { field: 'dependencies', label: 'Dependencies', before: '(none)', after: 'prisma, tailwindcss' },
    ];
    const proposals = proposeChanges(deltas, makeAnalysis(), [], []);
    expect(proposals).toHaveLength(2);
    expect(proposals.map(p => p.name).sort()).toEqual(['prisma', 'tailwind']);
  });

  it('ignores unknown dependencies', () => {
    const deltas: EvolveDelta[] = [
      { field: 'dependencies', label: 'Dependencies', before: '(none)', after: 'some-unknown-lib' },
    ];
    const proposals = proposeChanges(deltas, makeAnalysis(), [], []);
    expect(proposals).toHaveLength(0);
  });

  it('handles dev dependency additions', () => {
    const deltas: EvolveDelta[] = [
      { field: 'devDependencies', label: 'Dev Dependencies', before: '(none)', after: 'vitest' },
    ];
    const proposals = proposeChanges(deltas, makeAnalysis(), [], []);
    expect(proposals).toHaveLength(1);
    expect(proposals[0].type).toBe('add-skill');
    expect(proposals[0].name).toBe('vitest');
  });
});
