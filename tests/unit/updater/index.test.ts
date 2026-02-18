/**
 * Unit tests for ConfigUpdater
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { ConfigUpdater } from '../../../src/updater/index.js';
import type { GenerationContext } from '../../../src/types/generation.js';
import { makeCodebase, makeGoal } from '../../helpers/fixtures.js';

// Mock external dependencies
vi.mock('@clack/prompts', () => ({
  note: vi.fn(),
  select: vi.fn(),
  multiselect: vi.fn(),
  isCancel: vi.fn().mockReturnValue(false),
  cancel: vi.fn(),
}));

const mockGenerateAll = vi.fn().mockResolvedValue({
  claudeMd: '# Generated CLAUDE.md',
  agents: [
    { filename: 'backend-engineer.md', content: '# Backend Engineer', agentName: 'backend-engineer' }
  ],
  skills: [
    { filename: 'typescript.md', content: '# TypeScript', skillName: 'typescript' }
  ],
  settings: {},
  commands: [],
  docs: [],
});

vi.mock('../../../src/generator/index.js', () => ({
  AIGenerator: class MockAIGenerator {
    generateAll = mockGenerateAll;
  }
}));

vi.mock('../../../src/utils/logger.js', () => ({
  log: { debug: vi.fn() }
}));

import * as p from '@clack/prompts';
import { AIGenerator } from '../../../src/generator/index.js';

describe('ConfigUpdater', () => {
  let tmpDir: string;
  let updater: ConfigUpdater;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'updater-test-'));
    updater = new ConfigUpdater(tmpDir);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  describe('hasExistingConfig', () => {
    it('should return true when .claude/ directory exists', async () => {
      await fs.ensureDir(path.join(tmpDir, '.claude'));

      const result = await updater.hasExistingConfig();

      expect(result).toBe(true);
    });

    it('should return false when .claude/ directory does not exist', async () => {
      const result = await updater.hasExistingConfig();

      expect(result).toBe(false);
    });

    it('should return false for empty project root', async () => {
      const emptyUpdater = new ConfigUpdater(path.join(tmpDir, 'nonexistent'));

      const result = await emptyUpdater.hasExistingConfig();

      expect(result).toBe(false);
    });
  });

  describe('readExisting', () => {
    it('should return empty arrays when no config exists', async () => {
      await fs.ensureDir(path.join(tmpDir, '.claude'));

      const result = await updater.readExisting();

      expect(result.agents).toEqual([]);
      expect(result.skills).toEqual([]);
      expect(result.settings).toEqual({});
    });

    it('should read agents from .claude/agents/', async () => {
      const agentsDir = path.join(tmpDir, '.claude', 'agents');
      await fs.ensureDir(agentsDir);
      await fs.writeFile(path.join(agentsDir, 'backend-engineer.md'), '# Backend');
      await fs.writeFile(path.join(agentsDir, 'frontend-engineer.md'), '# Frontend');

      const result = await updater.readExisting();

      expect(result.agents).toEqual(['backend-engineer', 'frontend-engineer']);
    });

    it('should read skills from .claude/skills/', async () => {
      const skillsDir = path.join(tmpDir, '.claude', 'skills');
      await fs.ensureDir(skillsDir);
      await fs.writeFile(path.join(skillsDir, 'typescript.md'), '# TypeScript');
      await fs.writeFile(path.join(skillsDir, 'react.md'), '# React');

      const result = await updater.readExisting();

      expect(result.skills).toHaveLength(2);
      expect(result.skills).toContain('typescript');
      expect(result.skills).toContain('react');
    });

    it('should read settings.json when it exists', async () => {
      await fs.ensureDir(path.join(tmpDir, '.claude'));
      const settingsPath = path.join(tmpDir, '.claude', 'settings.json');
      await fs.writeJSON(settingsPath, {
        agents: ['backend-engineer'],
        skills: ['typescript'],
        model: 'claude-sonnet-4-5-20250929'
      });

      const result = await updater.readExisting();

      expect(result.settings.agents).toEqual(['backend-engineer']);
      expect(result.settings.skills).toEqual(['typescript']);
      expect(result.settings.model).toBe('claude-sonnet-4-5-20250929');
    });

    it('should ignore non-markdown files in agents/', async () => {
      const agentsDir = path.join(tmpDir, '.claude', 'agents');
      await fs.ensureDir(agentsDir);
      await fs.writeFile(path.join(agentsDir, 'backend-engineer.md'), '# Backend');
      await fs.writeFile(path.join(agentsDir, 'readme.txt'), 'Not markdown');
      await fs.writeFile(path.join(agentsDir, '.DS_Store'), 'System file');

      const result = await updater.readExisting();

      expect(result.agents).toEqual(['backend-engineer']);
    });

    it('should ignore non-markdown files in skills/', async () => {
      const skillsDir = path.join(tmpDir, '.claude', 'skills');
      await fs.ensureDir(skillsDir);
      await fs.writeFile(path.join(skillsDir, 'typescript.md'), '# TypeScript');
      await fs.writeFile(path.join(skillsDir, 'notes.txt'), 'Notes');

      const result = await updater.readExisting();

      expect(result.skills).toEqual(['typescript']);
    });

    it('should handle both agents and skills', async () => {
      const agentsDir = path.join(tmpDir, '.claude', 'agents');
      const skillsDir = path.join(tmpDir, '.claude', 'skills');
      await fs.ensureDir(agentsDir);
      await fs.ensureDir(skillsDir);
      await fs.writeFile(path.join(agentsDir, 'backend-engineer.md'), '# Backend');
      await fs.writeFile(path.join(skillsDir, 'typescript.md'), '# TypeScript');

      const result = await updater.readExisting();

      expect(result.agents).toEqual(['backend-engineer']);
      expect(result.skills).toEqual(['typescript']);
    });
  });

  describe('promptUpdateOptions', () => {
    it('should call note with current configuration', async () => {
      const existing = { agents: ['backend-engineer'], skills: ['typescript'], settings: {} };
      const available = { agents: ['frontend-engineer'], skills: ['react'] };

      vi.mocked(p.select).mockResolvedValue('add');
      vi.mocked(p.multiselect).mockResolvedValue([]);

      await updater.promptUpdateOptions(existing, available);

      expect(p.note).toHaveBeenCalled();
    });

    it('should return add selections when action is add', async () => {
      const existing = { agents: ['backend-engineer'], skills: ['typescript'], settings: {} };
      const available = { agents: ['backend-engineer', 'frontend-engineer'], skills: ['typescript', 'react'] };

      vi.mocked(p.select).mockResolvedValue('add');
      vi.mocked(p.multiselect)
        .mockResolvedValueOnce(['frontend-engineer'])
        .mockResolvedValueOnce(['react']);

      const result = await updater.promptUpdateOptions(existing, available);

      expect(result.agentsToAdd).toEqual(['frontend-engineer']);
      expect(result.skillsToAdd).toEqual(['react']);
      expect(result.agentsToRemove).toEqual([]);
      expect(result.skillsToRemove).toEqual([]);
      expect(result.regenerateClaudeMd).toBe(false);
    });

    it('should return remove selections when action is remove', async () => {
      const existing = { agents: ['backend-engineer', 'frontend-engineer'], skills: ['typescript', 'react'], settings: {} };
      const available = { agents: [], skills: [] };

      vi.mocked(p.select).mockResolvedValue('remove');
      vi.mocked(p.multiselect)
        .mockResolvedValueOnce(['backend-engineer'])
        .mockResolvedValueOnce(['typescript']);

      const result = await updater.promptUpdateOptions(existing, available);

      expect(result.agentsToAdd).toEqual([]);
      expect(result.skillsToAdd).toEqual([]);
      expect(result.agentsToRemove).toEqual(['backend-engineer']);
      expect(result.skillsToRemove).toEqual(['typescript']);
      expect(result.regenerateClaudeMd).toBe(false);
    });

    it('should return both add and remove when action is both', async () => {
      const existing = { agents: ['backend-engineer'], skills: ['typescript'], settings: {} };
      const available = { agents: ['backend-engineer', 'frontend-engineer'], skills: ['typescript', 'react'] };

      vi.mocked(p.select).mockResolvedValue('both');
      vi.mocked(p.multiselect)
        .mockResolvedValueOnce(['frontend-engineer']) // add agents
        .mockResolvedValueOnce(['react']) // add skills
        .mockResolvedValueOnce(['backend-engineer']) // remove agents
        .mockResolvedValueOnce(['typescript']); // remove skills

      const result = await updater.promptUpdateOptions(existing, available);

      expect(result.agentsToAdd).toEqual(['frontend-engineer']);
      expect(result.skillsToAdd).toEqual(['react']);
      expect(result.agentsToRemove).toEqual(['backend-engineer']);
      expect(result.skillsToRemove).toEqual(['typescript']);
      expect(result.regenerateClaudeMd).toBe(false);
    });

    it('should set regenerateClaudeMd when action is regenerate', async () => {
      const existing = { agents: ['backend-engineer'], skills: ['typescript'], settings: {} };
      const available = { agents: [], skills: [] };

      vi.mocked(p.select).mockResolvedValue('regenerate');

      const result = await updater.promptUpdateOptions(existing, available);

      expect(result.agentsToAdd).toEqual([]);
      expect(result.skillsToAdd).toEqual([]);
      expect(result.agentsToRemove).toEqual([]);
      expect(result.skillsToRemove).toEqual([]);
      expect(result.regenerateClaudeMd).toBe(true);
    });

    it('should exit when action selection is cancelled', async () => {
      const existing = { agents: [], skills: [], settings: {} };
      const available = { agents: [], skills: [] };

      vi.mocked(p.isCancel).mockReturnValue(true);
      vi.mocked(p.select).mockResolvedValue('cancel');

      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      await updater.promptUpdateOptions(existing, available);

      expect(mockExit).toHaveBeenCalledWith(0);
      mockExit.mockRestore();
    });

    it('should skip add prompts when no addable items', async () => {
      const existing = { agents: ['backend-engineer'], skills: ['typescript'], settings: {} };
      const available = { agents: ['backend-engineer'], skills: ['typescript'] };

      vi.mocked(p.select).mockResolvedValue('add');
      vi.mocked(p.isCancel).mockReturnValue(false);

      const result = await updater.promptUpdateOptions(existing, available);

      expect(p.multiselect).not.toHaveBeenCalled();
      expect(result.agentsToAdd).toEqual([]);
      expect(result.skillsToAdd).toEqual([]);
    });

    it('should skip remove prompts when no existing items', async () => {
      const existing = { agents: [], skills: [], settings: {} };
      const available = { agents: ['backend-engineer'], skills: ['typescript'] };

      vi.mocked(p.select).mockResolvedValue('remove');
      vi.mocked(p.isCancel).mockReturnValue(false);

      const result = await updater.promptUpdateOptions(existing, available);

      expect(p.multiselect).not.toHaveBeenCalled();
      expect(result.agentsToRemove).toEqual([]);
      expect(result.skillsToRemove).toEqual([]);
    });
  });

  describe('applyUpdates', () => {
    const makeContext = (): GenerationContext => ({
      goal: makeGoal(),
      codebase: makeCodebase({ projectRoot: tmpDir }),
      selectedAgents: [],
      selectedSkills: [],
      selectedModel: 'sonnet',
      authMethod: 'api-key',
      apiKey: 'sk-ant-test',
      sampledFiles: [],
      generatedAt: new Date().toISOString()
    });

    beforeEach(async () => {
      // Setup .claude structure
      await fs.ensureDir(path.join(tmpDir, '.claude', 'agents'));
      await fs.ensureDir(path.join(tmpDir, '.claude', 'skills'));
    });

    it('should add new agents and skills', async () => {
      const context = makeContext();
      const updates = {
        agentsToAdd: ['backend-engineer'],
        skillsToAdd: ['typescript'],
        agentsToRemove: [],
        skillsToRemove: [],
        regenerateClaudeMd: false
      };

      const result = await updater.applyUpdates(context, updates);

      expect(result.added.agents).toEqual(['backend-engineer']);
      expect(result.added.skills).toEqual(['typescript']);
      expect(result.removed.agents).toEqual([]);
      expect(result.removed.skills).toEqual([]);

      // Verify files were written
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'agents', 'backend-engineer.md'))).toBe(true);
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'skills', 'typescript.md'))).toBe(true);
    });

    it('should remove existing agents and skills', async () => {
      // Setup existing files
      await fs.writeFile(path.join(tmpDir, '.claude', 'agents', 'backend-engineer.md'), '# Backend');
      await fs.writeFile(path.join(tmpDir, '.claude', 'skills', 'typescript.md'), '# TypeScript');

      const context = makeContext();
      const updates = {
        agentsToAdd: [],
        skillsToAdd: [],
        agentsToRemove: ['backend-engineer'],
        skillsToRemove: ['typescript'],
        regenerateClaudeMd: false
      };

      const result = await updater.applyUpdates(context, updates);

      expect(result.removed.agents).toEqual(['backend-engineer']);
      expect(result.removed.skills).toEqual(['typescript']);

      // Verify files were removed
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'agents', 'backend-engineer.md'))).toBe(false);
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'skills', 'typescript.md'))).toBe(false);
    });

    it('should regenerate CLAUDE.md when requested', async () => {
      const context = makeContext();
      const updates = {
        agentsToAdd: ['backend-engineer'],
        skillsToAdd: [],
        agentsToRemove: [],
        skillsToRemove: [],
        regenerateClaudeMd: true
      };

      const result = await updater.applyUpdates(context, updates);

      expect(result.regenerated).toBe(true);
      expect(await fs.pathExists(path.join(tmpDir, 'CLAUDE.md'))).toBe(true);

      const content = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(content).toBe('# Generated CLAUDE.md');
    });

    it('should update settings.json with added agents', async () => {
      await fs.writeJSON(path.join(tmpDir, '.claude', 'settings.json'), {
        agents: ['existing-agent'],
        skills: []
      });

      const context = makeContext();
      const updates = {
        agentsToAdd: ['backend-engineer'],
        skillsToAdd: [],
        agentsToRemove: [],
        skillsToRemove: [],
        regenerateClaudeMd: false
      };

      await updater.applyUpdates(context, updates);

      const settings = await fs.readJSON(path.join(tmpDir, '.claude', 'settings.json'));
      expect(settings.agents).toContain('existing-agent');
      expect(settings.agents).toContain('backend-engineer');
    });

    it('should update settings.json with removed agents', async () => {
      await fs.writeJSON(path.join(tmpDir, '.claude', 'settings.json'), {
        agents: ['backend-engineer', 'frontend-engineer'],
        skills: []
      });

      const context = makeContext();
      const updates = {
        agentsToAdd: [],
        skillsToAdd: [],
        agentsToRemove: ['backend-engineer'],
        skillsToRemove: [],
        regenerateClaudeMd: false
      };

      await updater.applyUpdates(context, updates);

      const settings = await fs.readJSON(path.join(tmpDir, '.claude', 'settings.json'));
      expect(settings.agents).not.toContain('backend-engineer');
      expect(settings.agents).toContain('frontend-engineer');
    });

    it('should handle regenerate without adding items', async () => {
      const context = makeContext();
      const updates = {
        agentsToAdd: [],
        skillsToAdd: [],
        agentsToRemove: [],
        skillsToRemove: [],
        regenerateClaudeMd: true
      };

      const result = await updater.applyUpdates(context, updates);

      expect(result.regenerated).toBe(true);
      expect(result.added.agents).toEqual([]);
      expect(result.added.skills).toEqual([]);
      expect(await fs.pathExists(path.join(tmpDir, 'CLAUDE.md'))).toBe(true);
    });

    it('should call AIGenerator when adding items', async () => {
      const context = makeContext();
      const updates = {
        agentsToAdd: ['backend-engineer'],
        skillsToAdd: ['typescript'],
        agentsToRemove: [],
        skillsToRemove: [],
        regenerateClaudeMd: false
      };

      await updater.applyUpdates(context, updates);

      expect(mockGenerateAll).toHaveBeenCalled();
      const callArgs = mockGenerateAll.mock.calls[0][0];
      expect(callArgs.selectedAgents).toEqual(['backend-engineer']);
      expect(callArgs.selectedSkills).toEqual(['typescript']);
    });

    it('should handle removing non-existent files gracefully', async () => {
      const context = makeContext();
      const updates = {
        agentsToAdd: [],
        skillsToAdd: [],
        agentsToRemove: ['nonexistent-agent'],
        skillsToRemove: ['nonexistent-skill'],
        regenerateClaudeMd: false
      };

      await expect(updater.applyUpdates(context, updates)).resolves.toBeDefined();

      const result = await updater.applyUpdates(context, updates);
      expect(result.removed.agents).toEqual(['nonexistent-agent']);
      expect(result.removed.skills).toEqual(['nonexistent-skill']);
    });
  });
});
