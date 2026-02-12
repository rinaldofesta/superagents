/**
 * Unit tests for the generation pipeline
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as p from '@clack/prompts';

import { runGenerationPipeline } from '../../src/pipeline.js';
import { CodebaseAnalyzer } from '../../src/analyzer/codebase-analyzer.js';
import { matchBlueprints } from '../../src/blueprints/matcher.js';
import { cache } from '../../src/cache/index.js';
import { displayDryRunPreview } from '../../src/cli/dry-run.js';
import * as prompts from '../../src/cli/prompts.js';
import { RecommendationEngine } from '../../src/context/recommendation-engine.js';
import { AIGenerator } from '../../src/generator/index.js';
import { OutputWriter } from '../../src/writer/index.js';

import type { CodebaseAnalysis } from '../../src/types/codebase.js';
import type { Recommendations } from '../../src/types/config.js';
import type { GenerationOutput, WriteSummary } from '../../src/types/generation.js';
import type { ProjectGoal, ProjectMode, ProjectSpec } from '../../src/types/goal.js';
import type { AuthResult } from '../../src/utils/auth.js';

// Mock dependencies
vi.mock('@clack/prompts');
vi.mock('../../src/analyzer/codebase-analyzer.js');
vi.mock('../../src/blueprints/matcher.js');
vi.mock('../../src/cache/index.js');
vi.mock('../../src/cli/dry-run.js');
vi.mock('../../src/cli/prompts.js');
vi.mock('../../src/context/recommendation-engine.js');
vi.mock('../../src/generator/index.js');
vi.mock('../../src/writer/index.js');
vi.mock('../../src/utils/logger.js', () => ({
  log: {
    debug: vi.fn(),
    verbose: vi.fn(),
    section: vi.fn(),
    table: vi.fn(),
  },
}));

function makeAuth(): AuthResult {
  return {
    method: 'env',
    apiKey: 'test-key',
  };
}

function makeCodebaseAnalysis(overrides: Partial<CodebaseAnalysis> = {}): CodebaseAnalysis {
  return {
    projectRoot: '/test',
    projectType: 'node',
    language: 'typescript',
    framework: 'nextjs',
    dependencies: [],
    devDependencies: [],
    fileStructure: [],
    totalFiles: 100,
    totalLines: 5000,
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

function makeProjectGoal(overrides: Partial<ProjectGoal> = {}): ProjectGoal {
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

function makeRecommendations(): Recommendations {
  return {
    agents: [
      { name: 'backend-engineer', score: 90, reasons: ['Backend work needed'] },
    ],
    skills: [
      { name: 'typescript', score: 95, reasons: ['TypeScript detected'] },
    ],
    defaultAgents: ['backend-engineer'],
    defaultSkills: ['typescript'],
    agentSkillLinks: {},
  };
}

function makeGenerationOutputs(): GenerationOutput[] {
  return [
    {
      type: 'claude-md',
      content: '# Project Config',
      path: '.claude/CLAUDE.md',
    },
  ];
}

function makeWriteSummary(): WriteSummary {
  return {
    written: ['.claude/CLAUDE.md'],
    skipped: [],
  };
}

describe('runGenerationPipeline', () => {
  let mockSpinner: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default spinner mock
    mockSpinner = {
      start: vi.fn(),
      stop: vi.fn(),
    };
    vi.mocked(p.spinner).mockReturnValue(mockSpinner as unknown as ReturnType<typeof p.spinner>);

    // Setup default cache mock
    vi.mocked(cache.init).mockResolvedValue(undefined);
    vi.mocked(cache.getCachedAnalysis).mockResolvedValue(null);
    vi.mocked(cache.setCachedAnalysis).mockResolvedValue(undefined);
  });

  describe('existing project flow', () => {
    it('should run complete pipeline for existing project', async () => {
      const mockCodebase = makeCodebaseAnalysis();
      const mockGoal = makeProjectGoal();
      const mockRecommendations = makeRecommendations();
      const mockOutputs = makeGenerationOutputs();
      const mockSummary = makeWriteSummary();

      // Mock mode detection
      vi.mocked(prompts.detectProjectMode).mockResolvedValue('existing');

      // Mock analyzer
      const mockAnalyze = vi.fn().mockResolvedValue(mockCodebase);
      vi.mocked(CodebaseAnalyzer).mockImplementation(function(this: CodebaseAnalyzer) {
        return {
          analyze: mockAnalyze,
        } as unknown as CodebaseAnalyzer;
      });

      // Mock prompts
      vi.mocked(prompts.collectProjectGoal).mockResolvedValue({
        description: mockGoal.description,
        category: mockGoal.category,
      });
      vi.mocked(prompts.selectModel).mockResolvedValue('sonnet');
      vi.mocked(prompts.selectTeam).mockResolvedValue({
        agents: ['backend-engineer'],
        skills: ['typescript'],
        autoLinkedSkills: [],
      });

      // Mock recommendation engine
      vi.mocked(RecommendationEngine).mockImplementation(function(this: RecommendationEngine) {
        return {
          recommend: vi.fn().mockReturnValue(mockRecommendations),
        } as unknown as RecommendationEngine;
      });

      // Mock generator
      vi.mocked(AIGenerator).mockImplementation(function(this: AIGenerator) {
        return {
          generateAll: vi.fn().mockResolvedValue(mockOutputs),
        } as unknown as AIGenerator;
      });

      // Mock writer
      vi.mocked(OutputWriter).mockImplementation(function(this: OutputWriter) {
        return {
          writeAll: vi.fn().mockResolvedValue(mockSummary),
        } as unknown as OutputWriter;
      });

      const result = await runGenerationPipeline({
        projectRoot: '/test',
        isDryRun: false,
        isVerbose: false,
        auth: makeAuth(),
      });

      expect(result).toBeDefined();
      expect(result!.summary).toEqual(mockSummary);
      expect(result!.codebaseAnalysis).toEqual(mockCodebase);
      expect(result!.projectMode).toBe('existing');

      // Verify flow
      expect(prompts.detectProjectMode).toHaveBeenCalledWith('/test');
      expect(mockAnalyze).toHaveBeenCalled();
      expect(prompts.collectProjectGoal).toHaveBeenCalledWith(mockCodebase);
      expect(prompts.selectModel).toHaveBeenCalled();
      expect(prompts.selectTeam).toHaveBeenCalled();
    });

    it('should use cached analysis when available', async () => {
      const mockCodebase = makeCodebaseAnalysis();
      const mockGoal = makeProjectGoal();
      const mockRecommendations = makeRecommendations();

      vi.mocked(prompts.detectProjectMode).mockResolvedValue('existing');
      vi.mocked(cache.getCachedAnalysis).mockResolvedValue(mockCodebase);
      vi.mocked(prompts.collectProjectGoal).mockResolvedValue({
        description: mockGoal.description,
        category: mockGoal.category,
      });
      vi.mocked(prompts.selectModel).mockResolvedValue('sonnet');
      vi.mocked(prompts.selectTeam).mockResolvedValue({
        agents: ['backend-engineer'],
        skills: ['typescript'],
        autoLinkedSkills: [],
      });

      vi.mocked(RecommendationEngine).mockImplementation(function(this: RecommendationEngine) { return {
        recommend: vi.fn().mockReturnValue(mockRecommendations),
      } as unknown as RecommendationEngine; });

      vi.mocked(AIGenerator).mockImplementation(function(this: AIGenerator) { return {
        generateAll: vi.fn().mockResolvedValue(makeGenerationOutputs()),
      } as unknown as AIGenerator; });

      vi.mocked(OutputWriter).mockImplementation(function(this: OutputWriter) { return {
        writeAll: vi.fn().mockResolvedValue(makeWriteSummary()),
      } as unknown as OutputWriter; });

      await runGenerationPipeline({
        projectRoot: '/test',
        isDryRun: false,
        isVerbose: false,
        auth: makeAuth(),
      });

      expect(cache.getCachedAnalysis).toHaveBeenCalledWith('/test');
      expect(CodebaseAnalyzer).not.toHaveBeenCalled();
      expect(mockSpinner.stop).toHaveBeenCalledWith(expect.stringContaining('(cached)'));
    });
  });

  describe('new project flow', () => {
    it('should run complete pipeline for new project', async () => {
      const mockSpec: ProjectSpec = {
        vision: 'Build a task app',
        stack: 'nextjs',
        focus: 'fullstack',
        requirements: ['auth', 'database'],
      };
      const mockCodebase = makeCodebaseAnalysis();
      const mockRecommendations = makeRecommendations();
      const mockOutputs = makeGenerationOutputs();
      const mockSummary = makeWriteSummary();

      vi.mocked(prompts.detectProjectMode).mockResolvedValue('new');
      vi.mocked(prompts.collectNewProjectSpec).mockResolvedValue(mockSpec);
      vi.mocked(prompts.specToGoal).mockReturnValue({
        description: 'Build a task app (full-stack with auth, database)',
        category: 'saas-dashboard',
        requirements: ['auth', 'database'],
      });
      vi.mocked(matchBlueprints).mockReturnValue([]);

      const mockAnalyze = vi.fn().mockResolvedValue(mockCodebase);
      vi.mocked(CodebaseAnalyzer).mockImplementation(function(this: CodebaseAnalyzer) { return {
        analyze: mockAnalyze,
      } as unknown as CodebaseAnalyzer; });

      vi.mocked(prompts.selectModel).mockResolvedValue('sonnet');
      vi.mocked(prompts.selectTeam).mockResolvedValue({
        agents: ['backend-engineer'],
        skills: ['typescript'],
        autoLinkedSkills: [],
      });

      vi.mocked(RecommendationEngine).mockImplementation(function(this: RecommendationEngine) { return {
        recommend: vi.fn().mockReturnValue(mockRecommendations),
      } as unknown as RecommendationEngine; });

      vi.mocked(AIGenerator).mockImplementation(function(this: AIGenerator) { return {
        generateAll: vi.fn().mockResolvedValue(mockOutputs),
      } as unknown as AIGenerator; });

      vi.mocked(OutputWriter).mockImplementation(function(this: OutputWriter) { return {
        writeAll: vi.fn().mockResolvedValue(mockSummary),
      } as unknown as OutputWriter; });

      const result = await runGenerationPipeline({
        projectRoot: '/test',
        isDryRun: false,
        isVerbose: false,
        auth: makeAuth(),
      });

      expect(result).toBeDefined();
      expect(result!.projectMode).toBe('new');
      expect(prompts.collectNewProjectSpec).toHaveBeenCalled();
      expect(prompts.specToGoal).toHaveBeenCalledWith(mockSpec);
    });

    it('should select blueprint for new project when matches exist', async () => {
      const mockSpec: ProjectSpec = {
        vision: 'Build a SaaS app',
        stack: 'nextjs',
        focus: 'fullstack',
        requirements: [],
      };
      const mockCodebase = makeCodebaseAnalysis();
      const mockRecommendations = makeRecommendations();

      vi.mocked(prompts.detectProjectMode).mockResolvedValue('new');
      vi.mocked(prompts.collectNewProjectSpec).mockResolvedValue(mockSpec);
      vi.mocked(prompts.specToGoal).mockReturnValue({
        description: 'Build a SaaS app (full-stack)',
        category: 'saas-dashboard',
        requirements: [],
      });

      vi.mocked(matchBlueprints).mockReturnValue([
        {
          blueprint: {
            id: 'saas-dashboard',
            name: 'SaaS Dashboard',
            description: 'Full SaaS',
            category: 'saas-dashboard',
            phases: [],
          },
          score: 90,
          reasons: ['Match'],
        },
      ]);
      vi.mocked(prompts.selectBlueprint).mockResolvedValue('saas-dashboard');

      const mockAnalyze = vi.fn().mockResolvedValue(mockCodebase);
      vi.mocked(CodebaseAnalyzer).mockImplementation(function(this: CodebaseAnalyzer) { return {
        analyze: mockAnalyze,
      } as unknown as CodebaseAnalyzer; });

      vi.mocked(prompts.selectModel).mockResolvedValue('sonnet');
      vi.mocked(prompts.selectTeam).mockResolvedValue({
        agents: ['backend-engineer'],
        skills: ['typescript'],
        autoLinkedSkills: [],
      });

      vi.mocked(RecommendationEngine).mockImplementation(function(this: RecommendationEngine) { return {
        recommend: vi.fn().mockReturnValue(mockRecommendations),
      } as unknown as RecommendationEngine; });

      vi.mocked(AIGenerator).mockImplementation(function(this: AIGenerator) { return {
        generateAll: vi.fn().mockResolvedValue(makeGenerationOutputs()),
      } as unknown as AIGenerator; });

      vi.mocked(OutputWriter).mockImplementation(function(this: OutputWriter) { return {
        writeAll: vi.fn().mockResolvedValue(makeWriteSummary()),
      } as unknown as OutputWriter; });

      await runGenerationPipeline({
        projectRoot: '/test',
        isDryRun: false,
        isVerbose: false,
        auth: makeAuth(),
      });

      expect(prompts.selectBlueprint).toHaveBeenCalled();
    });
  });

  describe('dry-run mode', () => {
    it('should show preview and return undefined in dry-run mode', async () => {
      const mockCodebase = makeCodebaseAnalysis();
      const mockGoal = makeProjectGoal();
      const mockRecommendations = makeRecommendations();

      vi.mocked(prompts.detectProjectMode).mockResolvedValue('existing');
      vi.mocked(cache.getCachedAnalysis).mockResolvedValue(mockCodebase);
      vi.mocked(prompts.collectProjectGoal).mockResolvedValue({
        description: mockGoal.description,
        category: mockGoal.category,
      });
      vi.mocked(prompts.selectModel).mockResolvedValue('sonnet');
      vi.mocked(prompts.selectTeam).mockResolvedValue({
        agents: ['backend-engineer'],
        skills: ['typescript'],
        autoLinkedSkills: [],
      });

      vi.mocked(RecommendationEngine).mockImplementation(function(this: RecommendationEngine) { return {
        recommend: vi.fn().mockReturnValue(mockRecommendations),
      } as unknown as RecommendationEngine; });

      const result = await runGenerationPipeline({
        projectRoot: '/test',
        isDryRun: true,
        isVerbose: false,
        auth: makeAuth(),
      });

      expect(result).toBeUndefined();
      expect(displayDryRunPreview).toHaveBeenCalled();
      expect(AIGenerator).not.toHaveBeenCalled();
      expect(OutputWriter).not.toHaveBeenCalled();
    });
  });

  describe('verbose mode', () => {
    it('should pass verbose flag to selectModel and context', async () => {
      const mockCodebase = makeCodebaseAnalysis();
      const mockGoal = makeProjectGoal();
      const mockRecommendations = makeRecommendations();

      vi.mocked(prompts.detectProjectMode).mockResolvedValue('existing');
      vi.mocked(cache.getCachedAnalysis).mockResolvedValue(mockCodebase);
      vi.mocked(prompts.collectProjectGoal).mockResolvedValue({
        description: mockGoal.description,
        category: mockGoal.category,
      });
      vi.mocked(prompts.selectModel).mockResolvedValue('opus');
      vi.mocked(prompts.selectTeam).mockResolvedValue({
        agents: ['backend-engineer'],
        skills: ['typescript'],
        autoLinkedSkills: [],
      });

      vi.mocked(RecommendationEngine).mockImplementation(function(this: RecommendationEngine) { return {
        recommend: vi.fn().mockReturnValue(mockRecommendations),
      } as unknown as RecommendationEngine; });

      const mockGenerateAll = vi.fn().mockResolvedValue(makeGenerationOutputs());
      vi.mocked(AIGenerator).mockImplementation(function(this: AIGenerator) { return {
        generateAll: mockGenerateAll,
      } as unknown as AIGenerator; });

      vi.mocked(OutputWriter).mockImplementation(function(this: OutputWriter) { return {
        writeAll: vi.fn().mockResolvedValue(makeWriteSummary()),
      } as unknown as OutputWriter; });

      await runGenerationPipeline({
        projectRoot: '/test',
        isDryRun: false,
        isVerbose: true,
        auth: makeAuth(),
      });

      expect(prompts.selectModel).toHaveBeenCalledWith(true);

      // Verify context passed to generator has verbose: true
      expect(mockGenerateAll).toHaveBeenCalledWith(
        expect.objectContaining({
          verbose: true,
        })
      );
    });
  });

  describe('cache integration', () => {
    it('should initialize cache at start', async () => {
      const mockCodebase = makeCodebaseAnalysis();
      const mockGoal = makeProjectGoal();
      const mockRecommendations = makeRecommendations();

      vi.mocked(prompts.detectProjectMode).mockResolvedValue('existing');
      vi.mocked(cache.getCachedAnalysis).mockResolvedValue(mockCodebase);
      vi.mocked(prompts.collectProjectGoal).mockResolvedValue({
        description: mockGoal.description,
        category: mockGoal.category,
      });
      vi.mocked(prompts.selectModel).mockResolvedValue('sonnet');
      vi.mocked(prompts.selectTeam).mockResolvedValue({
        agents: ['backend-engineer'],
        skills: ['typescript'],
        autoLinkedSkills: [],
      });

      vi.mocked(RecommendationEngine).mockImplementation(function(this: RecommendationEngine) { return {
        recommend: vi.fn().mockReturnValue(mockRecommendations),
      } as unknown as RecommendationEngine; });

      vi.mocked(AIGenerator).mockImplementation(function(this: AIGenerator) { return {
        generateAll: vi.fn().mockResolvedValue(makeGenerationOutputs()),
      } as unknown as AIGenerator; });

      vi.mocked(OutputWriter).mockImplementation(function(this: OutputWriter) { return {
        writeAll: vi.fn().mockResolvedValue(makeWriteSummary()),
      } as unknown as OutputWriter; });

      await runGenerationPipeline({
        projectRoot: '/test',
        isDryRun: false,
        isVerbose: false,
        auth: makeAuth(),
      });

      expect(cache.init).toHaveBeenCalled();
    });

    it('should cache analysis when not cached', async () => {
      const mockCodebase = makeCodebaseAnalysis();
      const mockGoal = makeProjectGoal();
      const mockRecommendations = makeRecommendations();

      vi.mocked(prompts.detectProjectMode).mockResolvedValue('existing');
      vi.mocked(cache.getCachedAnalysis).mockResolvedValue(null);

      const mockAnalyze = vi.fn().mockResolvedValue(mockCodebase);
      vi.mocked(CodebaseAnalyzer).mockImplementation(function(this: CodebaseAnalyzer) { return {
        analyze: mockAnalyze,
      } as unknown as CodebaseAnalyzer; });

      vi.mocked(prompts.collectProjectGoal).mockResolvedValue({
        description: mockGoal.description,
        category: mockGoal.category,
      });
      vi.mocked(prompts.selectModel).mockResolvedValue('sonnet');
      vi.mocked(prompts.selectTeam).mockResolvedValue({
        agents: ['backend-engineer'],
        skills: ['typescript'],
        autoLinkedSkills: [],
      });

      vi.mocked(RecommendationEngine).mockImplementation(function(this: RecommendationEngine) { return {
        recommend: vi.fn().mockReturnValue(mockRecommendations),
      } as unknown as RecommendationEngine; });

      vi.mocked(AIGenerator).mockImplementation(function(this: AIGenerator) { return {
        generateAll: vi.fn().mockResolvedValue(makeGenerationOutputs()),
      } as unknown as AIGenerator; });

      vi.mocked(OutputWriter).mockImplementation(function(this: OutputWriter) { return {
        writeAll: vi.fn().mockResolvedValue(makeWriteSummary()),
      } as unknown as OutputWriter; });

      await runGenerationPipeline({
        projectRoot: '/test',
        isDryRun: false,
        isVerbose: false,
        auth: makeAuth(),
      });

      expect(cache.setCachedAnalysis).toHaveBeenCalledWith('/test', mockCodebase);
    });
  });

  describe('generation context', () => {
    it('should build correct context for generator', async () => {
      const mockCodebase = makeCodebaseAnalysis({
        sampledFiles: [
          { path: 'src/index.ts', content: 'export {}', purpose: 'entry' },
        ],
      });
      const mockGoal = makeProjectGoal();
      const mockRecommendations = makeRecommendations();

      vi.mocked(prompts.detectProjectMode).mockResolvedValue('existing');
      vi.mocked(cache.getCachedAnalysis).mockResolvedValue(mockCodebase);
      vi.mocked(prompts.collectProjectGoal).mockResolvedValue({
        description: mockGoal.description,
        category: mockGoal.category,
      });
      vi.mocked(prompts.selectModel).mockResolvedValue('opus');
      vi.mocked(prompts.selectTeam).mockResolvedValue({
        agents: ['backend-engineer'],
        skills: ['typescript'],
        autoLinkedSkills: ['nodejs'],
      });

      vi.mocked(RecommendationEngine).mockImplementation(function(this: RecommendationEngine) { return {
        recommend: vi.fn().mockReturnValue(mockRecommendations),
      } as unknown as RecommendationEngine; });

      const mockGenerateAll = vi.fn().mockResolvedValue(makeGenerationOutputs());
      vi.mocked(AIGenerator).mockImplementation(function(this: AIGenerator) { return {
        generateAll: mockGenerateAll,
      } as unknown as AIGenerator; });

      vi.mocked(OutputWriter).mockImplementation(function(this: OutputWriter) { return {
        writeAll: vi.fn().mockResolvedValue(makeWriteSummary()),
      } as unknown as OutputWriter; });

      await runGenerationPipeline({
        projectRoot: '/test',
        isDryRun: false,
        isVerbose: true,
        auth: makeAuth(),
      });

      expect(mockGenerateAll).toHaveBeenCalledWith(
        expect.objectContaining({
          goal: expect.objectContaining({
            description: mockGoal.description,
            category: mockGoal.category,
          }),
          codebase: mockCodebase,
          selectedAgents: ['backend-engineer'],
          selectedSkills: ['typescript', 'nodejs'],
          selectedModel: 'opus',
          authMethod: 'env',
          apiKey: 'test-key',
          sampledFiles: mockCodebase.sampledFiles,
          verbose: true,
          dryRun: false,
          generatedAt: expect.any(String),
        })
      );
    });

    it('should include blueprint ID in context when selected', async () => {
      const mockSpec: ProjectSpec = {
        vision: 'Build app',
        stack: 'nextjs',
        focus: 'fullstack',
        requirements: [],
      };
      const mockCodebase = makeCodebaseAnalysis();
      const mockRecommendations = makeRecommendations();

      vi.mocked(prompts.detectProjectMode).mockResolvedValue('new');
      vi.mocked(prompts.collectNewProjectSpec).mockResolvedValue(mockSpec);
      vi.mocked(prompts.specToGoal).mockReturnValue({
        description: 'Build app',
        category: 'saas-dashboard',
        requirements: [],
      });
      vi.mocked(matchBlueprints).mockReturnValue([
        {
          blueprint: {
            id: 'saas-dashboard',
            name: 'SaaS',
            description: 'SaaS app',
            category: 'saas-dashboard',
            phases: [],
          },
          score: 90,
          reasons: [],
        },
      ]);
      vi.mocked(prompts.selectBlueprint).mockResolvedValue('saas-dashboard');

      const mockAnalyze = vi.fn().mockResolvedValue(mockCodebase);
      vi.mocked(CodebaseAnalyzer).mockImplementation(function(this: CodebaseAnalyzer) { return {
        analyze: mockAnalyze,
      } as unknown as CodebaseAnalyzer; });

      vi.mocked(prompts.selectModel).mockResolvedValue('sonnet');
      vi.mocked(prompts.selectTeam).mockResolvedValue({
        agents: ['backend-engineer'],
        skills: ['typescript'],
        autoLinkedSkills: [],
      });

      vi.mocked(RecommendationEngine).mockImplementation(function(this: RecommendationEngine) { return {
        recommend: vi.fn().mockReturnValue(mockRecommendations),
      } as unknown as RecommendationEngine; });

      const mockGenerateAll = vi.fn().mockResolvedValue(makeGenerationOutputs());
      vi.mocked(AIGenerator).mockImplementation(function(this: AIGenerator) { return {
        generateAll: mockGenerateAll,
      } as unknown as AIGenerator; });

      vi.mocked(OutputWriter).mockImplementation(function(this: OutputWriter) { return {
        writeAll: vi.fn().mockResolvedValue(makeWriteSummary()),
      } as unknown as OutputWriter; });

      await runGenerationPipeline({
        projectRoot: '/test',
        isDryRun: false,
        isVerbose: false,
        auth: makeAuth(),
      });

      expect(mockGenerateAll).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedBlueprint: 'saas-dashboard',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should propagate analyzer errors', async () => {
      vi.mocked(prompts.detectProjectMode).mockResolvedValue('existing');
      vi.mocked(cache.getCachedAnalysis).mockResolvedValue(null);

      const mockAnalyze = vi.fn().mockRejectedValue(new Error('Analysis failed'));
      vi.mocked(CodebaseAnalyzer).mockImplementation(function(this: CodebaseAnalyzer) { return {
        analyze: mockAnalyze,
      } as unknown as CodebaseAnalyzer; });

      await expect(
        runGenerationPipeline({
          projectRoot: '/test',
          isDryRun: false,
          isVerbose: false,
          auth: makeAuth(),
        })
      ).rejects.toThrow('Analysis failed');
    });

    it('should propagate generator errors', async () => {
      const mockCodebase = makeCodebaseAnalysis();
      const mockGoal = makeProjectGoal();
      const mockRecommendations = makeRecommendations();

      vi.mocked(prompts.detectProjectMode).mockResolvedValue('existing');
      vi.mocked(cache.getCachedAnalysis).mockResolvedValue(mockCodebase);
      vi.mocked(prompts.collectProjectGoal).mockResolvedValue({
        description: mockGoal.description,
        category: mockGoal.category,
      });
      vi.mocked(prompts.selectModel).mockResolvedValue('sonnet');
      vi.mocked(prompts.selectTeam).mockResolvedValue({
        agents: ['backend-engineer'],
        skills: ['typescript'],
        autoLinkedSkills: [],
      });

      vi.mocked(RecommendationEngine).mockImplementation(function(this: RecommendationEngine) { return {
        recommend: vi.fn().mockReturnValue(mockRecommendations),
      } as unknown as RecommendationEngine; });

      vi.mocked(AIGenerator).mockImplementation(function(this: AIGenerator) { return {
        generateAll: vi.fn().mockRejectedValue(new Error('Generation failed')),
      } as unknown as AIGenerator; });

      await expect(
        runGenerationPipeline({
          projectRoot: '/test',
          isDryRun: false,
          isVerbose: false,
          auth: makeAuth(),
        })
      ).rejects.toThrow('Generation failed');
    });

    it('should propagate writer errors', async () => {
      const mockCodebase = makeCodebaseAnalysis();
      const mockGoal = makeProjectGoal();
      const mockRecommendations = makeRecommendations();

      vi.mocked(prompts.detectProjectMode).mockResolvedValue('existing');
      vi.mocked(cache.getCachedAnalysis).mockResolvedValue(mockCodebase);
      vi.mocked(prompts.collectProjectGoal).mockResolvedValue({
        description: mockGoal.description,
        category: mockGoal.category,
      });
      vi.mocked(prompts.selectModel).mockResolvedValue('sonnet');
      vi.mocked(prompts.selectTeam).mockResolvedValue({
        agents: ['backend-engineer'],
        skills: ['typescript'],
        autoLinkedSkills: [],
      });

      vi.mocked(RecommendationEngine).mockImplementation(function(this: RecommendationEngine) { return {
        recommend: vi.fn().mockReturnValue(mockRecommendations),
      } as unknown as RecommendationEngine; });

      vi.mocked(AIGenerator).mockImplementation(function(this: AIGenerator) { return {
        generateAll: vi.fn().mockResolvedValue(makeGenerationOutputs()),
      } as unknown as AIGenerator; });

      vi.mocked(OutputWriter).mockImplementation(function(this: OutputWriter) { return {
        writeAll: vi.fn().mockRejectedValue(new Error('Write failed')),
      } as unknown as OutputWriter; });

      await expect(
        runGenerationPipeline({
          projectRoot: '/test',
          isDryRun: false,
          isVerbose: false,
          auth: makeAuth(),
        })
      ).rejects.toThrow('Write failed');
    });
  });
});
