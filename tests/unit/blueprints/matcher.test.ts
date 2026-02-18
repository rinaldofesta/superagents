/**
 * Unit tests for blueprint matcher
 */

import { describe, it, expect } from 'vitest';
import { matchBlueprints } from '../../../src/blueprints/matcher.js';

import type { ProjectGoal, ProjectSpec } from '../../../src/types/goal.js';

function makeGoal(overrides: Partial<ProjectGoal> = {}): ProjectGoal {
  return {
    description: 'A web app',
    category: 'custom',
    technicalRequirements: [],
    suggestedAgents: [],
    suggestedSkills: [],
    timestamp: new Date().toISOString(),
    confidence: 1.0,
    ...overrides
  };
}

function makeSpec(overrides: Partial<ProjectSpec> = {}): ProjectSpec {
  return {
    vision: 'Build something',
    stack: 'nextjs',
    focus: 'fullstack',
    requirements: [],
    ...overrides
  };
}

describe('matchBlueprints', () => {
  describe('category scoring', () => {
    it('should match saas-dashboard blueprint for saas-dashboard category', () => {
      const goal = makeGoal({ category: 'saas-dashboard' });
      const matches = matchBlueprints(goal);

      const saas = matches.find(m => m.blueprint.id === 'saas-dashboard');
      expect(saas).toBeDefined();
      expect(saas!.score).toBeGreaterThanOrEqual(40);
    });

    it('should match api-backend blueprint for api-service category', () => {
      const goal = makeGoal({ category: 'api-service' });
      const matches = matchBlueprints(goal);

      const api = matches.find(m => m.blueprint.id === 'api-backend');
      expect(api).toBeDefined();
      expect(api!.score).toBeGreaterThanOrEqual(40);
    });

    it('should match marketplace blueprint for ecommerce category', () => {
      const goal = makeGoal({ category: 'ecommerce' });
      const matches = matchBlueprints(goal);

      const marketplace = matches.find(m => m.blueprint.id === 'marketplace');
      expect(marketplace).toBeDefined();
    });

    it('should match landing-waitlist for marketing-campaign category', () => {
      const goal = makeGoal({ category: 'marketing-campaign' });
      const matches = matchBlueprints(goal);

      const landing = matches.find(m => m.blueprint.id === 'landing-waitlist');
      expect(landing).toBeDefined();
    });
  });

  describe('keyword scoring', () => {
    it('should boost score when keywords match description', () => {
      // saas-dashboard keywords: dashboard, saas, admin, analytics, metrics, panel, web app, fullstack
      // 5 keyword hits * 5 points = 25, which exceeds the >20 threshold
      const withKeywords = makeGoal({
        category: 'custom',
        description: 'A saas dashboard with analytics and metrics panel for admin users'
      });
      const withoutKeywords = makeGoal({
        category: 'custom',
        description: 'Something completely unrelated to any blueprint xyzzy'
      });

      const matchesWithKeywords = matchBlueprints(withKeywords);
      const matchesWithout = matchBlueprints(withoutKeywords);

      expect(matchesWithKeywords.length).toBeGreaterThan(matchesWithout.length);
    });

    it('should match via spec vision keywords', () => {
      const goal = makeGoal({ category: 'custom', description: 'Build a thing' });
      const spec = makeSpec({ vision: 'A marketplace for buying and selling' });

      const matches = matchBlueprints(goal, spec);
      const marketplace = matches.find(m => m.blueprint.id === 'marketplace');
      expect(marketplace).toBeDefined();
    });
  });

  describe('stack scoring', () => {
    it('should boost score for matching stack', () => {
      const goal = makeGoal({ category: 'saas-dashboard' });
      const specNextjs = makeSpec({ stack: 'nextjs' });
      const specPython = makeSpec({ stack: 'python-fastapi' });

      const matchesNextjs = matchBlueprints(goal, specNextjs);
      const matchesPython = matchBlueprints(goal, specPython);

      const saasNextjs = matchesNextjs.find(m => m.blueprint.id === 'saas-dashboard');
      const saasPython = matchesPython.find(m => m.blueprint.id === 'saas-dashboard');

      // nextjs is in saas-dashboard's requiredStack, python-fastapi is not
      expect(saasNextjs!.score).toBeGreaterThan(saasPython!.score);
    });

    it('should match api-backend with python-fastapi stack', () => {
      const goal = makeGoal({ category: 'api-service' });
      const spec = makeSpec({ stack: 'python-fastapi' });

      const matches = matchBlueprints(goal, spec);
      const api = matches.find(m => m.blueprint.id === 'api-backend');

      expect(api).toBeDefined();
      expect(api!.reasons).toContain('Works with your python-fastapi stack');
    });
  });

  describe('focus scoring', () => {
    it('should boost api-backend for api focus', () => {
      const goal = makeGoal({ category: 'api-service' });
      const specApi = makeSpec({ focus: 'api' });
      const specFrontend = makeSpec({ focus: 'frontend' });

      const matchesApi = matchBlueprints(goal, specApi);
      const matchesFrontend = matchBlueprints(goal, specFrontend);

      const apiWithApiFocus = matchesApi.find(m => m.blueprint.id === 'api-backend');
      const apiWithFeFocus = matchesFrontend.find(m => m.blueprint.id === 'api-backend');

      expect(apiWithApiFocus!.score).toBeGreaterThan(apiWithFeFocus!.score);
    });
  });

  describe('filtering and sorting', () => {
    it('should filter out matches with score <= 20', () => {
      const goal = makeGoal({
        category: 'custom',
        description: 'Something with no blueprint keywords at all xyzzy'
      });

      const matches = matchBlueprints(goal);

      for (const match of matches) {
        expect(match.score).toBeGreaterThan(20);
      }
    });

    it('should return at most 3 matches', () => {
      // saas-dashboard category matches both saas-dashboard and internal-tool blueprints
      const goal = makeGoal({
        category: 'saas-dashboard',
        description: 'dashboard admin panel marketplace ecommerce landing api backend internal tool'
      });
      const spec = makeSpec({ stack: 'nextjs', focus: 'fullstack' });

      const matches = matchBlueprints(goal, spec);

      expect(matches.length).toBeLessThanOrEqual(3);
    });

    it('should sort by score descending', () => {
      const goal = makeGoal({
        category: 'saas-dashboard',
        description: 'A dashboard with admin panel'
      });
      const spec = makeSpec({ stack: 'nextjs', focus: 'fullstack' });

      const matches = matchBlueprints(goal, spec);

      for (let i = 1; i < matches.length; i++) {
        expect(matches[i - 1].score).toBeGreaterThanOrEqual(matches[i].score);
      }
    });
  });

  describe('reasons', () => {
    it('should include category reason when category matches', () => {
      const goal = makeGoal({ category: 'ecommerce' });
      const matches = matchBlueprints(goal);
      const marketplace = matches.find(m => m.blueprint.id === 'marketplace');

      expect(marketplace!.reasons.some(r => r.includes('ecommerce'))).toBe(true);
    });

    it('should include keyword reason when keywords match', () => {
      const goal = makeGoal({
        category: 'saas-dashboard',
        description: 'A dashboard with analytics'
      });
      const matches = matchBlueprints(goal);
      const saas = matches.find(m => m.blueprint.id === 'saas-dashboard');

      expect(saas!.reasons.some(r => r.startsWith('Keywords:'))).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return empty array when no blueprints match', () => {
      const goal = makeGoal({
        category: 'research-analysis',
        description: 'Academic paper review system'
      });

      const matches = matchBlueprints(goal);
      expect(matches).toEqual([]);
    });

    it('should work without a spec', () => {
      const goal = makeGoal({ category: 'saas-dashboard' });
      const matches = matchBlueprints(goal);

      expect(matches.length).toBeGreaterThan(0);
    });
  });
});
