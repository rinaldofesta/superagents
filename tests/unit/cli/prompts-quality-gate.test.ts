/**
 * Unit tests for quality gate prompt in selectTeam and exported utility functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as p from '@clack/prompts';

import {
  selectTeam,
  computeAutoLinkedSkills,
  categorizeGoalFromText,
} from '../../../src/cli/prompts.js';

import type { Recommendations } from '../../../src/types/config.js';

// Mock dependencies
vi.mock('@clack/prompts');
vi.mock('../../../src/cli/banner.js', () => ({
  AGENT_EXPERTS: {
    'backend-engineer': { expert: 'Backend Expert', domain: 'Server' },
    'testing-specialist': { expert: 'Testing Expert', domain: 'Testing' },
  },
}));
vi.mock('../../../src/cli/colors.js', () => ({
  orange: (s: string) => s,
  bgOrange: (s: string) => s,
}));
vi.mock('../../../src/cli/display-names.js', () => ({
  DISPLAY_NAMES: {},
}));

function makeRecommendations(overrides: Partial<Recommendations> = {}): Recommendations {
  return {
    agents: [
      { name: 'backend-engineer', score: 90, reasons: ['Backend work needed'] },
      { name: 'testing-specialist', score: 80, reasons: ['Tests needed'] },
    ],
    skills: [
      { name: 'typescript', score: 95, reasons: ['TypeScript detected'] },
    ],
    defaultAgents: ['backend-engineer'],
    defaultSkills: ['typescript'],
    agentSkillLinks: {
      'backend-engineer': ['typescript'],
    },
    ...overrides,
  };
}

describe('quality gate prompt in selectTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show quality gate prompt when testing-specialist selected and testCommand provided', async () => {
    const recommendations = makeRecommendations();

    vi.mocked(p.note).mockReturnValue(undefined);
    vi.mocked(p.multiselect).mockResolvedValue(['backend-engineer', 'testing-specialist']);
    vi.mocked(p.confirm).mockResolvedValue(false);
    vi.mocked(p.select)
      .mockResolvedValueOnce('confirm')
      .mockResolvedValueOnce('soft'); // quality gate selection
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await selectTeam(recommendations, { testCommand: 'npm test' });

    expect(result.qualityGate).toBe('soft');
    // p.select called twice: once for confirm, once for quality gate
    expect(p.select).toHaveBeenCalledTimes(2);
  });

  it('should not show quality gate prompt when testing-specialist not in agents', async () => {
    const recommendations = makeRecommendations();

    vi.mocked(p.note).mockReturnValue(undefined);
    vi.mocked(p.multiselect).mockResolvedValue(['backend-engineer']);
    vi.mocked(p.confirm).mockResolvedValue(false);
    vi.mocked(p.select).mockResolvedValue('confirm');
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await selectTeam(recommendations, { testCommand: 'npm test' });

    expect(result.qualityGate).toBe('off');
    // p.select called once: only for confirm
    expect(p.select).toHaveBeenCalledTimes(1);
  });

  it('should not show quality gate prompt when testCommand is null', async () => {
    const recommendations = makeRecommendations();

    vi.mocked(p.note).mockReturnValue(undefined);
    vi.mocked(p.multiselect).mockResolvedValue(['backend-engineer', 'testing-specialist']);
    vi.mocked(p.confirm).mockResolvedValue(false);
    vi.mocked(p.select).mockResolvedValue('confirm');
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await selectTeam(recommendations, { testCommand: null });

    expect(result.qualityGate).toBe('off');
    expect(p.select).toHaveBeenCalledTimes(1);
  });

  it('should return qualityGate off by default when no options provided', async () => {
    const recommendations = makeRecommendations();

    vi.mocked(p.note).mockReturnValue(undefined);
    vi.mocked(p.multiselect).mockResolvedValue(['backend-engineer', 'testing-specialist']);
    vi.mocked(p.confirm).mockResolvedValue(false);
    vi.mocked(p.select).mockResolvedValue('confirm');
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await selectTeam(recommendations);

    expect(result.qualityGate).toBe('off');
  });
});

describe('computeAutoLinkedSkills', () => {
  it('should return skills linked to selected agents', () => {
    const recommendations = makeRecommendations({
      agentSkillLinks: {
        'backend-engineer': ['typescript', 'nodejs'],
      },
      skills: [
        { name: 'typescript', score: 95, reasons: ['TS detected'] },
        { name: 'nodejs', score: 80, reasons: ['Node detected'] },
      ],
    });

    const result = computeAutoLinkedSkills(['backend-engineer'], recommendations);

    expect(result).toContain('typescript');
    expect(result).toContain('nodejs');
  });

  it('should return empty array when no links exist', () => {
    const recommendations = makeRecommendations({
      agentSkillLinks: {},
    });

    const result = computeAutoLinkedSkills(['backend-engineer'], recommendations);

    expect(result).toEqual([]);
  });

  it('should only include skills that have a positive score', () => {
    const recommendations = makeRecommendations({
      agentSkillLinks: {
        'backend-engineer': ['typescript', 'missing-skill'],
      },
      skills: [
        { name: 'typescript', score: 95, reasons: ['TS detected'] },
        // missing-skill has score 0 so it won't appear
      ],
    });

    const result = computeAutoLinkedSkills(['backend-engineer'], recommendations);

    expect(result).toEqual(['typescript']);
  });
});

describe('categorizeGoalFromText', () => {
  it('should categorize REST API goal as api-service', () => {
    const result = categorizeGoalFromText('build a REST API');
    expect(result).toBe('api-service');
  });

  it('should categorize dashboard goal as saas-dashboard', () => {
    const result = categorizeGoalFromText('create an admin dashboard');
    expect(result).toBe('saas-dashboard');
  });

  it('should categorize CLI tool goal as cli-tool', () => {
    const result = categorizeGoalFromText('build a CLI automation tool');
    expect(result).toBe('cli-tool');
  });

  it('should categorize ecommerce goal as ecommerce', () => {
    const result = categorizeGoalFromText('create an e-commerce store');
    expect(result).toBe('ecommerce');
  });

  it('should return custom for unrecognized goals', () => {
    const result = categorizeGoalFromText('do something completely unique');
    expect(result).toBe('custom');
  });

  it('should return custom for empty string', () => {
    const result = categorizeGoalFromText('');
    expect(result).toBe('custom');
  });
});
