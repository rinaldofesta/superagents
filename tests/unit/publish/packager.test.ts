/**
 * Unit tests for blueprint packager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import unzipper from 'unzipper';
import { packageBlueprint } from '../../../src/publish/packager.js';

import type { PublishedBlueprintMeta } from '../../../src/types/published-blueprint.js';

const testDir = path.join(os.tmpdir(), `superagents-packager-test-${Date.now()}`);
const projectRoot = path.join(testDir, 'project');
const outputDir = path.join(testDir, 'output');

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

beforeEach(async () => {
  await fs.ensureDir(projectRoot);
  await fs.ensureDir(outputDir);

  // Create minimal project structure
  await fs.ensureDir(path.join(projectRoot, '.claude', 'agents'));
  await fs.writeFile(path.join(projectRoot, '.claude', 'agents', 'backend-engineer.md'), '# Backend', 'utf-8');
  await fs.writeFile(path.join(projectRoot, 'CLAUDE.md'), '# Test', 'utf-8');
  await fs.writeFile(path.join(projectRoot, 'ROADMAP.md'), '# Roadmap', 'utf-8');
});

afterEach(async () => {
  await fs.remove(testDir);
});

describe('packageBlueprint', () => {
  it('should create a zip file at the output path', async () => {
    const outputPath = path.join(outputDir, 'test.blueprint.zip');
    const result = await packageBlueprint(projectRoot, testMeta, outputPath);

    expect(result).toBe(outputPath);
    expect(await fs.pathExists(outputPath)).toBe(true);
  });

  it('should include blueprint.json in the zip', async () => {
    const outputPath = path.join(outputDir, 'test.blueprint.zip');
    await packageBlueprint(projectRoot, testMeta, outputPath);

    const entries = await listZipEntries(outputPath);
    expect(entries).toContain('blueprint.json');
  });

  it('should include .claude/ directory in the zip', async () => {
    const outputPath = path.join(outputDir, 'test.blueprint.zip');
    await packageBlueprint(projectRoot, testMeta, outputPath);

    const entries = await listZipEntries(outputPath);
    const claudeEntries = entries.filter(e => e.startsWith('.claude/'));
    expect(claudeEntries.length).toBeGreaterThan(0);
  });

  it('should include CLAUDE.md in the zip', async () => {
    const outputPath = path.join(outputDir, 'test.blueprint.zip');
    await packageBlueprint(projectRoot, testMeta, outputPath);

    const entries = await listZipEntries(outputPath);
    expect(entries).toContain('CLAUDE.md');
  });

  it('should include ROADMAP.md in the zip', async () => {
    const outputPath = path.join(outputDir, 'test.blueprint.zip');
    await packageBlueprint(projectRoot, testMeta, outputPath);

    const entries = await listZipEntries(outputPath);
    expect(entries).toContain('ROADMAP.md');
  });

  it('should write valid JSON in blueprint.json', async () => {
    const outputPath = path.join(outputDir, 'test.blueprint.zip');
    await packageBlueprint(projectRoot, testMeta, outputPath);

    const content = await readZipEntry(outputPath, 'blueprint.json');
    const parsed = JSON.parse(content);
    expect(parsed.name).toBe('test-blueprint');
    expect(parsed.format).toBe('superagents-blueprint');
  });
});

async function listZipEntries(zipPath: string): Promise<string[]> {
  const entries: string[] = [];
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        entries.push(entry.path);
        entry.autodrain();
      })
      .on('close', resolve)
      .on('error', reject);
  });
  return entries;
}

async function readZipEntry(zipPath: string, entryName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on('entry', async (entry) => {
        if (entry.path === entryName) {
          const buf = await entry.buffer();
          resolve(buf.toString());
        } else {
          entry.autodrain();
        }
      })
      .on('error', reject);
  });
}
