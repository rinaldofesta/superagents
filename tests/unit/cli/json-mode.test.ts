/**
 * Unit tests for JSON mode types and utility functions used by JSON mode
 */

import { describe, it, expect } from 'vitest';

import {
  categorizeGoalFromText,
  computeAutoLinkedSkills,
} from '../../../src/cli/prompts.js';

import type { JsonModeOutput, JsonModeError } from '../../../src/types/generation.js';
import type { Recommendations } from '../../../src/types/config.js';

describe('categorizeGoalFromText for JSON mode goal mapping', () => {
  it('should map REST API goal to api-service', () => {
    expect(categorizeGoalFromText('build a REST API for mobile app')).toBe('api-service');
  });

  it('should map graphql goal to api-service', () => {
    expect(categorizeGoalFromText('create a graphql backend')).toBe('api-service');
  });

  it('should map SaaS dashboard goal to saas-dashboard', () => {
    expect(categorizeGoalFromText('build a SaaS analytics dashboard')).toBe('saas-dashboard');
  });

  it('should map mobile app goal to mobile-app', () => {
    expect(categorizeGoalFromText('build an iOS mobile app')).toBe('mobile-app');
  });

  it('should map landing page goal to content-platform', () => {
    expect(categorizeGoalFromText('create a landing page for my startup')).toBe('content-platform');
  });

  it('should map marketing goal to marketing-campaign', () => {
    expect(categorizeGoalFromText('plan a marketing campaign for Q2')).toBe('marketing-campaign');
  });

  it('should map authentication goal to auth-service', () => {
    expect(categorizeGoalFromText('implement an authentication system with SSO')).toBe('auth-service');
  });

  it('should return custom for ambiguous goals', () => {
    expect(categorizeGoalFromText('make a cool new thing for my dog')).toBe('custom');
  });
});

describe('computeAutoLinkedSkills for JSON mode agent overrides', () => {
  function makeRecommendations(overrides: Partial<Recommendations> = {}): Recommendations {
    return {
      agents: [
        { name: 'backend-engineer', score: 90, reasons: ['Backend'] },
        { name: 'frontend-engineer', score: 80, reasons: ['Frontend'] },
      ],
      skills: [
        { name: 'typescript', score: 95, reasons: ['TS'] },
        { name: 'react', score: 85, reasons: ['React'] },
        { name: 'nodejs', score: 80, reasons: ['Node'] },
      ],
      defaultAgents: ['backend-engineer'],
      defaultSkills: ['typescript'],
      agentSkillLinks: {
        'backend-engineer': ['typescript', 'nodejs'],
        'frontend-engineer': ['react', 'typescript'],
      },
      ...overrides,
    };
  }

  it('should compute linked skills for single agent', () => {
    const recs = makeRecommendations();
    const result = computeAutoLinkedSkills(['backend-engineer'], recs);

    expect(result).toContain('typescript');
    expect(result).toContain('nodejs');
    expect(result).not.toContain('react');
  });

  it('should merge skills from multiple agents without duplicates', () => {
    const recs = makeRecommendations();
    const result = computeAutoLinkedSkills(['backend-engineer', 'frontend-engineer'], recs);

    expect(result).toContain('typescript');
    expect(result).toContain('nodejs');
    expect(result).toContain('react');
    // typescript should appear only once
    expect(result.filter(s => s === 'typescript')).toHaveLength(1);
  });

  it('should return empty array for agents with no skill links', () => {
    const recs = makeRecommendations({ agentSkillLinks: {} });
    const result = computeAutoLinkedSkills(['backend-engineer'], recs);

    expect(result).toEqual([]);
  });
});

describe('JsonModeOutput type structure', () => {
  it('should accept a valid JsonModeOutput object', () => {
    const output: JsonModeOutput = {
      success: true,
      mode: 'existing',
      projectRoot: '/test',
      agents: ['backend-engineer'],
      skills: ['typescript'],
      filesWritten: ['CLAUDE.md', '.claude/settings.json'],
      warnings: [],
    };

    expect(output.success).toBe(true);
    expect(output.mode).toBe('existing');
    expect(output.agents).toHaveLength(1);
    expect(output.skills).toHaveLength(1);
    expect(output.filesWritten).toHaveLength(2);
    expect(output.warnings).toHaveLength(0);
  });

  it('should accept a valid JsonModeError object', () => {
    const error: JsonModeError = {
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_REQUIRED',
    };

    expect(error.success).toBe(false);
    expect(error.error).toBe('Authentication failed');
    expect(error.code).toBe('AUTH_REQUIRED');
  });
});
