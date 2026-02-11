/**
 * Blueprint installer — extracts and applies a published blueprint zip
 */

// Node.js built-ins
import path from 'path';

// External packages
import fs from 'fs-extra';
import unzipper from 'unzipper';

// Internal modules
import { PublishedBlueprintMetaSchema } from '../schemas/index.js';

// Type imports
import type { PublishedBlueprintMeta } from '../types/published-blueprint.js';

export async function installBlueprint(
  zipPath: string,
  projectRoot: string,
  options: { force?: boolean; preview?: boolean }
): Promise<{ meta: PublishedBlueprintMeta; filesWritten: number }> {
  if (!(await fs.pathExists(zipPath))) {
    throw new Error(`File not found: ${zipPath}`);
  }

  // Extract to temp directory
  const tempDir = path.join(projectRoot, '.superagents-use-temp');
  await fs.remove(tempDir);
  await fs.ensureDir(tempDir);

  let filesWritten = 0;

  try {
    // Extract zip
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: tempDir }))
        .on('close', resolve)
        .on('error', reject);
    });

    // Read and validate blueprint.json
    const metaPath = path.join(tempDir, 'blueprint.json');
    if (!(await fs.pathExists(metaPath))) {
      throw new Error('Invalid blueprint: missing blueprint.json');
    }

    const raw = await fs.readJSON(metaPath);
    const meta = PublishedBlueprintMetaSchema.parse(raw) as PublishedBlueprintMeta;

    // Preview mode — just return meta
    if (options.preview) {
      return { meta, filesWritten: 0 };
    }

    // Check for existing .claude/
    const claudeDir = path.join(projectRoot, '.claude');
    if ((await fs.pathExists(claudeDir)) && !options.force) {
      throw new Error('Existing .claude/ configuration found. Use --force to overwrite.');
    }

    // Remove existing .claude/ if overwriting
    if (await fs.pathExists(claudeDir)) {
      await fs.remove(claudeDir);
    }

    // Move .claude/ directory
    const extractedClaudeDir = path.join(tempDir, '.claude');
    if (await fs.pathExists(extractedClaudeDir)) {
      await fs.move(extractedClaudeDir, claudeDir);
      filesWritten += await countFiles(claudeDir);
    }

    // Move CLAUDE.md
    const extractedClaudeMd = path.join(tempDir, 'CLAUDE.md');
    if (await fs.pathExists(extractedClaudeMd)) {
      await fs.move(extractedClaudeMd, path.join(projectRoot, 'CLAUDE.md'), { overwrite: true });
      filesWritten++;
    }

    // Move ROADMAP.md
    const extractedRoadmap = path.join(tempDir, 'ROADMAP.md');
    if (await fs.pathExists(extractedRoadmap)) {
      await fs.move(extractedRoadmap, path.join(projectRoot, 'ROADMAP.md'), { overwrite: true });
      filesWritten++;
    }

    return { meta, filesWritten };
  } finally {
    await fs.remove(tempDir);
  }
}

async function countFiles(dir: string): Promise<number> {
  let count = 0;
  const items = await fs.readdir(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isFile()) {
      count++;
    } else if (item.isDirectory()) {
      count += await countFiles(path.join(dir, item.name));
    }
  }
  return count;
}
