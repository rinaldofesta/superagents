/**
 * Unit tests for handoff context collector
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import * as childProcess from 'child_process';
import { makePackageJson, makeRoadmap } from '../../helpers/fixtures.js';

// Mock child_process exec
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

// Import after mocking
const { collectHandoffContext } = await import('../../../src/handoff/collector.js');

const testDir = path.join(os.tmpdir(), `superagents-handoff-test-${Date.now()}`);
const projectRoot = path.join(testDir, 'project');

beforeEach(async () => {
  await fs.ensureDir(projectRoot);
  vi.clearAllMocks();

  // Default mock behavior - exec callback with error
  vi.mocked(childProcess.exec).mockImplementation((cmd: string, options: unknown, callback?: (error: Error | null, stdout: string, stderr: string) => void) => {
    if (callback) {
      setImmediate(() => callback(new Error('Command failed'), '', ''));
    }
    return {} as ReturnType<typeof childProcess.exec>;
  });
});

afterEach(async () => {
  await fs.remove(testDir);
});

describe('collectHandoffContext', () => {
  it('should collect project name from CLAUDE.md heading', async () => {
    // Arrange
    await fs.writeFile(
      path.join(projectRoot, 'CLAUDE.md'),
      '# My Project\n\nProject description',
      'utf-8'
    );

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.projectName).toBe('My Project');
  });

  it('should use directory name when CLAUDE.md does not exist', async () => {
    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.projectName).toBe('project');
  });

  it('should extract description from CLAUDE.md first paragraph', async () => {
    // Arrange
    await fs.writeFile(
      path.join(projectRoot, 'CLAUDE.md'),
      '# Project\n\nThis is the description.\n\nMore content here.',
      'utf-8'
    );

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.description).toBe('This is the description.');
  });

  it('should skip heading lines when extracting description', async () => {
    // Arrange
    await fs.writeFile(
      path.join(projectRoot, 'CLAUDE.md'),
      '# Project\n\n## Section\n\nContent under section',
      'utf-8'
    );

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    // The logic checks if line.startsWith('#'), so '## Section' would be skipped as a heading
    // But actually it checks !line.startsWith('#'), so '## Section' would not be picked
    // Let me read the code again - it checks !line.startsWith('#')
    expect(result.description).toBe('Content under section');
  });

  it('should detect TypeScript from package.json dependencies', async () => {
    // Arrange
    const pkg = makePackageJson({
      dependencies: { express: '^4.0.0', typescript: '^5.0.0' },
    });
    await fs.writeJson(path.join(projectRoot, 'package.json'), pkg);

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.techStack).toContain('TypeScript');
  });

  it('should detect framework from package.json dependencies', async () => {
    // Arrange
    const pkg = makePackageJson({
      dependencies: { next: '^14.0.0' },
    });
    await fs.writeJson(path.join(projectRoot, 'package.json'), pkg);

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.techStack).toContain('next');
  });

  it('should return unknown tech stack when package.json does not exist', async () => {
    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.techStack).toBe('unknown');
  });

  it('should set build status to passing when npm run build succeeds', async () => {
    // Arrange
    const pkg = makePackageJson({
      scripts: { build: 'tsc' },
    });
    await fs.writeJson(path.join(projectRoot, 'package.json'), pkg);

    vi.mocked(childProcess.exec).mockImplementation((cmd: string, options: unknown, callback?: (error: Error | null, stdout: string, stderr: string) => void) => {
      if (callback) {
        if (cmd === 'npm run build') {
          setImmediate(() => callback(null, 'Build succeeded', ''));
        } else {
          setImmediate(() => callback(new Error('Command failed'), '', ''));
        }
      }
      return {} as ReturnType<typeof childProcess.exec>;
    });

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.buildStatus).toBe('passing');
  });

  it('should set build status to failing when npm run build fails', async () => {
    // Arrange
    const pkg = makePackageJson({
      scripts: { build: 'tsc' },
    });
    await fs.writeJson(path.join(projectRoot, 'package.json'), pkg);

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.buildStatus).toBe('failing');
  });

  it('should set build status to unknown when no build script exists', async () => {
    // Arrange
    const pkg = makePackageJson({
      scripts: {},
    });
    await fs.writeJson(path.join(projectRoot, 'package.json'), pkg);

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.buildStatus).toBe('unknown');
  });

  it('should set file count to 0 when find command fails', async () => {
    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.fileCount).toBe(0);
  });

  it('should parse roadmap progress from ROADMAP.md', async () => {
    // Arrange
    await fs.writeFile(
      path.join(projectRoot, 'ROADMAP.md'),
      '## Phase 1: Setup\n\n- [x] Task 1\n- [ ] Task 2\n- [ ] Task 3',
      'utf-8'
    );

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.roadmapProgress).toContain('Phase 1');
    expect(result.roadmapProgress).toContain('1/3');
    expect(result.roadmapProgress).toContain('33%');
  });

  it('should show all phases complete when all tasks are done', async () => {
    // Arrange
    await fs.writeFile(
      path.join(projectRoot, 'ROADMAP.md'),
      '## Phase 1: Setup\n\n- [x] Task 1\n\n## Phase 2: Build\n\n- [x] Task 2',
      'utf-8'
    );

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.roadmapProgress).toContain('All 2 phases complete');
    expect(result.roadmapProgress).toContain('2/2');
  });

  it('should collect next incomplete tasks from roadmap', async () => {
    // Arrange
    await fs.writeFile(
      path.join(projectRoot, 'ROADMAP.md'),
      '## Phase 1: Setup\n\n- [x] Task 1\n- [ ] Task 2\n- [ ] Task 3\n- [ ] Task 4\n- [ ] Task 5\n- [ ] Task 6',
      'utf-8'
    );

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.nextSteps).toHaveLength(5);
    expect(result.nextSteps[0]).toBe('Task 2');
    expect(result.nextSteps[4]).toBe('Task 6');
  });

  it('should set roadmap progress to null when ROADMAP.md does not exist', async () => {
    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.roadmapProgress).toBeNull();
  });

  it('should collect agents and skills from .claude/ directory', async () => {
    // Arrange
    await fs.ensureDir(path.join(projectRoot, '.claude', 'agents'));
    await fs.ensureDir(path.join(projectRoot, '.claude', 'skills'));
    await fs.writeFile(path.join(projectRoot, '.claude', 'agents', 'backend-engineer.md'), '# Backend', 'utf-8');
    await fs.writeFile(path.join(projectRoot, '.claude', 'skills', 'typescript.md'), '# TS', 'utf-8');

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.agents).toContain('backend-engineer');
    expect(result.skills).toContain('typescript');
  });

  it('should return empty arrays when no .claude/ config exists', async () => {
    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.agents).toEqual([]);
    expect(result.skills).toEqual([]);
  });

  it('should include generatedAt timestamp', async () => {
    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should handle build timeout correctly', async () => {
    // Arrange
    const pkg = makePackageJson({
      scripts: { build: 'sleep 100' },
    });
    await fs.writeJson(path.join(projectRoot, 'package.json'), pkg);

    vi.mocked(childProcess.exec).mockImplementation((cmd: string, options: unknown, callback?: (error: Error | null, stdout: string, stderr: string) => void) => {
      if (callback) {
        if (cmd === 'npm run build') {
          setTimeout(() => callback(new Error('Command timed out'), '', ''), 100);
        } else {
          setImmediate(() => callback(new Error('Command failed'), '', ''));
        }
      }
      return {} as ReturnType<typeof childProcess.exec>;
    });

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.buildStatus).toBe('failing');
  });

  it('should handle find command timeout correctly', async () => {
    // Arrange
    vi.mocked(childProcess.exec).mockImplementation((cmd: string, options: unknown, callback?: (error: Error | null, stdout: string, stderr: string) => void) => {
      if (callback) {
        if (cmd.includes('find')) {
          setTimeout(() => callback(new Error('Command timed out'), '', ''), 100);
        } else {
          setImmediate(() => callback(new Error('Command failed'), '', ''));
        }
      }
      return {} as ReturnType<typeof childProcess.exec>;
    });

    // Act
    const result = await collectHandoffContext(projectRoot);

    // Assert
    expect(result.fileCount).toBe(0);
  });
});
