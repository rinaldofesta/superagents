/**
 * Unit tests for the OutputWriter
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { OutputWriter } from '../../../src/writer/index.js';
import type { GeneratedOutputs } from '../../../src/types/generation.js';

// Mock the interactive prompt
vi.mock('../../../src/cli/prompts.js', () => ({
  confirmOverwrite: vi.fn().mockResolvedValue(true)
}));

import { confirmOverwrite } from '../../../src/cli/prompts.js';

describe('OutputWriter', () => {
  let tmpDir: string;
  let writer: OutputWriter;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'writer-test-'));
    writer = new OutputWriter(tmpDir);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  /**
   * Helper to create minimal GeneratedOutputs
   */
  function createOutputs(overrides: Partial<GeneratedOutputs> = {}): GeneratedOutputs {
    return {
      claudeMd: '# Test CLAUDE.md',
      agents: [{ filename: 'backend-engineer.md', content: '# Backend Engineer', agentName: 'backend-engineer' }],
      skills: [{ filename: 'typescript.md', content: '# TypeScript', skillName: 'typescript' }],
      hooks: [],
      commands: [{ filename: 'status.md', content: '# Status Command', commandName: 'status' }],
      settings: {
        agents: ['backend-engineer'],
        skills: ['typescript'],
        model: 'claude-sonnet-4-5-20250929',
        permissions: { allow: [], deny: [] }
      },
      docs: [{ filename: 'architecture.md', content: '# Architecture', subfolder: 'docs' }],
      ...overrides,
    };
  }

  describe('directory structure creation', () => {
    it('should create .claude/ subdirectories', async () => {
      const outputs = createOutputs();
      await writer.writeAll(outputs);

      expect(await fs.pathExists(path.join(tmpDir, '.claude'))).toBe(true);
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'agents'))).toBe(true);
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'skills'))).toBe(true);
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'commands'))).toBe(true);
    });

    it('should create docs/ directory', async () => {
      const outputs = createOutputs();
      await writer.writeAll(outputs);

      expect(await fs.pathExists(path.join(tmpDir, 'docs'))).toBe(true);
    });

    it('should create nested docs subdirectories', async () => {
      const outputs = createOutputs({
        docs: [
          { filename: 'architecture.md', content: '# Arch', subfolder: 'docs' },
          { filename: 'patterns.md', content: '# Patterns', subfolder: 'internal/guides' }
        ]
      });
      await writer.writeAll(outputs);

      expect(await fs.pathExists(path.join(tmpDir, 'docs', 'docs'))).toBe(true);
      expect(await fs.pathExists(path.join(tmpDir, 'docs', 'internal', 'guides'))).toBe(true);
    });
  });

  describe('file writing', () => {
    it('should write CLAUDE.md to project root', async () => {
      const outputs = createOutputs({ claudeMd: '# My Custom CLAUDE.md' });
      await writer.writeAll(outputs);

      const claudeMdPath = path.join(tmpDir, 'CLAUDE.md');
      expect(await fs.pathExists(claudeMdPath)).toBe(true);
      const content = await fs.readFile(claudeMdPath, 'utf-8');
      expect(content).toBe('# My Custom CLAUDE.md');
    });

    it('should write agent files to .claude/agents/', async () => {
      const outputs = createOutputs({
        agents: [
          { filename: 'backend-engineer.md', content: '# Backend', agentName: 'backend-engineer' },
          { filename: 'frontend-engineer.md', content: '# Frontend', agentName: 'frontend-engineer' }
        ]
      });
      await writer.writeAll(outputs);

      const backendPath = path.join(tmpDir, '.claude', 'agents', 'backend-engineer.md');
      const frontendPath = path.join(tmpDir, '.claude', 'agents', 'frontend-engineer.md');

      expect(await fs.pathExists(backendPath)).toBe(true);
      expect(await fs.pathExists(frontendPath)).toBe(true);

      const backendContent = await fs.readFile(backendPath, 'utf-8');
      const frontendContent = await fs.readFile(frontendPath, 'utf-8');

      expect(backendContent).toBe('# Backend');
      expect(frontendContent).toBe('# Frontend');
    });

    it('should write skill files to .claude/skills/', async () => {
      const outputs = createOutputs({
        skills: [
          { filename: 'typescript.md', content: '# TypeScript', skillName: 'typescript' },
          { filename: 'react.md', content: '# React', skillName: 'react' }
        ]
      });
      await writer.writeAll(outputs);

      const tsPath = path.join(tmpDir, '.claude', 'skills', 'typescript.md');
      const reactPath = path.join(tmpDir, '.claude', 'skills', 'react.md');

      expect(await fs.pathExists(tsPath)).toBe(true);
      expect(await fs.pathExists(reactPath)).toBe(true);

      const tsContent = await fs.readFile(tsPath, 'utf-8');
      const reactContent = await fs.readFile(reactPath, 'utf-8');

      expect(tsContent).toBe('# TypeScript');
      expect(reactContent).toBe('# React');
    });

    it('should write command files to .claude/commands/', async () => {
      const outputs = createOutputs({
        commands: [
          { filename: 'status.md', content: '# Status', commandName: 'status' },
          { filename: 'fix.md', content: '# Fix', commandName: 'fix' }
        ]
      });
      await writer.writeAll(outputs);

      const statusPath = path.join(tmpDir, '.claude', 'commands', 'status.md');
      const fixPath = path.join(tmpDir, '.claude', 'commands', 'fix.md');

      expect(await fs.pathExists(statusPath)).toBe(true);
      expect(await fs.pathExists(fixPath)).toBe(true);

      const statusContent = await fs.readFile(statusPath, 'utf-8');
      const fixContent = await fs.readFile(fixPath, 'utf-8');

      expect(statusContent).toBe('# Status');
      expect(fixContent).toBe('# Fix');
    });

    it('should write settings.json to .claude/', async () => {
      const outputs = createOutputs({
        settings: {
          agents: ['backend-engineer', 'frontend-engineer'],
          skills: ['typescript', 'react'],
          model: 'claude-opus-4-6',
          permissions: { allow: ['Read(**/*)', 'Write(src/**)'], deny: ['.env'] }
        }
      });
      await writer.writeAll(outputs);

      const settingsPath = path.join(tmpDir, '.claude', 'settings.json');
      expect(await fs.pathExists(settingsPath)).toBe(true);

      const settingsContent = await fs.readJson(settingsPath);
      expect(settingsContent.agents).toEqual(['backend-engineer', 'frontend-engineer']);
      expect(settingsContent.skills).toEqual(['typescript', 'react']);
      expect(settingsContent.model).toBe('claude-opus-4-6');
      expect(settingsContent.permissions.allow).toContain('Read(**/*)');
    });

    it('should write doc files to docs/ with subfolder', async () => {
      const outputs = createOutputs({
        docs: [
          { filename: 'architecture.md', content: '# Arch', subfolder: 'docs' },
          { filename: 'setup.md', content: '# Setup', subfolder: 'docs' }
        ]
      });
      await writer.writeAll(outputs);

      const archPath = path.join(tmpDir, 'docs', 'docs', 'architecture.md');
      const setupPath = path.join(tmpDir, 'docs', 'docs', 'setup.md');

      expect(await fs.pathExists(archPath)).toBe(true);
      expect(await fs.pathExists(setupPath)).toBe(true);

      const archContent = await fs.readFile(archPath, 'utf-8');
      const setupContent = await fs.readFile(setupPath, 'utf-8');

      expect(archContent).toBe('# Arch');
      expect(setupContent).toBe('# Setup');
    });

    it('should write docs without subfolder to docs/ root', async () => {
      const outputs = createOutputs({
        docs: [{ filename: 'README.md', content: '# README' }]
      });
      await writer.writeAll(outputs);

      const readmePath = path.join(tmpDir, 'docs', 'README.md');
      expect(await fs.pathExists(readmePath)).toBe(true);

      const content = await fs.readFile(readmePath, 'utf-8');
      expect(content).toBe('# README');
    });
  });

  describe('ROADMAP.md', () => {
    it('should write ROADMAP.md to project root when provided', async () => {
      const outputs = createOutputs({
        roadmapMd: '# Project Roadmap\n\n## Phase 1\nSetup infrastructure'
      });
      await writer.writeAll(outputs);

      const roadmapPath = path.join(tmpDir, 'ROADMAP.md');
      expect(await fs.pathExists(roadmapPath)).toBe(true);

      const content = await fs.readFile(roadmapPath, 'utf-8');
      expect(content).toBe('# Project Roadmap\n\n## Phase 1\nSetup infrastructure');
    });

    it('should not write ROADMAP.md when not provided', async () => {
      const outputs = createOutputs({ roadmapMd: undefined });
      await writer.writeAll(outputs);

      const roadmapPath = path.join(tmpDir, 'ROADMAP.md');
      expect(await fs.pathExists(roadmapPath)).toBe(false);
    });

    it('should set hasRoadmap to true in WriteSummary when provided', async () => {
      const outputs = createOutputs({ roadmapMd: '# Roadmap' });
      const summary = await writer.writeAll(outputs);

      expect(summary.hasRoadmap).toBe(true);
    });

    it('should set hasRoadmap to false in WriteSummary when not provided', async () => {
      const outputs = createOutputs({ roadmapMd: undefined });
      const summary = await writer.writeAll(outputs);

      expect(summary.hasRoadmap).toBe(false);
    });
  });

  describe('WriteSummary', () => {
    it('should return correct WriteSummary with all counts', async () => {
      const outputs = createOutputs({
        agents: [
          { filename: 'backend.md', content: '# Backend', agentName: 'backend' },
          { filename: 'frontend.md', content: '# Frontend', agentName: 'frontend' },
          { filename: 'devops.md', content: '# DevOps', agentName: 'devops' }
        ],
        skills: [
          { filename: 'typescript.md', content: '# TS', skillName: 'typescript' },
          { filename: 'react.md', content: '# React', skillName: 'react' }
        ],
        commands: [
          { filename: 'status.md', content: '# Status', commandName: 'status' }
        ],
        docs: [
          { filename: 'arch.md', content: '# Arch', subfolder: 'docs' },
          { filename: 'patterns.md', content: '# Patterns', subfolder: 'docs' }
        ]
      });
      const summary = await writer.writeAll(outputs);

      // totalFiles: agents(3) + skills(2) + commands(1) + docs(2) + CLAUDE.md(1) + settings.json(1) = 10
      expect(summary.totalFiles).toBe(10);
      expect(summary.agents).toEqual(['backend', 'frontend', 'devops']);
      expect(summary.skills).toEqual(['typescript', 'react']);
      expect(summary.commands).toEqual(['status']);
      expect(summary.docs).toEqual(['arch.md', 'patterns.md']);
      expect(summary.projectRoot).toBe(tmpDir);
      expect(summary.claudeDir).toBe(path.join(tmpDir, '.claude'));
      expect(summary.hasRoadmap).toBe(false);
    });

    it('should include ROADMAP.md in totalFiles count', async () => {
      const outputs = createOutputs({
        agents: [{ filename: 'backend.md', content: '# B', agentName: 'backend' }],
        skills: [{ filename: 'ts.md', content: '# TS', skillName: 'typescript' }],
        commands: [],
        docs: [],
        roadmapMd: '# Roadmap'
      });
      const summary = await writer.writeAll(outputs);

      // totalFiles: agents(1) + skills(1) + CLAUDE.md(1) + settings.json(1) + ROADMAP.md(1) = 5
      expect(summary.totalFiles).toBe(5);
      expect(summary.hasRoadmap).toBe(true);
    });

    it('should handle empty arrays correctly', async () => {
      const outputs = createOutputs({
        agents: [],
        skills: [{ filename: 'typescript.md', content: '# TS', skillName: 'typescript' }],
        commands: [],
        docs: []
      });
      const summary = await writer.writeAll(outputs);

      // totalFiles: skills(1) + CLAUDE.md(1) + settings.json(1) = 3
      expect(summary.totalFiles).toBe(3);
      expect(summary.agents).toEqual([]);
      expect(summary.skills).toEqual(['typescript']);
      expect(summary.commands).toEqual([]);
      expect(summary.docs).toEqual([]);
    });
  });

  describe('existing .claude/ directory', () => {
    it('should proceed when confirmOverwrite returns true', async () => {
      // Create existing .claude directory
      await fs.ensureDir(path.join(tmpDir, '.claude'));
      await fs.writeFile(path.join(tmpDir, '.claude', 'old-file.md'), 'old content');

      vi.mocked(confirmOverwrite).mockResolvedValue(true);

      const outputs = createOutputs();
      const summary = await writer.writeAll(outputs);

      expect(confirmOverwrite).toHaveBeenCalledOnce();
      expect(summary.totalFiles).toBeGreaterThan(0);
      // Old file should be removed
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'old-file.md'))).toBe(false);
      // New files should exist
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'agents', 'backend-engineer.md'))).toBe(true);
    });

    it('should throw error when confirmOverwrite returns false', async () => {
      // Create existing .claude directory
      await fs.ensureDir(path.join(tmpDir, '.claude'));

      vi.mocked(confirmOverwrite).mockResolvedValue(false);

      const outputs = createOutputs();

      await expect(writer.writeAll(outputs)).rejects.toThrow('User cancelled: .claude directory already exists');
      expect(confirmOverwrite).toHaveBeenCalledOnce();
    });

    it('should remove existing .claude directory before writing new files', async () => {
      // Create existing structure with old files
      await fs.ensureDir(path.join(tmpDir, '.claude', 'agents'));
      await fs.writeFile(path.join(tmpDir, '.claude', 'agents', 'old-agent.md'), 'old');
      await fs.ensureDir(path.join(tmpDir, '.claude', 'skills'));
      await fs.writeFile(path.join(tmpDir, '.claude', 'skills', 'old-skill.md'), 'old');

      vi.mocked(confirmOverwrite).mockResolvedValue(true);

      const outputs = createOutputs({
        agents: [{ filename: 'new-agent.md', content: '# New', agentName: 'new-agent' }],
        skills: []
      });
      await writer.writeAll(outputs);

      // Old files should not exist
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'agents', 'old-agent.md'))).toBe(false);
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'skills', 'old-skill.md'))).toBe(false);
      // New files should exist
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'agents', 'new-agent.md'))).toBe(true);
    });
  });

  describe('forceOverwrite mode', () => {
    it('should skip confirmOverwrite prompt when forceOverwrite is true', async () => {
      const forceWriter = new OutputWriter(tmpDir, true);

      // Create existing .claude directory
      await fs.ensureDir(path.join(tmpDir, '.claude'));
      await fs.writeFile(path.join(tmpDir, '.claude', 'old-file.md'), 'old content');

      const outputs = createOutputs();
      const summary = await forceWriter.writeAll(outputs);

      expect(confirmOverwrite).not.toHaveBeenCalled();
      expect(summary.totalFiles).toBeGreaterThan(0);
      // Old file should be removed
      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'old-file.md'))).toBe(false);
    });

    it('should still call confirmOverwrite when forceOverwrite is false and dir exists', async () => {
      const normalWriter = new OutputWriter(tmpDir, false);

      await fs.ensureDir(path.join(tmpDir, '.claude'));

      vi.mocked(confirmOverwrite).mockResolvedValue(true);

      const outputs = createOutputs();
      await normalWriter.writeAll(outputs);

      expect(confirmOverwrite).toHaveBeenCalledOnce();
    });
  });

  describe('hook files', () => {
    it('should create hooks directory when hooks are present', async () => {
      const outputs = createOutputs({
        hooks: [
          { filename: 'security-gate.sh', content: '#!/usr/bin/env bash\nexit 0', hookName: 'security-gate' }
        ]
      });
      await writer.writeAll(outputs);

      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'hooks'))).toBe(true);
    });

    it('should write hook file with correct content', async () => {
      const hookContent = '#!/usr/bin/env bash\necho "hook"';
      const outputs = createOutputs({
        hooks: [
          { filename: 'security-gate.sh', content: hookContent, hookName: 'security-gate' }
        ]
      });
      await writer.writeAll(outputs);

      const hookPath = path.join(tmpDir, '.claude', 'hooks', 'security-gate.sh');
      expect(await fs.pathExists(hookPath)).toBe(true);
      const content = await fs.readFile(hookPath, 'utf-8');
      expect(content).toBe(hookContent);
    });

    it('should make hook files executable', async () => {
      const outputs = createOutputs({
        hooks: [
          { filename: 'security-gate.sh', content: '#!/usr/bin/env bash\nexit 0', hookName: 'security-gate' }
        ]
      });
      await writer.writeAll(outputs);

      const hookPath = path.join(tmpDir, '.claude', 'hooks', 'security-gate.sh');
      const stat = await fs.stat(hookPath);
      // Check executable bit (owner execute = 0o100)
      expect(stat.mode & 0o100).toBeTruthy();
    });

    it('should include hooks in totalFiles count', async () => {
      const outputs = createOutputs({
        agents: [{ filename: 'backend.md', content: '# B', agentName: 'backend' }],
        skills: [],
        commands: [],
        docs: [],
        hooks: [
          { filename: 'security-gate.sh', content: '#!/usr/bin/env bash', hookName: 'security-gate' }
        ]
      });
      const summary = await writer.writeAll(outputs);

      // totalFiles: agents(1) + hooks(1) + CLAUDE.md(1) + settings.json(1) = 4
      expect(summary.totalFiles).toBe(4);
    });

    it('should include hook names in WriteSummary', async () => {
      const outputs = createOutputs({
        hooks: [
          { filename: 'security-gate.sh', content: '#!/usr/bin/env bash', hookName: 'security-gate' }
        ]
      });
      const summary = await writer.writeAll(outputs);

      expect(summary.hooks).toEqual(['security-gate']);
    });

    it('should not create hooks directory when no hooks present', async () => {
      const outputs = createOutputs({ hooks: [] });
      await writer.writeAll(outputs);

      expect(await fs.pathExists(path.join(tmpDir, '.claude', 'hooks'))).toBe(false);
    });
  });

  describe('multiple files', () => {
    it('should write 3 agents and 2 skills correctly', async () => {
      const outputs = createOutputs({
        agents: [
          { filename: 'backend.md', content: '# Backend', agentName: 'backend' },
          { filename: 'frontend.md', content: '# Frontend', agentName: 'frontend' },
          { filename: 'devops.md', content: '# DevOps', agentName: 'devops' }
        ],
        skills: [
          { filename: 'typescript.md', content: '# TS', skillName: 'typescript' },
          { filename: 'react.md', content: '# React', skillName: 'react' }
        ],
        commands: [],
        docs: []
      });
      const summary = await writer.writeAll(outputs);

      expect(summary.agents).toHaveLength(3);
      expect(summary.skills).toHaveLength(2);

      // Verify all agent files exist
      for (const agent of outputs.agents) {
        const agentPath = path.join(tmpDir, '.claude', 'agents', agent.filename);
        expect(await fs.pathExists(agentPath)).toBe(true);
        const content = await fs.readFile(agentPath, 'utf-8');
        expect(content).toBe(agent.content);
      }

      // Verify all skill files exist
      for (const skill of outputs.skills) {
        const skillPath = path.join(tmpDir, '.claude', 'skills', skill.filename);
        expect(await fs.pathExists(skillPath)).toBe(true);
        const content = await fs.readFile(skillPath, 'utf-8');
        expect(content).toBe(skill.content);
      }
    });
  });
});
