/**
 * Unit tests for the recommendation engine
 */

import { describe, it, expect } from 'vitest';
import { RecommendationEngine } from '../../../src/context/recommendation-engine.js';

import type { CodebaseAnalysis } from '../../../src/types/codebase.js';
import type { ProjectGoal } from '../../../src/types/goal.js';

function makeGoal(overrides: Partial<ProjectGoal> = {}): ProjectGoal {
  return {
    description: 'Build a SaaS dashboard',
    category: 'saas-dashboard',
    technicalRequirements: [],
    suggestedAgents: [],
    suggestedSkills: [],
    timestamp: new Date().toISOString(),
    confidence: 1.0,
    ...overrides,
  };
}

function makeCodebase(overrides: Partial<CodebaseAnalysis> = {}): CodebaseAnalysis {
  return {
    projectRoot: '/test',
    projectType: 'node',
    language: 'typescript',
    framework: null,
    dependencies: [],
    devDependencies: [],
    fileStructure: [],
    totalFiles: 10,
    totalLines: 500,
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

describe('RecommendationEngine', () => {
  const engine = new RecommendationEngine();

  it('should return agents and skills for a goal category', () => {
    const result = engine.recommend(makeGoal(), makeCodebase());

    expect(result.agents.length).toBeGreaterThan(0);
    expect(result.skills.length).toBeGreaterThan(0);
    expect(result.defaultAgents).toBeDefined();
    expect(result.defaultSkills).toBeDefined();
  });

  it('should boost scores for technologies mentioned in goal description', () => {
    const result = engine.recommend(
      makeGoal({ description: 'Build a React dashboard with Prisma' }),
      makeCodebase()
    );

    const reactSkill = result.skills.find(s => s.name === 'react');
    expect(reactSkill).toBeDefined();
    expect(reactSkill!.reasons).toContain('Mentioned in your goal');

    const prismaSkill = result.skills.find(s => s.name === 'prisma');
    expect(prismaSkill).toBeDefined();
    expect(prismaSkill!.reasons).toContain('Mentioned in your goal');
  });

  it('should boost agents for explicit requirements', () => {
    const result = engine.recommend(
      makeGoal({ requirements: ['auth', 'payments'] }),
      makeCodebase()
    );

    const securityAgent = result.agents.find(a => a.name === 'security-analyst');
    expect(securityAgent).toBeDefined();
    expect(securityAgent!.score).toBeGreaterThanOrEqual(70);
  });

  it('should boost scores for codebase-detected agents and skills', () => {
    const result = engine.recommend(
      makeGoal(),
      makeCodebase({
        suggestedAgents: ['database-specialist'],
        suggestedSkills: ['prisma'],
      })
    );

    const dbAgent = result.agents.find(a => a.name === 'database-specialist');
    expect(dbAgent).toBeDefined();
    expect(dbAgent!.reasons).toContain('Detected in your codebase');
  });

  it('should cap default agents at 3', () => {
    const result = engine.recommend(makeGoal(), makeCodebase());
    expect(result.defaultAgents.length).toBeLessThanOrEqual(3);
  });

  it('should suppress overlapping agents from defaults', () => {
    // docs-writer and copywriter overlap — both shouldn't be in defaults
    const result = engine.recommend(
      makeGoal({ category: 'content-creation' }),
      makeCodebase()
    );

    const hasDocsWriter = result.defaultAgents.includes('docs-writer');
    const hasCopywriter = result.defaultAgents.includes('copywriter');
    // At most one of the overlapping pair should be in defaults
    expect(hasDocsWriter && hasCopywriter).toBe(false);
  });

  it('should include agent-skill links in result', () => {
    const result = engine.recommend(makeGoal(), makeCodebase());
    expect(result.agentSkillLinks).toBeDefined();
    expect(result.agentSkillLinks['testing-specialist']).toContain('vitest');
    expect(result.agentSkillLinks['frontend-specialist']).toContain('react');
  });

  it('should sort agents and skills by score descending', () => {
    const result = engine.recommend(makeGoal(), makeCodebase());

    for (let i = 1; i < result.agents.length; i++) {
      expect(result.agents[i - 1].score).toBeGreaterThanOrEqual(result.agents[i].score);
    }
    for (let i = 1; i < result.skills.length; i++) {
      expect(result.skills[i - 1].score).toBeGreaterThanOrEqual(result.skills[i].score);
    }
  });

  it('should handle custom category with no preset gracefully', () => {
    const result = engine.recommend(
      makeGoal({ category: 'custom', description: 'Something custom with React' }),
      makeCodebase()
    );

    // Should still pick up React from goal description
    const reactSkill = result.skills.find(s => s.name === 'react');
    expect(reactSkill).toBeDefined();
  });

  it('should suppress low-value agents from defaults', () => {
    const result = engine.recommend(makeGoal(), makeCodebase());

    // These are in SUPPRESS_FROM_DEFAULTS
    expect(result.defaultAgents).not.toContain('debugger');
    expect(result.defaultAgents).not.toContain('product-manager');
    expect(result.defaultAgents).not.toContain('accessibility-specialist');
  });
});
