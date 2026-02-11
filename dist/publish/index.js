/**
 * Publish command — package a project as a reusable blueprint zip
 */
// Node.js built-ins
import path from 'path';
// External packages
import * as p from '@clack/prompts';
import fs from 'fs-extra';
import pc from 'picocolors';
// Internal modules
import { PublishedBlueprintMetaSchema } from '../schemas/index.js';
import { extractBlueprint } from './extractor.js';
import { packageBlueprint } from './packager.js';
export async function runPublish(projectRoot, outputDir) {
    const claudeDir = path.join(projectRoot, '.claude');
    const roadmapPath = path.join(projectRoot, 'ROADMAP.md');
    if (!(await fs.pathExists(claudeDir))) {
        console.log(pc.red('\n  No .claude/ folder found in this project.'));
        console.log(pc.dim('  Run superagents first to create a configuration.\n'));
        return;
    }
    if (!(await fs.pathExists(roadmapPath))) {
        console.log(pc.red('\n  No ROADMAP.md found in this project.'));
        console.log(pc.dim('  A roadmap is required to publish a blueprint. Select a blueprint when running superagents.\n'));
        return;
    }
    // Prompt for metadata
    const name = await p.text({
        message: 'Blueprint name',
        placeholder: path.basename(projectRoot),
        defaultValue: path.basename(projectRoot),
    });
    if (p.isCancel(name)) {
        p.cancel('Cancelled');
        return;
    }
    const author = await p.text({
        message: 'Author',
        placeholder: 'your-name',
    });
    if (p.isCancel(author)) {
        p.cancel('Cancelled');
        return;
    }
    const description = await p.text({
        message: 'Description',
        placeholder: 'A brief description of this blueprint',
    });
    if (p.isCancel(description)) {
        p.cancel('Cancelled');
        return;
    }
    const version = await p.text({
        message: 'Version',
        placeholder: '1.0.0',
        defaultValue: '1.0.0',
    });
    if (p.isCancel(version)) {
        p.cancel('Cancelled');
        return;
    }
    const keywordsRaw = await p.text({
        message: 'Keywords (comma-separated)',
        placeholder: 'saas, typescript, nextjs',
        defaultValue: '',
    });
    if (p.isCancel(keywordsRaw)) {
        p.cancel('Cancelled');
        return;
    }
    const keywords = keywordsRaw
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
    const spinner = p.spinner();
    spinner.start('Extracting blueprint...');
    const meta = await extractBlueprint(projectRoot, {
        name: name,
        author: author,
        description: description,
        version: version,
        keywords,
    });
    // Validate at boundary
    PublishedBlueprintMetaSchema.parse(meta);
    const filename = `${meta.name}-v${meta.version}.blueprint.zip`;
    const outDir = outputDir || projectRoot;
    const outputPath = path.join(outDir, filename);
    spinner.message('Packaging blueprint...');
    const resultPath = await packageBlueprint(projectRoot, meta, outputPath);
    const stats = await fs.stat(resultPath);
    spinner.stop(pc.green('✓') + ' Blueprint published');
    console.log(pc.green('\n  ✓ Blueprint created!\n'));
    console.log(pc.dim(`  File: ${resultPath}`));
    console.log(pc.dim(`  Size: ${formatBytes(stats.size)}`));
    console.log(pc.dim(`  Phases: ${meta.phases.length}`));
    console.log(pc.dim(`  Agents: ${meta.agents.join(', ') || 'none'}`));
    console.log(pc.dim(`  Skills: ${meta.skills.join(', ') || 'none'}`));
    console.log('');
    console.log(pc.dim('  Share this file or use it with: superagents use <path>'));
    console.log('');
}
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
//# sourceMappingURL=index.js.map