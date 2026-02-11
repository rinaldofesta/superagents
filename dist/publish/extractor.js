/**
 * Blueprint extractor — reads project state and builds PublishedBlueprintMeta
 */
// Node.js built-ins
import path from 'path';
// External packages
import fs from 'fs-extra';
// Internal modules
import { parseRoadmap } from '../status/parser.js';
import { ConfigUpdater } from '../updater/index.js';
export async function extractBlueprint(projectRoot, meta) {
    const roadmapPath = path.join(projectRoot, 'ROADMAP.md');
    const pkgPath = path.join(projectRoot, 'package.json');
    // Parse ROADMAP.md into phases
    const phases = [];
    if (await fs.pathExists(roadmapPath)) {
        const content = await fs.readFile(roadmapPath, 'utf-8');
        const parsed = parseRoadmap(content);
        for (const phase of parsed) {
            phases.push({
                name: phase.name,
                description: `Phase ${phase.number} of the project`,
                tasks: phase.tasks.map(t => ({
                    title: t.title,
                    description: t.description ?? t.title,
                })),
            });
        }
    }
    // Extract stack from package.json dependencies
    const stack = [];
    if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        const deps = Object.keys(pkg.dependencies || {});
        stack.push(...deps);
    }
    // Read agents + skills
    const updater = new ConfigUpdater(projectRoot);
    let agents = [];
    let skills = [];
    if (await updater.hasExistingConfig()) {
        const existing = await updater.readExisting();
        agents = existing.agents;
        skills = existing.skills;
    }
    return {
        format: 'superagents-blueprint',
        formatVersion: 1,
        name: meta.name,
        author: meta.author,
        description: meta.description,
        version: meta.version,
        keywords: meta.keywords,
        stack,
        phases,
        agents,
        skills,
        publishedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=extractor.js.map