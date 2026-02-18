/**
 * Unit tests for blueprint extractor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractBlueprint } from '../../../src/publish/extractor.js';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    readFile: vi.fn(),
    readJson: vi.fn(),
    readdir: vi.fn(),
  },
}));

// Mock ConfigUpdater
vi.mock('../../../src/updater/index.js', () => ({
  ConfigUpdater: class {
    async hasExistingConfig() { return true; }
    async readExisting() {
      return {
        agents: ['backend-engineer'],
        skills: ['typescript'],
        settings: {},
      };
    }
  },
}));

import fs from 'fs-extra';

const mockedFs = vi.mocked(fs);

beforeEach(() => {
  vi.clearAllMocks();
});

const baseMeta = {
  name: 'test-blueprint',
  author: 'tester',
  description: 'A test blueprint',
  version: '1.0.0',
  keywords: ['test'],
};

describe('extractBlueprint', () => {
  it('should extract phases from ROADMAP.md', async () => {
    mockedFs.pathExists.mockImplementation(async (p: string) => {
      if (typeof p === 'string' && p.endsWith('ROADMAP.md')) return true;
      if (typeof p === 'string' && p.endsWith('package.json')) return false;
      return true;
    });

    mockedFs.readFile.mockResolvedValue(
      `# Roadmap\n\n## Phase 1: Setup\nGet started\n\n- [ ] Init project\n  Initialize the project\n- [ ] Add deps\n  Add dependencies\n` as never
    );

    const result = await extractBlueprint('/test', baseMeta);

    expect(result.format).toBe('superagents-blueprint');
    expect(result.formatVersion).toBe(1);
    expect(result.name).toBe('test-blueprint');
    expect(result.phases).toHaveLength(1);
    expect(result.phases[0].name).toBe('Setup');
    expect(result.phases[0].tasks).toHaveLength(2);
    expect(result.phases[0].tasks[0].title).toBe('Init project');
    expect(result.phases[0].tasks[0].description).toBe('Initialize the project');
  });

  it('should extract stack from package.json dependencies', async () => {
    mockedFs.pathExists.mockImplementation(async (p: string) => {
      if (typeof p === 'string' && p.endsWith('ROADMAP.md')) return false;
      if (typeof p === 'string' && p.endsWith('package.json')) return true;
      return true;
    });

    mockedFs.readJson.mockResolvedValue({
      dependencies: { next: '^14.0.0', react: '^18.0.0' },
    });

    const result = await extractBlueprint('/test', baseMeta);

    expect(result.stack).toContain('next');
    expect(result.stack).toContain('react');
  });

  it('should include agents and skills from .claude/', async () => {
    mockedFs.pathExists.mockResolvedValue(false as never);

    const result = await extractBlueprint('/test', baseMeta);

    expect(result.agents).toContain('backend-engineer');
    expect(result.skills).toContain('typescript');
  });

  it('should use task title as fallback description', async () => {
    mockedFs.pathExists.mockImplementation(async (p: string) => {
      if (typeof p === 'string' && p.endsWith('ROADMAP.md')) return true;
      return false;
    });

    mockedFs.readFile.mockResolvedValue(
      `## Phase 1: Quick\nFast\n\n- [ ] Do thing\n` as never
    );

    const result = await extractBlueprint('/test', baseMeta);

    expect(result.phases[0].tasks[0].description).toBe('Do thing');
  });

  it('should set publishedAt timestamp', async () => {
    mockedFs.pathExists.mockResolvedValue(false as never);

    const result = await extractBlueprint('/test', baseMeta);

    expect(result.publishedAt).toBeDefined();
    expect(new Date(result.publishedAt).getTime()).not.toBeNaN();
  });
});
