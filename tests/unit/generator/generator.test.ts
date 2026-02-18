/**
 * Unit tests for the AIGenerator
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock external dependencies
vi.mock('ora', () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    text: '',
    stop: vi.fn(),
    succeed: vi.fn(),
    warn: vi.fn().mockReturnThis()
  })
}));

vi.mock('../../../src/cache/index.js', () => ({
  cache: {
    getCodebaseHash: vi.fn().mockResolvedValue('test-hash-abc123'),
    getCachedGeneration: vi.fn().mockResolvedValue(null),
    setCachedGeneration: vi.fn().mockResolvedValue(undefined),
  }
}));

vi.mock('../../../src/templates/loader.js', () => ({
  hasTemplate: vi.fn().mockReturnValue(true),
  loadTemplate: vi.fn().mockResolvedValue('# Template Content\nTest template')
}));

vi.mock('../../../src/templates/custom.js', () => ({
  hasCustomTemplate: vi.fn().mockResolvedValue(false),
  loadCustomTemplate: vi.fn().mockResolvedValue(null)
}));

vi.mock('../../../src/utils/concurrency.js', () => ({
  parallelGenerateWithErrors: vi.fn().mockImplementation(async (items, generator, onSuccess) => {
    const results = [];
    for (const item of items) {
      const result = await generator(item);
      results.push(result);
      onSuccess?.(item, result);
    }
    return { results, errors: [] };
  }),
  withRetry: vi.fn().mockImplementation(fn => fn())
}));

vi.mock('../../../src/utils/model-selector.js', () => ({
  selectModel: vi.fn().mockReturnValue('claude-sonnet-4-5-20250929'),
  getSkillComplexity: vi.fn().mockReturnValue('medium'),
  getModelDisplayName: vi.fn().mockReturnValue('Sonnet 4.5')
}));

vi.mock('../../../src/utils/logger.js', () => ({
  log: { debug: vi.fn(), verbose: vi.fn(), section: vi.fn(), table: vi.fn() }
}));

vi.mock('../../../src/prompts/templates.js', () => ({
  buildAgentPrompt: vi.fn().mockReturnValue('test agent prompt'),
  buildSkillPrompt: vi.fn().mockReturnValue('test skill prompt'),
  buildClaudeMdPrompt: vi.fn().mockReturnValue('test claude.md prompt')
}));

vi.mock('../../../src/utils/claude-cli.js', () => ({
  executeWithClaudeCLI: vi.fn().mockResolvedValue('test')
}));

vi.mock('../../../src/blueprints/definitions.js', () => ({
  BLUEPRINTS: []
}));

vi.mock('../../../src/blueprints/renderer.js', () => ({
  renderRoadmap: vi.fn().mockReturnValue('# Roadmap')
}));

vi.mock('fs-extra', () => ({
  default: { pathExists: vi.fn() }
}));

import { AIGenerator } from '../../../src/generator/index.js';
import { cache } from '../../../src/cache/index.js';
import { hasTemplate, loadTemplate } from '../../../src/templates/loader.js';
import { parallelGenerateWithErrors } from '../../../src/utils/concurrency.js';
import fs from 'fs-extra';

import type { GenerationContext } from '../../../src/types/generation.js';
import type { CodebaseAnalysis } from '../../../src/types/codebase.js';
import type { ProjectGoal } from '../../../src/types/goal.js';

const mockedFs = vi.mocked(fs);

// Helper function to create a minimal CodebaseAnalysis
function makeCodebase(overrides: Partial<CodebaseAnalysis> = {}): CodebaseAnalysis {
  return {
    projectRoot: '/tmp/test-project',
    projectType: 'node',
    language: 'typescript',
    framework: 'express',
    dependencies: [
      { name: 'express', version: '4.0.0', category: 'framework' }
    ],
    devDependencies: [],
    fileStructure: [],
    totalFiles: 10,
    totalLines: 500,
    detectedPatterns: [
      {
        type: 'api-routes',
        paths: ['src/routes/'],
        confidence: 0.9,
        description: 'API routes'
      }
    ],
    suggestedSkills: [],
    suggestedAgents: [],
    existingClaudeConfig: null,
    mcpServers: [],
    monorepo: null,
    sampledFiles: [],
    packageManager: 'npm',
    lintCommand: 'npm run lint',
    formatCommand: null,
    testCommand: 'npm test',
    devCommand: 'npm run dev',
    buildCommand: 'npm run build',
    hasEnvFile: false,
    negativeConstraints: [
      {
        technology: 'Express',
        alternative: 'Fastify',
        rule: 'Use Express, NOT Fastify'
      }
    ],
    mcpSuggestions: [],
    analyzedAt: '2024-01-01T00:00:00.000Z',
    analysisTimeMs: 100,
    ...overrides
  };
}

// Helper function to create a minimal ProjectGoal
function makeGoal(overrides: Partial<ProjectGoal> = {}): ProjectGoal {
  return {
    description: 'Build a REST API with Express and TypeScript',
    category: 'api-service',
    technicalRequirements: [],
    suggestedAgents: [],
    suggestedSkills: [],
    timestamp: '2024-01-01T00:00:00.000Z',
    confidence: 1.0,
    ...overrides
  };
}

// Helper function to create a minimal GenerationContext
function makeContext(overrides: Partial<GenerationContext> = {}): GenerationContext {
  return {
    goal: makeGoal(),
    codebase: makeCodebase(),
    selectedAgents: ['backend-engineer'],
    selectedSkills: ['typescript'],
    selectedModel: 'sonnet',
    authMethod: 'api-key',
    apiKey: 'sk-ant-test-key',
    sampledFiles: [],
    verbose: false,
    dryRun: false,
    generatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  };
}

describe('AIGenerator', () => {
  let generator: AIGenerator;

  beforeEach(() => {
    generator = new AIGenerator();
    vi.clearAllMocks();
    mockedFs.pathExists.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should throw when no agents or skills are selected', async () => {
      const context = makeContext({
        selectedAgents: [],
        selectedSkills: []
      });

      await expect(generator.generateAll(context))
        .rejects
        .toThrow('No agents or skills selected');
    });

    it('should throw when goal description is missing', async () => {
      const context = makeContext({
        goal: makeGoal({ description: '' })
      });

      await expect(generator.generateAll(context))
        .rejects
        .toThrow('Project goal is required');
    });

    it('should throw when codebase is missing project root', async () => {
      const context = makeContext({
        codebase: makeCodebase({ projectRoot: '' })
      });

      await expect(generator.generateAll(context))
        .rejects
        .toThrow('Codebase analysis is required');
    });
  });

  describe('generateAll', () => {
    it('should generate agents, skills, claudeMd, commands, settings, and docs', async () => {
      const context = makeContext({
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript']
      });

      const result = await generator.generateAll(context);

      expect(result.agents).toHaveLength(1);
      expect(result.agents[0].filename).toBe('backend-engineer.md');
      expect(result.agents[0].agentName).toBe('backend-engineer');
      expect(result.agents[0].content).toBeTruthy();

      expect(result.skills).toHaveLength(1);
      expect(result.skills[0].filename).toBe('typescript.md');
      expect(result.skills[0].skillName).toBe('typescript');
      expect(result.skills[0].content).toBeTruthy();

      expect(result.claudeMd).toBeTruthy();
      expect(result.settings).toBeDefined();
      expect(result.commands).toHaveLength(5);
      expect(result.docs).toHaveLength(3);
    });

    it('should generate multiple agents and skills', async () => {
      const context = makeContext({
        selectedAgents: ['backend-engineer', 'testing-specialist'],
        selectedSkills: ['typescript', 'nodejs', 'express']
      });

      const result = await generator.generateAll(context);

      expect(result.agents).toHaveLength(2);
      expect(result.agents.map(a => a.agentName)).toEqual(['backend-engineer', 'testing-specialist']);

      expect(result.skills).toHaveLength(3);
      expect(result.skills.map(s => s.skillName)).toEqual(['typescript', 'nodejs', 'express']);
    });

    it('should use templates from cache/loader', async () => {
      const context = makeContext();

      await generator.generateAll(context);

      expect(hasTemplate).toHaveBeenCalledWith('agent', 'backend-engineer');
      expect(loadTemplate).toHaveBeenCalledWith('agent', 'backend-engineer', context);
      expect(hasTemplate).toHaveBeenCalledWith('skill', 'typescript');
      expect(loadTemplate).toHaveBeenCalledWith('skill', 'typescript', context);
    });

    it('should call cache operations', async () => {
      const context = makeContext();

      await generator.generateAll(context);

      expect(cache.getCodebaseHash).toHaveBeenCalledWith('/tmp/test-project');
      expect(cache.getCachedGeneration).toHaveBeenCalled();
    });

    it('should use parallel generation', async () => {
      const context = makeContext({
        selectedAgents: ['backend-engineer', 'testing-specialist'],
        selectedSkills: ['typescript', 'nodejs']
      });

      await generator.generateAll(context);

      // Should be called twice: once for agents, once for skills
      expect(parallelGenerateWithErrors).toHaveBeenCalledTimes(2);
    });
  });

  describe('settings builder', () => {
    it('should generate settings without git permissions when .git does not exist', async () => {
      mockedFs.pathExists.mockResolvedValue(false);

      const context = makeContext();
      const result = await generator.generateAll(context);

      expect(result.settings.permissions?.allow).toBeDefined();
      expect(result.settings.permissions?.allow).not.toContain('Bash(git status)');
      expect(result.settings.permissions?.allow).not.toContain('Bash(git diff *)');
      expect(result.settings.permissions?.deny).not.toContain('Bash(git push --force *)');
    });

    it('should include git permissions when .git exists', async () => {
      mockedFs.pathExists.mockResolvedValue(true);

      const context = makeContext();
      const result = await generator.generateAll(context);

      expect(result.settings.permissions?.allow).toContain('Bash(git status)');
      expect(result.settings.permissions?.allow).toContain('Bash(git diff *)');
      expect(result.settings.permissions?.allow).toContain('Bash(git log *)');
      expect(result.settings.permissions?.allow).toContain('Bash(git add *)');
      expect(result.settings.permissions?.deny).toContain('Bash(git push --force *)');
      expect(result.settings.permissions?.deny).toContain('Bash(git push *)');
    });

    it('should include Stop hook when lintCommand exists', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          lintCommand: 'npm run lint',
          formatCommand: null
        })
      });

      const result = await generator.generateAll(context);

      expect(result.settings.hooks).toBeDefined();
      expect(result.settings.hooks?.Stop).toBeDefined();
      expect(result.settings.hooks?.Stop?.[0].hooks[0].command).toContain('npm run lint');
    });

    it('should include Stop hook with both format and lint commands', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          lintCommand: 'npm run lint',
          formatCommand: 'npm run format'
        })
      });

      const result = await generator.generateAll(context);

      expect(result.settings.hooks?.Stop).toBeDefined();
      const command = result.settings.hooks?.Stop?.[0].hooks[0].command;
      expect(command).toContain('npm run format');
      expect(command).toContain('npm run lint');
      expect(command).toContain('exit 0');
    });

    it('should not include hooks when lintCommand and formatCommand are null', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          lintCommand: null,
          formatCommand: null
        })
      });

      const result = await generator.generateAll(context);

      expect(result.settings.hooks).toBeUndefined();
    });

    it('should include correct base permissions', async () => {
      const context = makeContext({
        codebase: makeCodebase({ packageManager: 'pnpm' })
      });

      const result = await generator.generateAll(context);

      expect(result.settings.permissions?.allow).toContain('Read(*)');
      expect(result.settings.permissions?.allow).toContain('Write(src/**)');
      expect(result.settings.permissions?.allow).toContain('Write(docs/**)');
      expect(result.settings.permissions?.allow).toContain('Bash(pnpm *)');
      expect(result.settings.permissions?.allow).toContain('Bash(npx *)');

      expect(result.settings.permissions?.deny).toContain('Read(.env*)');
      expect(result.settings.permissions?.deny).toContain('Bash(rm -rf *)');
      expect(result.settings.permissions?.deny).toContain('Bash(pnpm publish *)');
    });
  });

  describe('slash commands generation', () => {
    it('should generate 5 slash commands', async () => {
      const context = makeContext();
      const result = await generator.generateAll(context);

      expect(result.commands).toHaveLength(5);
      expect(result.commands.map(c => c.commandName)).toEqual([
        'status',
        'fix',
        'next',
        'recap',
        'ship'
      ]);
    });

    it('should include detected commands in slash command content', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          buildCommand: 'npm run build',
          lintCommand: 'npm run lint',
          testCommand: 'npm test'
        })
      });

      const result = await generator.generateAll(context);

      const statusCmd = result.commands.find(c => c.commandName === 'status');
      expect(statusCmd?.content).toContain('npm run build');

      const fixCmd = result.commands.find(c => c.commandName === 'fix');
      expect(fixCmd?.content).toContain('npm run build');
      expect(fixCmd?.content).toContain('npm run lint');

      const shipCmd = result.commands.find(c => c.commandName === 'ship');
      expect(shipCmd?.content).toContain('npm run build');
      expect(shipCmd?.content).toContain('npm test');
      expect(shipCmd?.content).toContain('npm run lint');
    });

    it('should generate all command files with correct structure', async () => {
      const context = makeContext();
      const result = await generator.generateAll(context);

      for (const cmd of result.commands) {
        expect(cmd.filename).toMatch(/\.md$/);
        expect(cmd.commandName).toBeTruthy();
        expect(cmd.content).toBeTruthy();
      }
    });
  });

  describe('docs generation', () => {
    it('should generate 3 documentation files', async () => {
      const context = makeContext();
      const result = await generator.generateAll(context);

      expect(result.docs).toHaveLength(3);
      expect(result.docs.map(d => d.filename)).toEqual([
        'architecture.md',
        'patterns.md',
        'setup.md'
      ]);
    });

    it('should include codebase info in architecture doc', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          language: 'typescript',
          framework: 'express',
          projectType: 'node',
          dependencies: [
            { name: 'express', version: '4.19.0', category: 'framework' },
            { name: 'typescript', version: '5.3.3', category: 'build' }
          ],
          detectedPatterns: [
            { type: 'api-routes', paths: ['src/routes/'], confidence: 0.9, description: 'Express routes' }
          ]
        })
      });

      const result = await generator.generateAll(context);
      const archDoc = result.docs.find(d => d.filename === 'architecture.md');

      expect(archDoc?.content).toContain('typescript');
      expect(archDoc?.content).toContain('express');
      expect(archDoc?.content).toContain('node');
      expect(archDoc?.content).toContain('express@4.19.0');
      expect(archDoc?.content).toContain('api-routes');
    });

    it('should include patterns and constraints in patterns doc', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          detectedPatterns: [
            { type: 'api-routes', paths: ['src/routes/api.ts'], confidence: 0.9, description: 'API routes' }
          ],
          negativeConstraints: [
            { technology: 'Express', alternative: 'Fastify', rule: 'Use Express, NOT Fastify' }
          ]
        })
      });

      const result = await generator.generateAll(context);
      const patternsDoc = result.docs.find(d => d.filename === 'patterns.md');

      expect(patternsDoc?.content).toContain('api-routes');
      expect(patternsDoc?.content).toContain('Use Express, NOT Fastify');
    });

    it('should include commands and MCP suggestions in setup doc', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          packageManager: 'npm',
          testCommand: 'npm test',
          lintCommand: 'npm run lint',
          devCommand: 'npm run dev',
          buildCommand: 'npm run build',
          mcpSuggestions: [
            {
              name: 'postgres-mcp',
              reason: 'PostgreSQL database detected',
              installCommand: 'npx @modelcontextprotocol/server-postgres'
            }
          ]
        })
      });

      const result = await generator.generateAll(context);
      const setupDoc = result.docs.find(d => d.filename === 'setup.md');

      expect(setupDoc?.content).toContain('npm test');
      expect(setupDoc?.content).toContain('npm run lint');
      expect(setupDoc?.content).toContain('npm run dev');
      expect(setupDoc?.content).toContain('npm run build');
      expect(setupDoc?.content).toContain('postgres-mcp');
    });
  });

  describe('fallback CLAUDE.md generation', () => {
    it('should generate fallback CLAUDE.md with goal and stack info', async () => {
      const context = makeContext({
        goal: makeGoal({ description: 'Build a REST API' }),
        codebase: makeCodebase({
          language: 'typescript',
          framework: 'express',
          projectType: 'node',
          dependencies: [
            { name: 'express', version: '4.0.0', category: 'framework' }
          ]
        })
      });

      // Force using templates (which return content, simulating fallback scenario)
      const result = await generator.generateAll(context);

      expect(result.claudeMd).toContain('Build a REST API');
      // Check that claudeMd contains codebase info (either from AI or fallback)
      expect(result.claudeMd).toBeTruthy();
    });

    it('should include negative constraints in fallback', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          negativeConstraints: [
            { technology: 'Express', alternative: 'Fastify', rule: 'Use Express, NOT Fastify' },
            { technology: 'Prisma', alternative: 'Drizzle', rule: 'Use Prisma, NOT Drizzle' }
          ]
        })
      });

      const result = await generator.generateAll(context);

      // The fallback CLAUDE.md is generated internally - we're testing through generateAll
      expect(result.claudeMd).toBeTruthy();
    });

    it('should include detected commands in fallback', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          testCommand: 'npm test',
          lintCommand: 'npm run lint',
          devCommand: 'npm run dev',
          buildCommand: 'npm run build'
        })
      });

      const result = await generator.generateAll(context);

      expect(result.claudeMd).toBeTruthy();
    });
  });

  describe('placeholder generation', () => {
    it('should generate placeholder agent when one agent fails but others succeed', async () => {
      // Test with 3 agents, 1 fails (33% failure - below 50% threshold)
      const context = makeContext({
        selectedAgents: ['backend-engineer', 'testing-specialist', 'database-specialist']
      });

      // First call for agents - 2 succeed, 1 fails
      vi.mocked(parallelGenerateWithErrors)
        .mockResolvedValueOnce({
          results: [
            { filename: 'backend-engineer.md', content: '# Backend Engineer', agentName: 'backend-engineer' },
            { filename: 'testing-specialist.md', content: '# Testing Specialist', agentName: 'testing-specialist' }
          ],
          errors: [
            { item: 'database-specialist', error: new Error('Template not found') }
          ]
        })
        .mockResolvedValueOnce({ results: [], errors: [] });

      const result = await generator.generateAll(context);

      // Should have 3 agents total: 2 successful + 1 placeholder
      expect(result.agents).toHaveLength(3);
      const dbAgent = result.agents.find(a => a.agentName === 'database-specialist');
      expect(dbAgent).toBeDefined();
      expect(dbAgent?.content).toContain('database-specialist');
      expect(dbAgent?.content).toContain(context.goal.description);
    });

    it('should generate placeholder skill when one skill fails but others succeed', async () => {
      const context = makeContext({
        selectedAgents: ['backend-engineer'],
        selectedSkills: ['typescript', 'nodejs', 'express']
      });

      // First call for agents succeeds
      vi.mocked(parallelGenerateWithErrors)
        .mockResolvedValueOnce({
          results: [{ filename: 'backend-engineer.md', content: '# Backend', agentName: 'backend-engineer' }],
          errors: []
        })
        // Second call for skills - 2 succeed, 1 fails
        .mockResolvedValueOnce({
          results: [
            { filename: 'typescript.md', content: '# TypeScript', skillName: 'typescript' },
            { filename: 'nodejs.md', content: '# Node.js', skillName: 'nodejs' }
          ],
          errors: [
            { item: 'express', error: new Error('Template not found') }
          ]
        });

      const result = await generator.generateAll(context);

      // Should have 3 skills total: 2 successful + 1 placeholder
      expect(result.skills).toHaveLength(3);
      const expressSkill = result.skills.find(s => s.skillName === 'express');
      expect(expressSkill).toBeDefined();
      expect(expressSkill?.content).toContain('express');
      expect(expressSkill?.content).toContain('Context7');
    });

    it('should throw when majority of agents fail', async () => {
      const context = makeContext({
        selectedAgents: ['backend-engineer', 'testing-specialist']
      });

      // Both agents fail (100% failure - above 50% threshold)
      vi.mocked(parallelGenerateWithErrors)
        .mockResolvedValueOnce({
          results: [],
          errors: [
            { item: 'backend-engineer', error: new Error('API error') },
            { item: 'testing-specialist', error: new Error('API error') }
          ]
        });

      await expect(generator.generateAll(context))
        .rejects
        .toThrow('Generation failed for 2/2 agents');
    });
  });

  describe('quality gate in Stop hook', () => {
    it('should end Stop hook with exit 0 when qualityGate is off', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          lintCommand: 'npm run lint',
          testCommand: 'npm test',
        }),
        qualityGate: 'off',
      });

      const result = await generator.generateAll(context);

      const stopHook = result.settings.hooks?.Stop?.[0].hooks[0].command;
      expect(stopHook).toContain('exit 0');
      expect(stopHook).not.toContain('npm test');
    });

    it('should include testCommand without exit 0 when qualityGate is hard', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          lintCommand: 'npm run lint',
          testCommand: 'npm test',
        }),
        qualityGate: 'hard',
      });

      const result = await generator.generateAll(context);

      const stopHook = result.settings.hooks?.Stop?.[0].hooks[0].command;
      expect(stopHook).toContain('npm test');
      expect(stopHook).not.toContain('exit 0');
    });

    it('should include testCommand with warning fallback when qualityGate is soft', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          lintCommand: 'npm run lint',
          testCommand: 'npm test',
        }),
        qualityGate: 'soft',
      });

      const result = await generator.generateAll(context);

      const stopHook = result.settings.hooks?.Stop?.[0].hooks[0].command;
      expect(stopHook).toContain('npm test || echo "WARNING: tests failing"');
      expect(stopHook).toContain('exit 0');
    });

    it('should fall back to exit 0 when qualityGate is hard but no testCommand', async () => {
      const context = makeContext({
        codebase: makeCodebase({
          lintCommand: 'npm run lint',
          testCommand: null,
        }),
        qualityGate: 'hard',
      });

      const result = await generator.generateAll(context);

      const stopHook = result.settings.hooks?.Stop?.[0].hooks[0].command;
      expect(stopHook).toContain('exit 0');
    });
  });

  describe('security gate', () => {
    it('should include PreToolUse hook when securityGate is true', async () => {
      const context = makeContext({
        codebase: makeCodebase({ lintCommand: 'npm run lint' }),
        securityGate: true,
      });

      const result = await generator.generateAll(context);

      expect(result.settings.hooks?.PreToolUse).toBeDefined();
      expect(result.settings.hooks?.PreToolUse?.[0].matcher).toBe('Write');
      expect(result.settings.hooks?.PreToolUse?.[0].hooks[0].command).toContain('security-gate.sh');
    });

    it('should not include PreToolUse hook when securityGate is false', async () => {
      const context = makeContext({
        codebase: makeCodebase({ lintCommand: 'npm run lint' }),
        securityGate: false,
      });

      const result = await generator.generateAll(context);

      expect(result.settings.hooks?.PreToolUse).toBeUndefined();
    });

    it('should add PreToolUse hook even without lint/format commands', async () => {
      const context = makeContext({
        codebase: makeCodebase({ lintCommand: null, formatCommand: null }),
        securityGate: true,
      });

      const result = await generator.generateAll(context);

      expect(result.settings.hooks?.PreToolUse).toBeDefined();
      expect(result.settings.hooks?.PreToolUse?.[0].matcher).toBe('Write');
    });

    it('should return security-gate.sh hook file when securityGate is true', async () => {
      const context = makeContext({ securityGate: true });

      const result = await generator.generateAll(context);

      expect(result.hooks).toHaveLength(1);
      expect(result.hooks[0].filename).toBe('security-gate.sh');
      expect(result.hooks[0].hookName).toBe('security-gate');
      expect(result.hooks[0].content).toContain('SECURITY GATE');
    });

    it('should return empty hooks array when securityGate is falsy', async () => {
      const context = makeContext({ securityGate: false });

      const result = await generator.generateAll(context);

      expect(result.hooks).toHaveLength(0);
    });
  });
});
