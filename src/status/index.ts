/**
 * Status command — reads ROADMAP.md and displays project progress
 */

import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

import fs from 'fs-extra';
import pc from 'picocolors';

import { displayStatus } from './display.js';
import { parseRoadmap } from './parser.js';

const execAsync = promisify(exec);

export async function runStatus(projectRoot: string): Promise<void> {
  const roadmapPath = path.join(projectRoot, 'ROADMAP.md');

  if (!(await fs.pathExists(roadmapPath))) {
    console.log(pc.yellow('\n  No ROADMAP.md found in this project.'));
    console.log(pc.dim('  Run superagents in a new project and select a blueprint to generate one.\n'));
    return;
  }

  const content = await fs.readFile(roadmapPath, 'utf-8');
  const phases = parseRoadmap(content);

  if (phases.length === 0) {
    console.log(pc.yellow('\n  ROADMAP.md found but no phases detected.'));
    console.log(pc.dim('  Expected format: ## Phase N: Name with - [ ] task lines.\n'));
    return;
  }

  // Optionally check build status
  let buildOk = true;
  try {
    const pkgPath = path.join(projectRoot, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      const buildCmd = pkg.scripts?.build;
      if (buildCmd) {
        await execAsync(`npm run build`, { cwd: projectRoot, timeout: 30000 });
      }
    }
  } catch {
    buildOk = false;
  }

  displayStatus(phases, buildOk);
}
