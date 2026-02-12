/**
 * Unit tests for config export/import functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import archiver from 'archiver';
import { exportConfig, importConfig, previewConfig } from '../../../src/config/export-import.js';

const testDir = path.join(os.tmpdir(), `superagents-export-test-${Date.now()}`);
const projectRoot = path.join(testDir, 'project');

beforeEach(async () => {
  await fs.ensureDir(projectRoot);
});

afterEach(async () => {
  await fs.remove(testDir);
});

describe('exportConfig', () => {
  it('should export .claude/ directory to a zip file', async () => {
    // Arrange: Create .claude/ structure
    const claudeDir = path.join(projectRoot, '.claude');
    await fs.ensureDir(path.join(claudeDir, 'agents'));
    await fs.ensureDir(path.join(claudeDir, 'skills'));
    await fs.writeFile(path.join(claudeDir, 'agents', 'backend-engineer.md'), '# Backend', 'utf-8');
    await fs.writeFile(path.join(claudeDir, 'skills', 'typescript.md'), '# TypeScript', 'utf-8');

    const outputPath = path.join(testDir, 'export.zip');

    // Act
    const result = await exportConfig(projectRoot, outputPath);

    // Assert
    expect(result.path).toBe(outputPath);
    expect(await fs.pathExists(outputPath)).toBe(true);
    expect(result.metadata.agents).toContain('backend-engineer');
    expect(result.metadata.skills).toContain('typescript');
  });

  it('should include CLAUDE.md when it exists', async () => {
    // Arrange
    const claudeDir = path.join(projectRoot, '.claude');
    await fs.ensureDir(claudeDir);
    await fs.writeFile(path.join(projectRoot, 'CLAUDE.md'), '# Project', 'utf-8');

    const outputPath = path.join(testDir, 'export.zip');

    // Act
    const result = await exportConfig(projectRoot, outputPath);

    // Assert
    expect(result.metadata.hasCLAUDEmd).toBe(true);
  });

  it('should set hasCLAUDEmd to false when CLAUDE.md does not exist', async () => {
    // Arrange
    const claudeDir = path.join(projectRoot, '.claude');
    await fs.ensureDir(claudeDir);

    const outputPath = path.join(testDir, 'export.zip');

    // Act
    const result = await exportConfig(projectRoot, outputPath);

    // Assert
    expect(result.metadata.hasCLAUDEmd).toBe(false);
  });

  it('should detect hooks directory', async () => {
    // Arrange
    const claudeDir = path.join(projectRoot, '.claude');
    await fs.ensureDir(path.join(claudeDir, 'hooks'));
    await fs.writeFile(path.join(claudeDir, 'hooks', 'pre-commit'), '#!/bin/bash', 'utf-8');

    const outputPath = path.join(testDir, 'export.zip');

    // Act
    const result = await exportConfig(projectRoot, outputPath);

    // Assert
    expect(result.metadata.hasHooks).toBe(true);
  });

  it('should set hasHooks to false when no hooks directory exists', async () => {
    // Arrange
    const claudeDir = path.join(projectRoot, '.claude');
    await fs.ensureDir(claudeDir);

    const outputPath = path.join(testDir, 'export.zip');

    // Act
    const result = await exportConfig(projectRoot, outputPath);

    // Assert
    expect(result.metadata.hasHooks).toBe(false);
  });

  it('should create output directory if it does not exist', async () => {
    // Arrange
    const claudeDir = path.join(projectRoot, '.claude');
    await fs.ensureDir(claudeDir);

    const outputPath = path.join(testDir, 'nested', 'dir', 'export.zip');

    // Act
    await exportConfig(projectRoot, outputPath);

    // Assert
    expect(await fs.pathExists(outputPath)).toBe(true);
  });

  it('should include project name in metadata', async () => {
    // Arrange
    const claudeDir = path.join(projectRoot, '.claude');
    await fs.ensureDir(claudeDir);

    const outputPath = path.join(testDir, 'export.zip');

    // Act
    const result = await exportConfig(projectRoot, outputPath);

    // Assert
    expect(result.metadata.projectRoot).toBe('project');
  });

  it('should include version and timestamp in metadata', async () => {
    // Arrange
    const claudeDir = path.join(projectRoot, '.claude');
    await fs.ensureDir(claudeDir);

    const outputPath = path.join(testDir, 'export.zip');

    // Act
    const result = await exportConfig(projectRoot, outputPath);

    // Assert
    expect(result.metadata.version).toBe('1.3.0');
    expect(result.metadata.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should throw error when .claude/ directory does not exist', async () => {
    // Arrange
    const outputPath = path.join(testDir, 'export.zip');

    // Act & Assert
    await expect(
      exportConfig(projectRoot, outputPath)
    ).rejects.toThrow('No .claude/ configuration found');
  });

  it('should handle empty agents directory', async () => {
    // Arrange
    const claudeDir = path.join(projectRoot, '.claude');
    await fs.ensureDir(path.join(claudeDir, 'agents'));

    const outputPath = path.join(testDir, 'export.zip');

    // Act
    const result = await exportConfig(projectRoot, outputPath);

    // Assert
    expect(result.metadata.agents).toEqual([]);
  });

  it('should handle empty skills directory', async () => {
    // Arrange
    const claudeDir = path.join(projectRoot, '.claude');
    await fs.ensureDir(path.join(claudeDir, 'skills'));

    const outputPath = path.join(testDir, 'export.zip');

    // Act
    const result = await exportConfig(projectRoot, outputPath);

    // Assert
    expect(result.metadata.skills).toEqual([]);
  });

  it('should only include .md files in agents list', async () => {
    // Arrange
    const claudeDir = path.join(projectRoot, '.claude');
    await fs.ensureDir(path.join(claudeDir, 'agents'));
    await fs.writeFile(path.join(claudeDir, 'agents', 'backend.md'), '# Backend', 'utf-8');
    await fs.writeFile(path.join(claudeDir, 'agents', 'config.json'), '{}', 'utf-8');

    const outputPath = path.join(testDir, 'export.zip');

    // Act
    const result = await exportConfig(projectRoot, outputPath);

    // Assert
    expect(result.metadata.agents).toEqual(['backend']);
  });
});

describe('importConfig', () => {
  async function createTestZip(zipPath: string): Promise<void> {
    await fs.ensureDir(path.dirname(zipPath));

    // Create temp content
    const tempContent = path.join(testDir, 'zip-content');
    await fs.ensureDir(path.join(tempContent, '.claude', 'agents'));
    await fs.ensureDir(path.join(tempContent, '.claude', 'skills'));
    await fs.writeFile(path.join(tempContent, '.claude', 'agents', 'backend.md'), '# Backend', 'utf-8');
    await fs.writeFile(path.join(tempContent, '.claude', 'skills', 'typescript.md'), '# TS', 'utf-8');
    await fs.writeFile(path.join(tempContent, 'CLAUDE.md'), '# Test Project', 'utf-8');

    const metadata = {
      version: '1.3.0',
      exportedAt: new Date().toISOString(),
      projectRoot: 'test',
      agents: ['backend'],
      skills: ['typescript'],
      hasHooks: false,
      hasCLAUDEmd: true,
    };

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 1 } });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });
      archive.directory(path.join(tempContent, '.claude'), '.claude');
      archive.file(path.join(tempContent, 'CLAUDE.md'), { name: 'CLAUDE.md' });
      archive.finalize();
    });
  }

  it('should import .claude/ directory and CLAUDE.md', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'import.zip');
    await createTestZip(zipPath);

    // Act
    const result = await importConfig(zipPath, projectRoot);

    // Assert
    expect(await fs.pathExists(path.join(projectRoot, '.claude'))).toBe(true);
    expect(await fs.pathExists(path.join(projectRoot, 'CLAUDE.md'))).toBe(true);
    expect(result.filesWritten).toBeGreaterThan(0);
  });

  it('should return metadata from imported config', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'import.zip');
    await createTestZip(zipPath);

    // Act
    const result = await importConfig(zipPath, projectRoot);

    // Assert
    expect(result.metadata.agents).toContain('backend');
    expect(result.metadata.skills).toContain('typescript');
  });

  it('should throw when zip file does not exist', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'nonexistent.zip');

    // Act & Assert
    await expect(
      importConfig(zipPath, projectRoot)
    ).rejects.toThrow('File not found');
  });

  it('should throw when .claude/ exists and overwrite is false', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'import.zip');
    await createTestZip(zipPath);
    await fs.ensureDir(path.join(projectRoot, '.claude'));

    // Act & Assert
    await expect(
      importConfig(zipPath, projectRoot, false)
    ).rejects.toThrow('Existing .claude/ configuration found');
  });

  it('should overwrite existing config when overwrite is true', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'import.zip');
    await createTestZip(zipPath);
    await fs.ensureDir(path.join(projectRoot, '.claude'));
    await fs.writeFile(path.join(projectRoot, '.claude', 'old.txt'), 'old', 'utf-8');

    // Act
    const result = await importConfig(zipPath, projectRoot, true);

    // Assert
    expect(await fs.pathExists(path.join(projectRoot, '.claude', 'old.txt'))).toBe(false);
    expect(await fs.pathExists(path.join(projectRoot, '.claude', 'agents', 'backend.md'))).toBe(true);
  });

  it('should clean up temp directory after successful import', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'import.zip');
    await createTestZip(zipPath);

    // Act
    await importConfig(zipPath, projectRoot);

    // Assert
    const tempDir = path.join(projectRoot, '.superagents-import-temp');
    expect(await fs.pathExists(tempDir)).toBe(false);
  });

  it('should clean up temp directory even on error', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'bad.zip');
    await fs.ensureDir(path.dirname(zipPath));

    // Create invalid zip
    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 1 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.append('invalid', { name: 'test.txt' });
      archive.finalize();
    });

    await fs.ensureDir(path.join(projectRoot, '.claude'));

    // Act & Assert
    await expect(
      importConfig(zipPath, projectRoot, false)
    ).rejects.toThrow();

    const tempDir = path.join(projectRoot, '.superagents-import-temp');
    expect(await fs.pathExists(tempDir)).toBe(false);
  });

  it('should return default metadata when metadata.json is missing', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'no-meta.zip');
    await fs.ensureDir(path.dirname(zipPath));

    const tempContent = path.join(testDir, 'zip-no-meta');
    await fs.ensureDir(path.join(tempContent, '.claude'));

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 1 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(path.join(tempContent, '.claude'), '.claude');
      archive.finalize();
    });

    // Act
    const result = await importConfig(zipPath, projectRoot);

    // Assert
    expect(result.metadata.version).toBe('unknown');
    expect(result.metadata.projectRoot).toBe('unknown');
  });

  it('should count files correctly', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'import.zip');
    await createTestZip(zipPath);

    // Act
    const result = await importConfig(zipPath, projectRoot);

    // Assert
    // 2 .md files in .claude/ + 1 CLAUDE.md = 3
    expect(result.filesWritten).toBeGreaterThanOrEqual(3);
  });
});

describe('previewConfig', () => {
  async function createTestZipWithMetadata(zipPath: string, metadata: Record<string, unknown>): Promise<void> {
    await fs.ensureDir(path.dirname(zipPath));

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 1 } });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });
      archive.finalize();
    });
  }

  it('should return metadata without extracting files', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'preview.zip');
    const metadata = {
      version: '1.3.0',
      exportedAt: new Date().toISOString(),
      projectRoot: 'test',
      agents: ['backend'],
      skills: ['typescript'],
      hasHooks: true,
      hasCLAUDEmd: true,
    };
    await createTestZipWithMetadata(zipPath, metadata);

    // Act
    const result = await previewConfig(zipPath);

    // Assert
    expect(result).not.toBeNull();
    expect(result?.agents).toContain('backend');
    expect(result?.skills).toContain('typescript');
    expect(result?.hasHooks).toBe(true);
  });

  it('should throw when zip file does not exist', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'nonexistent.zip');

    // Act & Assert
    await expect(
      previewConfig(zipPath)
    ).rejects.toThrow('File not found');
  });

  it('should return null when metadata.json is not in the zip', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'no-meta.zip');
    await fs.ensureDir(path.dirname(zipPath));

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 1 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.append('test', { name: 'test.txt' });
      archive.finalize();
    });

    // Act
    const result = await previewConfig(zipPath);

    // Assert
    expect(result).toBeNull();
  });

  it('should not write any files to disk', async () => {
    // Arrange
    const zipPath = path.join(testDir, 'preview.zip');
    const metadata = {
      version: '1.3.0',
      exportedAt: new Date().toISOString(),
      projectRoot: 'test',
      agents: ['backend'],
      skills: ['typescript'],
      hasHooks: false,
      hasCLAUDEmd: true,
    };
    await createTestZipWithMetadata(zipPath, metadata);

    // Act
    await previewConfig(zipPath);

    // Assert
    expect(await fs.pathExists(path.join(projectRoot, '.claude'))).toBe(false);
    expect(await fs.pathExists(path.join(projectRoot, 'CLAUDE.md'))).toBe(false);
  });
});
