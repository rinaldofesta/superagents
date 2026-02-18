/**
 * Unit tests for blueprint installer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import archiver from 'archiver';
import { installBlueprint } from '../../../src/use/installer.js';

import type { PublishedBlueprintMeta } from '../../../src/types/published-blueprint.js';

const testDir = path.join(os.tmpdir(), `superagents-installer-test-${Date.now()}`);
const projectRoot = path.join(testDir, 'project');

const testMeta: PublishedBlueprintMeta = {
  format: 'superagents-blueprint',
  formatVersion: 1,
  name: 'test-blueprint',
  author: 'tester',
  description: 'A test blueprint',
  version: '1.0.0',
  keywords: ['test'],
  stack: ['typescript'],
  phases: [{ name: 'Setup', description: 'Get started', tasks: [{ title: 'Init', description: 'Initialize' }] }],
  agents: ['backend-engineer'],
  skills: ['typescript'],
  publishedAt: new Date().toISOString(),
};

async function createTestZip(zipPath: string, meta: PublishedBlueprintMeta): Promise<void> {
  await fs.ensureDir(path.dirname(zipPath));

  // Create temp content
  const tempContent = path.join(testDir, 'zip-content');
  await fs.ensureDir(path.join(tempContent, '.claude', 'agents'));
  await fs.writeFile(path.join(tempContent, '.claude', 'agents', 'backend-engineer.md'), '# Backend', 'utf-8');
  await fs.writeFile(path.join(tempContent, 'CLAUDE.md'), '# Test Project', 'utf-8');
  await fs.writeFile(path.join(tempContent, 'ROADMAP.md'), '# Roadmap', 'utf-8');

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 1 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    archive.append(JSON.stringify(meta, null, 2), { name: 'blueprint.json' });
    archive.directory(path.join(tempContent, '.claude'), '.claude');
    archive.file(path.join(tempContent, 'CLAUDE.md'), { name: 'CLAUDE.md' });
    archive.file(path.join(tempContent, 'ROADMAP.md'), { name: 'ROADMAP.md' });
    archive.finalize();
  });
}

beforeEach(async () => {
  await fs.ensureDir(projectRoot);
});

afterEach(async () => {
  await fs.remove(testDir);
});

describe('installBlueprint', () => {
  it('should install .claude/, CLAUDE.md, and ROADMAP.md', async () => {
    const zipPath = path.join(testDir, 'test.zip');
    await createTestZip(zipPath, testMeta);

    const { meta, filesWritten } = await installBlueprint(zipPath, projectRoot, {});

    expect(meta.name).toBe('test-blueprint');
    expect(filesWritten).toBeGreaterThan(0);
    expect(await fs.pathExists(path.join(projectRoot, '.claude'))).toBe(true);
    expect(await fs.pathExists(path.join(projectRoot, 'CLAUDE.md'))).toBe(true);
    expect(await fs.pathExists(path.join(projectRoot, 'ROADMAP.md'))).toBe(true);
  });

  it('should return meta in preview mode without writing files', async () => {
    const zipPath = path.join(testDir, 'test.zip');
    await createTestZip(zipPath, testMeta);

    const { meta, filesWritten } = await installBlueprint(zipPath, projectRoot, { preview: true });

    expect(meta.name).toBe('test-blueprint');
    expect(filesWritten).toBe(0);
    expect(await fs.pathExists(path.join(projectRoot, '.claude'))).toBe(false);
  });

  it('should throw if .claude/ exists and force is not set', async () => {
    const zipPath = path.join(testDir, 'test.zip');
    await createTestZip(zipPath, testMeta);

    // Create existing .claude/
    await fs.ensureDir(path.join(projectRoot, '.claude'));

    await expect(
      installBlueprint(zipPath, projectRoot, {})
    ).rejects.toThrow('Existing .claude/ configuration found');
  });

  it('should overwrite when force is set', async () => {
    const zipPath = path.join(testDir, 'test.zip');
    await createTestZip(zipPath, testMeta);

    // Create existing .claude/
    await fs.ensureDir(path.join(projectRoot, '.claude'));
    await fs.writeFile(path.join(projectRoot, '.claude', 'old.txt'), 'old', 'utf-8');

    const { meta } = await installBlueprint(zipPath, projectRoot, { force: true });

    expect(meta.name).toBe('test-blueprint');
    expect(await fs.pathExists(path.join(projectRoot, '.claude', 'old.txt'))).toBe(false);
  });

  it('should throw for missing zip file', async () => {
    await expect(
      installBlueprint('/nonexistent.zip', projectRoot, {})
    ).rejects.toThrow('File not found');
  });

  it('should throw for invalid blueprint (missing blueprint.json)', async () => {
    // Create a zip without blueprint.json
    const zipPath = path.join(testDir, 'bad.zip');
    await fs.ensureDir(path.dirname(zipPath));

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 1 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.append('hello', { name: 'random.txt' });
      archive.finalize();
    });

    await expect(
      installBlueprint(zipPath, projectRoot, {})
    ).rejects.toThrow('Invalid blueprint');
  });

  it('should clean up temp directory even on error', async () => {
    const zipPath = path.join(testDir, 'bad.zip');
    await fs.ensureDir(path.dirname(zipPath));

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 1 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.append('hello', { name: 'random.txt' });
      archive.finalize();
    });

    try {
      await installBlueprint(zipPath, projectRoot, {});
    } catch {
      // Expected
    }

    const tempDir = path.join(projectRoot, '.superagents-use-temp');
    expect(await fs.pathExists(tempDir)).toBe(false);
  });
});
