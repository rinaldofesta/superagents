/**
 * Unit tests for CLI prompts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as p from '@clack/prompts';
import fs from 'fs-extra';
import { glob } from 'glob';

import {
  collectProjectGoal,
  collectNewProjectSpec,
  detectProjectMode,
  selectModel,
  selectTeam,
  selectBlueprint,
  confirmOverwrite,
  selectPackages,
  specToGoal,
} from '../../../src/cli/prompts.js';

import type { CodebaseAnalysis } from '../../../src/types/codebase.js';
import type { Recommendations } from '../../../src/types/config.js';
import type { BlueprintMatch } from '../../../src/types/blueprint.js';

// Mock dependencies
vi.mock('@clack/prompts');
vi.mock('fs-extra');
vi.mock('glob');
vi.mock('../../../src/cli/banner.js', () => ({
  AGENT_EXPERTS: {
    'backend-engineer': { expert: 'Backend Expert', domain: 'Server' },
    'frontend-engineer': { expert: 'Frontend Expert', domain: 'UI' },
  },
}));
vi.mock('../../../src/cli/colors.js', () => ({
  orange: (s: string) => s,
  bgOrange: (s: string) => s,
}));
vi.mock('../../../src/cli/display-names.js', () => ({
  DISPLAY_NAMES: {
    typescript: 'TypeScript',
    react: 'React',
    nextjs: 'Next.js',
  },
}));

function makeCodebaseAnalysis(overrides: Partial<CodebaseAnalysis> = {}): CodebaseAnalysis {
  return {
    projectRoot: '/test',
    projectType: 'node',
    language: 'typescript',
    framework: 'nextjs',
    dependencies: [{ name: 'react', version: '18.0.0' }],
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

function makeRecommendations(overrides: Partial<Recommendations> = {}): Recommendations {
  return {
    agents: [
      { name: 'backend-engineer', score: 90, reasons: ['Backend work needed'] },
      { name: 'frontend-engineer', score: 80, reasons: ['UI work needed'] },
    ],
    skills: [
      { name: 'typescript', score: 95, reasons: ['TypeScript detected'] },
      { name: 'react', score: 85, reasons: ['React detected'] },
    ],
    defaultAgents: ['backend-engineer'],
    defaultSkills: ['typescript'],
    agentSkillLinks: {
      'backend-engineer': ['typescript'],
    },
    ...overrides,
  };
}

describe('collectProjectGoal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should collect goal with codebase analysis', async () => {
    const mockCodebase = makeCodebaseAnalysis();
    vi.mocked(p.intro).mockReturnValue(undefined);
    vi.mocked(p.note).mockReturnValue(undefined);
    vi.mocked(p.text).mockResolvedValue('Add authentication system');
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await collectProjectGoal(mockCodebase);

    expect(result).toEqual({
      description: 'Add authentication system',
      category: 'auth-service',
    });
    expect(p.intro).toHaveBeenCalledTimes(1);
    expect(p.note).toHaveBeenCalledTimes(1);
  });

  it('should validate text input is not empty', async () => {
    const mockCodebase = makeCodebaseAnalysis();
    let validateFn: ((value: string) => string | undefined) | undefined;

    vi.mocked(p.text).mockImplementation(async (options) => {
      validateFn = options.validate;
      return 'Valid input that is long enough';
    });

    await collectProjectGoal(mockCodebase);

    expect(validateFn).toBeDefined();
    expect(validateFn!('')).toBe('Tell us a bit more so we can find the right specialists for you');
    expect(validateFn!('short')).toBe('A few more details will help us match you with the best team');
    expect(validateFn!('This is a valid long description')).toBeUndefined();
  });

  it('should handle cancellation during text input', async () => {
    const mockCodebase = makeCodebaseAnalysis();
    const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as never);

    vi.mocked(p.intro).mockReturnValue(undefined);
    vi.mocked(p.note).mockReturnValue(undefined);
    const cancelSymbol = Symbol.for('clack.cancel');
    vi.mocked(p.text).mockResolvedValue(cancelSymbol);
    vi.mocked(p.isCancel).mockImplementation((value) => value === cancelSymbol);
    vi.mocked(p.cancel).mockReturnValue(undefined);

    await expect(collectProjectGoal(mockCodebase)).rejects.toThrow('process.exit called');

    expect(p.cancel).toHaveBeenCalledWith('Operation cancelled');
    expect(mockExit).toHaveBeenCalledWith(0);

    mockExit.mockRestore();
  });

  it('should use full flow without codebase analysis', async () => {
    const mockGroupResult = {
      description: 'Build a marketing campaign',
      category: 'marketing-campaign',
    };

    vi.mocked(p.intro).mockReturnValue(undefined);
    vi.mocked(p.group).mockResolvedValue(mockGroupResult);

    const result = await collectProjectGoal();

    expect(result).toEqual(mockGroupResult);
    expect(p.group).toHaveBeenCalledTimes(1);
  });

  // Note: Category detection logic is tested in the "prefer text-based category" test below

  it('should prefer text-based category over codebase-inferred category', async () => {
    const mockCodebase = makeCodebaseAnalysis({
      framework: 'nextjs',
      dependencies: [{ name: 'stripe', version: '1.0.0' }]
    });

    vi.mocked(p.intro).mockReturnValue(undefined);
    vi.mocked(p.note).mockReturnValue(undefined);
    // Goal mentions API, not ecommerce - should use text category
    vi.mocked(p.text).mockResolvedValue('Build REST API endpoints for mobile app');
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await collectProjectGoal(mockCodebase);

    expect(result.category).toBe('api-service'); // from text, not 'ecommerce' from stripe dep
  });
});

describe('selectModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return sonnet by default when showPicker is false', async () => {
    const result = await selectModel(false);
    expect(result).toBe('sonnet');
    expect(p.group).not.toHaveBeenCalled();
  });

  it('should show picker and return selected model', async () => {
    vi.mocked(p.group).mockResolvedValue({ model: 'opus' });

    const result = await selectModel(true);

    expect(result).toBe('opus');
    expect(p.group).toHaveBeenCalledTimes(1);
  });

  it('should handle cancellation', async () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    // Mock group to simulate cancellation via onCancel
    vi.mocked(p.group).mockImplementation(async (_prompts, options) => {
      if (options?.onCancel) {
        options.onCancel();
      }
      return { model: 'sonnet' };
    });

    await selectModel(true);

    expect(p.cancel).toHaveBeenCalledWith('Operation cancelled');
    expect(mockExit).toHaveBeenCalledWith(0);

    mockExit.mockRestore();
  });
});

describe('selectBlueprint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when no matches provided', async () => {
    const result = await selectBlueprint([]);
    expect(result).toBeNull();
    expect(p.select).not.toHaveBeenCalled();
  });

  it('should show blueprint options and return selected ID', async () => {
    const matches: BlueprintMatch[] = [
      {
        blueprint: {
          id: 'saas-dashboard',
          name: 'SaaS Dashboard',
          description: 'Full-featured dashboard',
          category: 'saas-dashboard',
          phases: [
            { id: 'phase-1', title: 'Setup', tasks: [{ id: 't1', title: 'Init', description: 'Setup' }] },
          ],
        },
        score: 90,
        reasons: ['Perfect match'],
      },
    ];

    vi.mocked(p.select).mockResolvedValue('saas-dashboard');
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await selectBlueprint(matches);

    expect(result).toBe('saas-dashboard');
    expect(p.select).toHaveBeenCalledTimes(1);
  });

  it('should return null when skip is selected', async () => {
    const matches: BlueprintMatch[] = [
      {
        blueprint: {
          id: 'saas-dashboard',
          name: 'SaaS Dashboard',
          description: 'Dashboard',
          category: 'saas-dashboard',
          phases: [],
        },
        score: 90,
        reasons: ['Match'],
      },
    ];

    vi.mocked(p.select).mockResolvedValue('skip');
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await selectBlueprint(matches);

    expect(result).toBeNull();
  });

  it('should handle cancellation', async () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const matches: BlueprintMatch[] = [
      {
        blueprint: {
          id: 'saas-dashboard',
          name: 'SaaS Dashboard',
          description: 'Dashboard',
          category: 'saas-dashboard',
          phases: [],
        },
        score: 90,
        reasons: ['Match'],
      },
    ];

    vi.mocked(p.select).mockResolvedValue(Symbol.for('clack.cancel'));
    vi.mocked(p.isCancel).mockReturnValue(true);

    await selectBlueprint(matches);

    expect(p.cancel).toHaveBeenCalledWith('Operation cancelled');
    expect(mockExit).toHaveBeenCalledWith(0);

    mockExit.mockRestore();
  });
});

describe('selectTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should select team with auto-linked skills', async () => {
    const recommendations = makeRecommendations();

    vi.mocked(p.note).mockReturnValue(undefined);
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce(['backend-engineer']) // agent selection
      .mockResolvedValueOnce(['typescript', 'react']); // skill selection
    vi.mocked(p.confirm).mockResolvedValue(true); // adjust skills
    vi.mocked(p.select).mockResolvedValue('confirm');
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await selectTeam(recommendations);

    expect(result.agents).toEqual(['backend-engineer']);
    expect(result.skills).toContain('typescript');
    expect(result.autoLinkedSkills).toEqual(['typescript']);
  });

  it('should handle user declining to adjust skills', async () => {
    const recommendations = makeRecommendations();

    vi.mocked(p.note).mockReturnValue(undefined);
    vi.mocked(p.multiselect).mockResolvedValue(['backend-engineer']);
    vi.mocked(p.confirm).mockResolvedValue(false); // don't adjust skills
    vi.mocked(p.select).mockResolvedValue('confirm');
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await selectTeam(recommendations);

    expect(result.agents).toEqual(['backend-engineer']);
    // Should use auto-linked + defaults
    expect(result.skills).toEqual(['typescript']);
  });

  it('should allow changing team selection', async () => {
    const recommendations = makeRecommendations();

    vi.mocked(p.note).mockReturnValue(undefined);
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce(['backend-engineer'])
      .mockResolvedValueOnce(['frontend-engineer']);
    vi.mocked(p.confirm).mockResolvedValue(false);
    vi.mocked(p.select)
      .mockResolvedValueOnce('change') // go back
      .mockResolvedValueOnce('confirm'); // then confirm
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await selectTeam(recommendations);

    expect(result.agents).toEqual(['frontend-engineer']);
    expect(p.multiselect).toHaveBeenCalledTimes(2);
  });

  it('should handle cancellation during agent selection', async () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const recommendations = makeRecommendations();

    vi.mocked(p.note).mockReturnValue(undefined);
    const cancelSymbol = Symbol.for('clack.cancel');
    vi.mocked(p.multiselect).mockResolvedValue(cancelSymbol);
    // Mock isCancel to return true for cancel symbol
    const originalIsCancel = vi.mocked(p.isCancel);
    vi.mocked(p.isCancel).mockImplementation((value) => value === cancelSymbol);

    try {
      await selectTeam(recommendations);
    } catch {
      // Swallow process.exit
    }

    expect(p.cancel).toHaveBeenCalledWith('Operation cancelled');
    expect(mockExit).toHaveBeenCalledWith(0);

    // Restore
    vi.mocked(p.isCancel).mockImplementation(originalIsCancel);
    mockExit.mockRestore();
  });

  it('should handle empty skill recommendations', async () => {
    const recommendations = makeRecommendations({ skills: [] });

    vi.mocked(p.note).mockReturnValue(undefined);
    vi.mocked(p.multiselect).mockResolvedValue(['backend-engineer']);
    vi.mocked(p.select).mockResolvedValue('confirm');
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await selectTeam(recommendations);

    expect(result.agents).toEqual(['backend-engineer']);
    expect(p.confirm).not.toHaveBeenCalled(); // no skill adjustment prompt
  });
});

describe('confirmOverwrite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when user confirms', async () => {
    vi.mocked(p.confirm).mockResolvedValue(true);
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await confirmOverwrite();

    expect(result).toBe(true);
  });

  it('should return false when user declines', async () => {
    vi.mocked(p.confirm).mockResolvedValue(false);
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await confirmOverwrite();

    expect(result).toBe(false);
  });

  it('should return false on cancellation', async () => {
    vi.mocked(p.confirm).mockResolvedValue(Symbol.for('clack.cancel'));
    vi.mocked(p.isCancel).mockReturnValue(true);

    const result = await confirmOverwrite();

    expect(result).toBe(false);
  });

  it('should use custom directory name in message', async () => {
    vi.mocked(p.confirm).mockResolvedValue(true);
    vi.mocked(p.isCancel).mockReturnValue(false);

    await confirmOverwrite('custom-dir');

    expect(p.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'custom-dir already exists. Replace it with new config?',
      })
    );
  });
});

describe('selectPackages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display packages and return selections', async () => {
    const packages = [
      { name: 'frontend', relativePath: 'packages/frontend', absolutePath: '/test/packages/frontend' },
      { name: 'backend', relativePath: 'packages/backend', absolutePath: '/test/packages/backend' },
    ];

    vi.mocked(p.note).mockReturnValue(undefined);
    vi.mocked(p.multiselect).mockResolvedValue(['packages/frontend', 'packages/backend']);
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await selectPackages(packages);

    expect(result).toEqual(['packages/frontend', 'packages/backend']);
    expect(p.note).toHaveBeenCalledTimes(1);
  });

  it('should handle cancellation', async () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const packages = [
      { name: 'frontend', relativePath: 'packages/frontend', absolutePath: '/test/packages/frontend' },
    ];

    vi.mocked(p.note).mockReturnValue(undefined);
    vi.mocked(p.multiselect).mockResolvedValue(Symbol.for('clack.cancel'));
    vi.mocked(p.isCancel).mockReturnValue(true);

    await selectPackages(packages);

    expect(p.cancel).toHaveBeenCalledWith('Operation cancelled');
    expect(mockExit).toHaveBeenCalledWith(0);

    mockExit.mockRestore();
  });
});

describe('detectProjectMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect existing project with package.json and src/', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    vi.mocked(glob).mockResolvedValue(['src/index.ts', 'src/utils.ts']);

    const result = await detectProjectMode('/test');

    expect(result).toBe('existing');
  });

  it('should detect new project without package.json', async () => {
    vi.mocked(fs.pathExists)
      .mockResolvedValueOnce(false) // no package.json
      .mockResolvedValueOnce(false); // no src/
    vi.mocked(glob).mockResolvedValue([]);

    const result = await detectProjectMode('/test');

    expect(result).toBe('new');
  });

  it('should detect new project with package.json but no src/ and few files', async () => {
    vi.mocked(fs.pathExists)
      .mockResolvedValueOnce(true) // has package.json
      .mockResolvedValueOnce(false); // no src/
    vi.mocked(glob).mockResolvedValue(['index.js']); // only 1 file

    const result = await detectProjectMode('/test');

    expect(result).toBe('new');
  });

  it('should detect existing project with many code files', async () => {
    vi.mocked(fs.pathExists)
      .mockResolvedValueOnce(true) // has package.json
      .mockResolvedValueOnce(false); // no src/
    vi.mocked(glob).mockResolvedValue(['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts', 'f.ts']);

    const result = await detectProjectMode('/test');

    expect(result).toBe('existing');
  });

  it('should handle glob errors gracefully', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(glob).mockRejectedValue(new Error('Glob failed'));

    const result = await detectProjectMode('/test');

    expect(result).toBe('new'); // Should default to 'new' on error
  });
});

describe('collectNewProjectSpec', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should collect complete project spec', async () => {
    const mockAnswers = {
      vision: 'A task management app',
      stack: 'nextjs',
      focus: 'fullstack',
      requirements: ['auth', 'database'],
    };

    vi.mocked(p.intro).mockReturnValue(undefined);
    vi.mocked(p.group).mockResolvedValue(mockAnswers);

    const result = await collectNewProjectSpec();

    expect(result).toEqual(mockAnswers);
  });

  it('should validate vision text length', async () => {
    let validateFn: ((value: string) => string | undefined) | undefined;

    vi.mocked(p.intro).mockReturnValue(undefined);
    vi.mocked(p.group).mockImplementation(async (prompts) => {
      const visionPrompt = prompts.vision as () => Promise<unknown>;
      // Capture the text validation by calling the prompt generator
      vi.mocked(p.text).mockImplementation(async (options) => {
        validateFn = options.validate;
        return 'Valid vision text';
      });
      await visionPrompt();
      return {
        vision: 'Valid vision text',
        stack: 'nextjs',
        focus: 'fullstack',
        requirements: [],
      };
    });

    await collectNewProjectSpec();

    expect(validateFn).toBeDefined();
    expect(validateFn!('')).toBe('Tell us what you have in mind so we can assemble the right team');
    expect(validateFn!('short')).toBe('A few more details will help us find the best specialists');
    expect(validateFn!('A valid long vision description')).toBeUndefined();
  });

  it('should handle cancellation', async () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    vi.mocked(p.intro).mockReturnValue(undefined);
    vi.mocked(p.group).mockImplementation(async (_prompts, options) => {
      if (options?.onCancel) {
        options.onCancel();
      }
      return {};
    });

    await collectNewProjectSpec();

    expect(p.cancel).toHaveBeenCalledWith('Operation cancelled');
    expect(mockExit).toHaveBeenCalledWith(0);

    mockExit.mockRestore();
  });
});

describe('specToGoal', () => {
  it('should convert nextjs spec to saas-dashboard category', () => {
    const spec = {
      vision: 'Build a task manager',
      stack: 'nextjs' as const,
      focus: 'fullstack' as const,
      requirements: ['auth', 'database'] as const[],
    };

    const result = specToGoal(spec);

    expect(result).toEqual({
      description: 'Build a task manager (full-stack with auth, database)',
      category: 'saas-dashboard',
      requirements: ['auth', 'database'],
    });
  });

  it('should convert python-fastapi spec to api-service category', () => {
    const spec = {
      vision: 'Build a REST API',
      stack: 'python-fastapi' as const,
      focus: 'api' as const,
      requirements: [] as const[],
    };

    const result = specToGoal(spec);

    expect(result).toEqual({
      description: 'Build a REST API (API-first)',
      category: 'api-service',
      requirements: [],
    });
  });

  it('should handle other stack as custom category', () => {
    const spec = {
      vision: 'Build something unique',
      stack: 'other' as const,
      focus: 'backend' as const,
      requirements: ['api'] as const[],
    };

    const result = specToGoal(spec);

    expect(result).toEqual({
      description: 'Build something unique (backend-focused with api)',
      category: 'custom',
      requirements: ['api'],
    });
  });

  it('should handle empty requirements', () => {
    const spec = {
      vision: 'Simple app',
      stack: 'react-node' as const,
      focus: 'frontend' as const,
      requirements: [] as const[],
    };

    const result = specToGoal(spec);

    expect(result).toEqual({
      description: 'Simple app (frontend-focused)',
      category: 'saas-dashboard',
      requirements: [],
    });
  });
});
