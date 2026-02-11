/**
 * Blueprint packager — creates a distributable .blueprint.zip
 */
// Node.js built-ins
import path from 'path';
// External packages
import archiver from 'archiver';
import fs from 'fs-extra';
export async function packageBlueprint(projectRoot, meta, outputPath) {
    const claudeDir = path.join(projectRoot, '.claude');
    const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
    const roadmapPath = path.join(projectRoot, 'ROADMAP.md');
    await fs.ensureDir(path.dirname(outputPath));
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        output.on('close', () => {
            resolve(outputPath);
        });
        archive.on('error', reject);
        archive.pipe(output);
        // Add blueprint.json metadata
        archive.append(JSON.stringify(meta, null, 2), { name: 'blueprint.json' });
        // Add .claude/ directory
        if (fs.pathExistsSync(claudeDir)) {
            archive.directory(claudeDir, '.claude');
        }
        // Add CLAUDE.md if exists
        if (fs.pathExistsSync(claudeMdPath)) {
            archive.file(claudeMdPath, { name: 'CLAUDE.md' });
        }
        // Add ROADMAP.md if exists
        if (fs.pathExistsSync(roadmapPath)) {
            archive.file(roadmapPath, { name: 'ROADMAP.md' });
        }
        archive.finalize();
    });
}
//# sourceMappingURL=packager.js.map