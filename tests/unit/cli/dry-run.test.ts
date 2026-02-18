/**
 * Unit tests for dry-run preview display
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { displayDryRunPreview } from '../../../src/cli/dry-run.js';
import { makeCodebase, makeGoal } from '../../helpers/fixtures.js';
import type { GenerationContext } from '../../../src/types/generation.js';

describe('displayDryRunPreview', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('context validation', () => {
    it('should throw error when selectedAgents is missing', () => {
      const context = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: undefined,
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      } as unknown as GenerationContext;

      expect(() => displayDryRunPreview(context)).toThrow('Invalid context: missing selectedAgents or selectedSkills');
    });

    it('should throw error when selectedSkills is missing', () => {
      const context = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer'],
        selectedSkills: undefined,
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      } as unknown as GenerationContext;

      expect(() => displayDryRunPreview(context)).toThrow('Invalid context: missing selectedAgents or selectedSkills');
    });

    it('should throw error when goal is missing', () => {
      const context = {
        goal: undefined,
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      } as unknown as GenerationContext;

      expect(() => displayDryRunPreview(context)).toThrow('Invalid context: missing goal information');
    });

    it('should throw error when goal.description is missing', () => {
      const context = {
        goal: { ...makeGoal(), description: '' },
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      } as GenerationContext;

      expect(() => displayDryRunPreview(context)).toThrow('Invalid context: missing goal information');
    });

    it('should throw error when codebase is missing', () => {
      const context = {
        goal: makeGoal(),
        codebase: undefined,
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      } as unknown as GenerationContext;

      expect(() => displayDryRunPreview(context)).toThrow('Invalid context: missing codebase information');
    });
  });

  describe('display output', () => {
    it('should display preview header', () => {
      const context: GenerationContext = {
        goal: makeGoal({ description: 'Test project' }),
        codebase: makeCodebase({ projectRoot: '/test/project' }),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('PREVIEW MODE - Nothing will be written');
    });

    it('should display project information', () => {
      const context: GenerationContext = {
        goal: makeGoal({ description: 'Test SaaS dashboard', category: 'saas-dashboard' }),
        codebase: makeCodebase({
          projectRoot: '/test/project',
          framework: 'nextjs'
        }),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('Test SaaS dashboard');
      expect(output).toContain('saas-dashboard');
      expect(output).toContain('nextjs');
    });

    it('should display agents with model selection', () => {
      const context: GenerationContext = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer', 'frontend-specialist'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('backend-engineer');
      expect(output).toContain('frontend-specialist');
      expect(output).toContain('Model:');
    });

    it('should display skills with complexity and model selection', () => {
      const context: GenerationContext = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript', 'react', 'nodejs'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('typescript');
      expect(output).toContain('react');
      expect(output).toContain('nodejs');
    });

    it('should display other generated files', () => {
      const context: GenerationContext = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('CLAUDE.md');
      expect(output).toContain('settings.json');
      expect(output).toContain('ARCHITECTURE.md');
      expect(output).toContain('PATTERNS.md');
      expect(output).toContain('SETUP.md');
    });

    it('should display project output location', () => {
      const context: GenerationContext = {
        goal: makeGoal(),
        codebase: makeCodebase({ projectRoot: '/my/test/project' }),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('/my/test/project/.claude/');
    });

    it('should display cost estimate', () => {
      const context: GenerationContext = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('Estimated cost:');
      expect(output).toContain('API calls:');
      expect(output).toContain('Tokens:');
      expect(output).toContain('Cost:');
    });

    it('should display model breakdown', () => {
      const context: GenerationContext = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('Models used:');
    });

    it('should display run command', () => {
      const context: GenerationContext = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('Ready to generate? Run:');
      expect(output).toContain('superagents');
    });
  });

  describe('cost estimation', () => {
    it('should calculate correct API call count for single agent and skill', () => {
      const context: GenerationContext = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toMatch(/API calls: 3/);
    });

    it('should calculate correct API call count for multiple agents and skills', () => {
      const context: GenerationContext = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer', 'frontend-specialist', 'testing-specialist'],
        selectedSkills: ['typescript', 'react', 'nodejs'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toMatch(/API calls: 7/);
    });

    it('should include CLAUDE.md in cost calculation', () => {
      const context: GenerationContext = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: [],
        selectedSkills: [],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toMatch(/API calls: 1/);
    });

    it('should display non-zero cost estimate', () => {
      const context: GenerationContext = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      const costMatch = output.match(/Cost: ~\$(\d+\.\d+)/);
      expect(costMatch).toBeTruthy();
      if (costMatch) {
        const cost = parseFloat(costMatch[1]);
        expect(cost).toBeGreaterThan(0);
      }
    });

    it('should display token count estimate', () => {
      const context: GenerationContext = {
        goal: makeGoal(),
        codebase: makeCodebase(),
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript'],
        selectedModel: 'sonnet' as const,
        authMethod: 'env' as const,
        sampledFiles: [],
        generatedAt: new Date().toISOString()
      };

      displayDryRunPreview(context);

      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      const tokenMatch = output.match(/Tokens: ~([\d,]+)/);
      expect(tokenMatch).toBeTruthy();
      if (tokenMatch) {
        const tokens = parseInt(tokenMatch[1].replace(/,/g, ''));
        expect(tokens).toBeGreaterThan(0);
      }
    });
  });
});
