/**
 * Handoff context collector — gathers project state for HANDOFF.md generation
 */

// Node.js built-ins
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

// External packages
import fs from 'fs-extra';

// Internal modules
import { parseRoadmap } from '../status/parser.js';
import { ConfigUpdater } from '../updater/index.js';

// Type imports
import type { HandoffContext } from '../types/handoff.js';

const execAsync = promisify(exec);

export async function collectHandoffContext(projectRoot: string): Promise<HandoffContext> {
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
  const roadmapPath = path.join(projectRoot, 'ROADMAP.md');
  const pkgPath = path.join(projectRoot, 'package.json');

  // Project name + description from CLAUDE.md
  let projectName = path.basename(projectRoot);
  let description = '';

  if (await fs.pathExists(claudeMdPath)) {
    const content = await fs.readFile(claudeMdPath, 'utf-8');
    const headingMatch = content.match(/^# (.+)/m);
    if (headingMatch) {
      projectName = headingMatch[1].trim();
    }
    // First non-empty paragraph after heading
    const lines = content.split('\n');
    let foundHeading = false;
    for (const line of lines) {
      if (line.startsWith('# ')) {
        foundHeading = true;
        continue;
      }
      if (foundHeading && line.trim() && !line.startsWith('#')) {
        description = line.trim();
        break;
      }
    }
  }

  // Tech stack from package.json
  let techStack = 'unknown';
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    const deps = Object.keys(pkg.dependencies || {});
    const framework = deps.find(d => ['next', 'react', 'vue', 'express', 'fastify', 'hono', 'svelte'].includes(d));
    const lang = deps.includes('typescript') || (pkg.devDependencies && Object.keys(pkg.devDependencies).includes('typescript'))
      ? 'TypeScript'
      : 'JavaScript';
    techStack = framework ? `${lang} / ${framework}` : lang;
    if (deps.length > 0) {
      techStack += ` | ${deps.length} deps`;
    }
  }

  // Build status
  let buildStatus: 'passing' | 'failing' | 'unknown' = 'unknown';
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    if (pkg.scripts?.build) {
      try {
        await execAsync('npm run build', { cwd: projectRoot, timeout: 30000 });
        buildStatus = 'passing';
      } catch {
        buildStatus = 'failing';
      }
    }
  }

  // File count
  let fileCount = 0;
  try {
    const { stdout } = await execAsync('find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" | wc -l', {
      cwd: projectRoot,
      timeout: 10000,
    });
    fileCount = parseInt(stdout.trim(), 10) || 0;
  } catch {
    fileCount = 0;
  }

  // Roadmap progress + next steps
  let roadmapProgress: string | null = null;
  const nextSteps: string[] = [];

  if (await fs.pathExists(roadmapPath)) {
    const content = await fs.readFile(roadmapPath, 'utf-8');
    const phases = parseRoadmap(content);

    if (phases.length > 0) {
      // Find current phase (first with incomplete tasks)
      const currentPhase = phases.find(p => p.tasks.some(t => !t.done));
      if (currentPhase) {
        const done = currentPhase.tasks.filter(t => t.done).length;
        const total = currentPhase.tasks.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        roadmapProgress = `Phase ${currentPhase.number}: ${done}/${total} tasks (${pct}%)`;
      } else {
        // All phases complete
        const totalDone = phases.reduce((sum, p) => sum + p.tasks.filter(t => t.done).length, 0);
        const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
        roadmapProgress = `All ${phases.length} phases complete (${totalDone}/${totalTasks} tasks)`;
      }

      // Collect next incomplete tasks (up to 5)
      for (const phase of phases) {
        for (const task of phase.tasks) {
          if (!task.done && nextSteps.length < 5) {
            nextSteps.push(task.title);
          }
        }
      }
    }
  }

  // Agents + skills from .claude/
  const updater = new ConfigUpdater(projectRoot);
  let agents: string[] = [];
  let skills: string[] = [];

  if (await updater.hasExistingConfig()) {
    const existing = await updater.readExisting();
    agents = existing.agents;
    skills = existing.skills;
  }

  return {
    projectName,
    description,
    techStack,
    buildStatus,
    fileCount,
    roadmapProgress,
    agents,
    skills,
    nextSteps,
    generatedAt: new Date().toISOString(),
  };
}
