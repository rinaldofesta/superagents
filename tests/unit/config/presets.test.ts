/**
 * Unit tests for goal-based presets
 */

import { describe, it, expect } from 'vitest';
import { GOAL_PRESETS } from '../../../src/config/presets.js';
import type { GoalCategory } from '../../../src/types/goal.js';

describe('GOAL_PRESETS', () => {
  describe('structure validation', () => {
    it('should have all 14 goal categories', () => {
      const expectedCategories: GoalCategory[] = [
        'saas-dashboard',
        'ecommerce',
        'content-platform',
        'api-service',
        'mobile-app',
        'cli-tool',
        'data-pipeline',
        'auth-service',
        'business-plan',
        'marketing-campaign',
        'content-creation',
        'research-analysis',
        'project-docs',
        'custom'
      ];

      const actualCategories = Object.keys(GOAL_PRESETS);
      expect(actualCategories).toHaveLength(14);
      expect(actualCategories.sort()).toEqual(expectedCategories.sort());
    });

    it('should have recommendedAgents array in each preset', () => {
      for (const [category, preset] of Object.entries(GOAL_PRESETS)) {
        expect(preset.recommendedAgents, `${category} should have recommendedAgents`).toBeDefined();
        expect(Array.isArray(preset.recommendedAgents), `${category}.recommendedAgents should be array`).toBe(true);
      }
    });

    it('should have recommendedSkills array in each preset', () => {
      for (const [category, preset] of Object.entries(GOAL_PRESETS)) {
        expect(preset.recommendedSkills, `${category} should have recommendedSkills`).toBeDefined();
        expect(Array.isArray(preset.recommendedSkills), `${category}.recommendedSkills should be array`).toBe(true);
      }
    });

    it('should have technicalRequirements array in each preset', () => {
      for (const [category, preset] of Object.entries(GOAL_PRESETS)) {
        expect(preset.technicalRequirements, `${category} should have technicalRequirements`).toBeDefined();
        expect(Array.isArray(preset.technicalRequirements), `${category}.technicalRequirements should be array`).toBe(true);
      }
    });
  });

  describe('agent suggestions validation', () => {
    it('should have valid agent structure with name, priority, and reason', () => {
      for (const [category, preset] of Object.entries(GOAL_PRESETS)) {
        for (const agent of preset.recommendedAgents) {
          expect(agent.name, `${category} agent should have name`).toBeDefined();
          expect(typeof agent.name, `${category} agent.name should be string`).toBe('string');
          expect(agent.name.length, `${category} agent.name should not be empty`).toBeGreaterThan(0);

          expect(agent.priority, `${category} agent should have priority`).toBeDefined();
          expect(typeof agent.priority, `${category} agent.priority should be number`).toBe('number');
          expect(agent.priority, `${category} agent.priority should be 1-10`).toBeGreaterThanOrEqual(1);
          expect(agent.priority, `${category} agent.priority should be 1-10`).toBeLessThanOrEqual(10);

          expect(agent.reason, `${category} agent should have reason`).toBeDefined();
          expect(typeof agent.reason, `${category} agent.reason should be string`).toBe('string');
          expect(agent.reason.length, `${category} agent.reason should not be empty`).toBeGreaterThan(0);
        }
      }
    });

    it('should have at least one core agent with priority 9-10 for development categories', () => {
      const devCategories: GoalCategory[] = [
        'saas-dashboard',
        'ecommerce',
        'content-platform',
        'api-service',
        'mobile-app',
        'cli-tool',
        'data-pipeline',
        'auth-service'
      ];

      for (const category of devCategories) {
        const preset = GOAL_PRESETS[category];
        const coreAgents = preset.recommendedAgents.filter(a => a.priority >= 9);
        expect(coreAgents.length, `${category} should have at least one core agent (priority 9-10)`).toBeGreaterThan(0);
      }
    });

    it('should have agents mostly sorted by priority descending', () => {
      for (const [category, preset] of Object.entries(GOAL_PRESETS)) {
        if (preset.recommendedAgents.length > 1) {
          const priorities = preset.recommendedAgents.map(a => a.priority);
          const firstPriority = priorities[0];
          const lastPriority = priorities[priorities.length - 1];
          expect(firstPriority, `${category} first agent should have higher priority than last`).toBeGreaterThanOrEqual(lastPriority);
        }
      }
    });
  });

  describe('skill suggestions validation', () => {
    it('should have valid skill structure with name, priority, and reason', () => {
      for (const [category, preset] of Object.entries(GOAL_PRESETS)) {
        for (const skill of preset.recommendedSkills) {
          expect(skill.name, `${category} skill should have name`).toBeDefined();
          expect(typeof skill.name, `${category} skill.name should be string`).toBe('string');
          expect(skill.name.length, `${category} skill.name should not be empty`).toBeGreaterThan(0);

          expect(skill.priority, `${category} skill should have priority`).toBeDefined();
          expect(typeof skill.priority, `${category} skill.priority should be number`).toBe('number');
          expect(skill.priority, `${category} skill.priority should be 1-10`).toBeGreaterThanOrEqual(1);
          expect(skill.priority, `${category} skill.priority should be 1-10`).toBeLessThanOrEqual(10);

          expect(skill.reason, `${category} skill should have reason`).toBeDefined();
          expect(typeof skill.reason, `${category} skill.reason should be string`).toBe('string');
          expect(skill.reason.length, `${category} skill.reason should not be empty`).toBeGreaterThan(0);
        }
      }
    });

    it('should have skills sorted by priority descending', () => {
      for (const [category, preset] of Object.entries(GOAL_PRESETS)) {
        if (preset.recommendedSkills.length > 0) {
          const priorities = preset.recommendedSkills.map(s => s.priority);
          const sortedPriorities = [...priorities].sort((a, b) => b - a);
          expect(priorities, `${category} skills should be sorted by priority descending`).toEqual(sortedPriorities);
        }
      }
    });
  });

  describe('technical requirements validation', () => {
    it('should have valid tech requirement structure', () => {
      for (const [category, preset] of Object.entries(GOAL_PRESETS)) {
        for (const req of preset.technicalRequirements) {
          expect(req.category, `${category} tech req should have category`).toBeDefined();
          expect(['frontend', 'backend', 'database', 'auth', 'payments', 'deployment'], `${category} tech req category should be valid`).toContain(req.category);

          expect(req.description, `${category} tech req should have description`).toBeDefined();
          expect(typeof req.description, `${category} tech req.description should be string`).toBe('string');
          expect(req.description.length, `${category} tech req.description should not be empty`).toBeGreaterThan(0);

          expect(req.priority, `${category} tech req should have priority`).toBeDefined();
          expect(['required', 'recommended', 'optional'], `${category} tech req priority should be valid`).toContain(req.priority);

          expect(req.suggestedTechnologies, `${category} tech req should have suggestedTechnologies`).toBeDefined();
          expect(Array.isArray(req.suggestedTechnologies), `${category} tech req.suggestedTechnologies should be array`).toBe(true);
        }
      }
    });

    it('should have at least one suggested technology per requirement', () => {
      for (const [category, preset] of Object.entries(GOAL_PRESETS)) {
        for (const req of preset.technicalRequirements) {
          expect(req.suggestedTechnologies.length, `${category} tech req should have at least one suggested technology`).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('specific preset validation', () => {
    it('should have correct saas-dashboard preset structure', () => {
      const preset = GOAL_PRESETS['saas-dashboard'];
      expect(preset.recommendedAgents.length).toBeGreaterThan(5);
      expect(preset.recommendedSkills.length).toBeGreaterThan(3);
      expect(preset.technicalRequirements.length).toBeGreaterThan(2);

      const hasBackendEngineer = preset.recommendedAgents.some(a => a.name === 'backend-engineer');
      const hasFrontendSpecialist = preset.recommendedAgents.some(a => a.name === 'frontend-specialist');
      expect(hasBackendEngineer).toBe(true);
      expect(hasFrontendSpecialist).toBe(true);
    });

    it('should have correct api-service preset structure', () => {
      const preset = GOAL_PRESETS['api-service'];
      expect(preset.recommendedAgents.length).toBeGreaterThan(5);

      const hasBackendEngineer = preset.recommendedAgents.some(a => a.name === 'backend-engineer');
      const hasApiDesigner = preset.recommendedAgents.some(a => a.name === 'api-designer');
      expect(hasBackendEngineer).toBe(true);
      expect(hasApiDesigner).toBe(true);

      const backendEngineer = preset.recommendedAgents.find(a => a.name === 'backend-engineer');
      expect(backendEngineer?.priority).toBe(10);
    });

    it('should have correct cli-tool preset structure', () => {
      const preset = GOAL_PRESETS['cli-tool'];

      const hasBackendEngineer = preset.recommendedAgents.some(a => a.name === 'backend-engineer');
      const hasTestingSpecialist = preset.recommendedAgents.some(a => a.name === 'testing-specialist');
      expect(hasBackendEngineer).toBe(true);
      expect(hasTestingSpecialist).toBe(true);

      const hasNodejs = preset.recommendedSkills.some(s => s.name === 'nodejs');
      expect(hasNodejs).toBe(true);
    });

    it('should have minimal skills for non-development categories', () => {
      const nonDevCategories: GoalCategory[] = [
        'business-plan',
        'marketing-campaign',
        'content-creation',
        'research-analysis',
        'project-docs'
      ];

      for (const category of nonDevCategories) {
        const preset = GOAL_PRESETS[category];
        expect(preset.recommendedSkills.length, `${category} should have minimal skills`).toBeLessThanOrEqual(2);
        expect(preset.technicalRequirements.length, `${category} should have no tech requirements`).toBe(0);
      }
    });

    it('should have custom preset with generic suggestions', () => {
      const preset = GOAL_PRESETS['custom'];
      expect(preset.recommendedAgents.length).toBeGreaterThan(0);
      expect(preset.recommendedSkills.length).toBe(0);
      expect(preset.technicalRequirements.length).toBe(0);

      const priorities = preset.recommendedAgents.map(a => a.priority);
      const maxPriority = Math.max(...priorities);
      expect(maxPriority, 'custom preset should have lower priorities').toBeLessThanOrEqual(4);
    });
  });
});
