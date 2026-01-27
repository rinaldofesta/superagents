/**
 * Codebase analyzer - detects project type, frameworks, and patterns
 */
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
export class CodebaseAnalyzer {
    projectRoot;
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
    }
    async analyze() {
        const startTime = Date.now();
        // Run analysis in parallel for performance
        const [projectType, framework, hasPackageJson, hasTsConfig] = await Promise.all([
            this.detectProjectType(),
            this.detectFramework(),
            fs.pathExists(path.join(this.projectRoot, 'package.json')),
            fs.pathExists(path.join(this.projectRoot, 'tsconfig.json'))
        ]);
        const language = hasTsConfig ? 'typescript' : 'javascript';
        // Get dependencies if package.json exists
        const dependencies = hasPackageJson
            ? await this.getDependencies()
            : [];
        // Detect patterns
        const patterns = await this.detectPatterns();
        // Sample important files for AI generation context
        const sampledFiles = await this.sampleFiles(projectType, framework, patterns);
        // Infer agents and skills based on what we found
        const suggestedAgents = this.inferAgents(projectType, patterns);
        const suggestedSkills = this.inferSkills(framework, dependencies);
        return {
            projectRoot: this.projectRoot,
            projectType,
            language,
            framework,
            dependencies,
            devDependencies: [],
            fileStructure: [],
            totalFiles: 0,
            totalLines: 0,
            detectedPatterns: patterns,
            suggestedSkills,
            suggestedAgents,
            existingClaudeConfig: null,
            mcpServers: [],
            sampledFiles,
            analyzedAt: new Date().toISOString(),
            analysisTimeMs: Date.now() - startTime
        };
    }
    async detectProjectType() {
        // Check for Next.js
        const nextConfigFiles = [
            'next.config.js',
            'next.config.mjs',
            'next.config.ts'
        ];
        for (const configFile of nextConfigFiles) {
            if (await fs.pathExists(path.join(this.projectRoot, configFile))) {
                return 'nextjs';
            }
        }
        // Check package.json for framework dependencies
        const pkgPath = path.join(this.projectRoot, 'package.json');
        if (await fs.pathExists(pkgPath)) {
            const pkg = await fs.readJson(pkgPath);
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            if (deps['next'])
                return 'nextjs';
            if (deps['react'])
                return 'react';
            if (deps['vue'])
                return 'vue';
            if (deps['express'] || deps['fastify'])
                return 'node';
        }
        // Check for other project types
        if (await fs.pathExists(path.join(this.projectRoot, 'requirements.txt'))) {
            return 'python';
        }
        if (await fs.pathExists(path.join(this.projectRoot, 'go.mod'))) {
            return 'go';
        }
        if (await fs.pathExists(path.join(this.projectRoot, 'Cargo.toml'))) {
            return 'rust';
        }
        return 'unknown';
    }
    async detectFramework() {
        const pkgPath = path.join(this.projectRoot, 'package.json');
        if (!(await fs.pathExists(pkgPath))) {
            return null;
        }
        const pkg = await fs.readJson(pkgPath);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps['next'])
            return 'nextjs';
        if (deps['@nuxt/core'])
            return 'nuxtjs';
        if (deps['vue'])
            return 'vue';
        if (deps['@angular/core'])
            return 'angular';
        if (deps['svelte'])
            return 'svelte';
        if (deps['express'])
            return 'express';
        if (deps['fastify'])
            return 'fastify';
        if (deps['@nestjs/core'])
            return 'nestjs';
        return null;
    }
    async getDependencies() {
        const pkgPath = path.join(this.projectRoot, 'package.json');
        const pkg = await fs.readJson(pkgPath);
        return Object.entries(pkg.dependencies || {}).map(([name, version]) => ({
            name,
            version: version,
            category: this.categorizeDependency(name)
        }));
    }
    categorizeDependency(name) {
        // UI libraries
        if (['react', 'vue', '@angular/core', 'svelte'].includes(name))
            return 'framework';
        if (['tailwindcss', '@shadcn/ui', 'styled-components'].includes(name))
            return 'ui';
        // Database
        if (['postgres', 'mysql', 'mongodb', 'redis'].some(db => name.includes(db)))
            return 'database';
        // ORM
        if (['prisma', 'drizzle-orm', 'typeorm', 'sequelize'].includes(name))
            return 'orm';
        // Auth
        if (['next-auth', '@clerk/nextjs', '@supabase/auth'].some(auth => name.includes(auth)))
            return 'auth';
        // Payments
        if (['stripe', '@stripe/stripe-js', 'paypal'].some(pay => name.includes(pay)))
            return 'payments';
        // Testing
        if (['vitest', 'jest', 'playwright', 'cypress'].includes(name))
            return 'testing';
        // Build tools
        if (['vite', 'webpack', 'esbuild', 'turbo'].includes(name))
            return 'build';
        return 'other';
    }
    async detectPatterns() {
        const patterns = [];
        try {
            // API routes (Next.js App Router)
            const apiRoutes = await glob('**/app/**/route.{ts,js}', {
                cwd: this.projectRoot,
                ignore: ['node_modules/**', '.next/**', 'dist/**']
            });
            if (apiRoutes.length > 0) {
                patterns.push({
                    type: 'api-routes',
                    paths: apiRoutes,
                    confidence: 1.0,
                    description: 'Next.js App Router API routes'
                });
            }
            // React components
            const components = await glob('**/components/**/*.{tsx,jsx}', {
                cwd: this.projectRoot,
                ignore: ['node_modules/**', '.next/**', 'dist/**']
            });
            if (components.length > 0) {
                patterns.push({
                    type: 'components',
                    paths: components,
                    confidence: 1.0,
                    description: 'React components'
                });
            }
        }
        catch (error) {
            // Ignore glob errors
        }
        return patterns;
    }
    inferAgents(projectType, patterns) {
        const agents = new Set();
        // Always useful
        agents.add('code-reviewer');
        agents.add('debugger');
        // Based on project type
        if (projectType === 'nextjs' || projectType === 'react' || projectType === 'vue') {
            agents.add('backend-engineer');
        }
        // Based on patterns
        if (patterns.some(p => p.type === 'components')) {
            agents.add('backend-engineer');
        }
        if (patterns.some(p => p.type === 'api-routes')) {
            agents.add('backend-engineer');
        }
        return Array.from(agents);
    }
    inferSkills(framework, dependencies) {
        const skills = new Set();
        // Framework-based
        if (framework) {
            skills.add(framework);
        }
        // Dependency-based
        for (const dep of dependencies) {
            if (dep.name === 'typescript')
                skills.add('typescript');
            if (dep.name === 'tailwindcss')
                skills.add('tailwind');
            if (dep.name === '@supabase/supabase-js')
                skills.add('supabase');
            if (dep.name === 'stripe')
                skills.add('stripe');
            if (dep.name.startsWith('prisma'))
                skills.add('prisma');
            if (dep.name === 'drizzle-orm')
                skills.add('drizzle');
        }
        return Array.from(skills);
    }
    /**
     * Sample important files for AI generation context
     * Prioritizes configuration files, entry points, and representative code
     */
    async sampleFiles(projectType, _framework, patterns) {
        const sampledFiles = [];
        const maxFiles = 20;
        const maxFileSize = 100000; // 100KB max per file
        const maxLines = 500; // Max 500 lines per file
        try {
            // Always include package.json and tsconfig if they exist
            await this.tryAddFile(sampledFiles, 'package.json', 'Project dependencies and scripts');
            await this.tryAddFile(sampledFiles, 'tsconfig.json', 'TypeScript configuration');
            // Include framework config files
            if (projectType === 'nextjs') {
                await this.tryAddFile(sampledFiles, 'next.config.js', 'Next.js configuration');
                await this.tryAddFile(sampledFiles, 'next.config.mjs', 'Next.js configuration');
                await this.tryAddFile(sampledFiles, 'next.config.ts', 'Next.js configuration');
            }
            // Sample a few files from each pattern type
            for (const pattern of patterns) {
                const filesToSample = Math.min(3, pattern.paths.length);
                for (let i = 0; i < filesToSample && sampledFiles.length < maxFiles; i++) {
                    const filePath = pattern.paths[i];
                    await this.tryAddFile(sampledFiles, filePath, `Example ${pattern.type}`, maxFileSize, maxLines);
                }
            }
            // Try to find entry point files
            const entryPoints = [
                'src/index.ts',
                'src/index.js',
                'src/main.ts',
                'src/main.js',
                'index.ts',
                'index.js',
                'app/layout.tsx',
                'app/page.tsx'
            ];
            for (const entryPoint of entryPoints) {
                if (sampledFiles.length >= maxFiles)
                    break;
                await this.tryAddFile(sampledFiles, entryPoint, 'Entry point file', maxFileSize, maxLines);
            }
        }
        catch (error) {
            // If file sampling fails, continue with empty array
            console.warn('Warning: File sampling failed', error);
        }
        return sampledFiles;
    }
    /**
     * Try to add a file to sampled files array
     */
    async tryAddFile(sampledFiles, relativePath, purpose, maxSize = 100000, maxLines = 500) {
        const fullPath = path.join(this.projectRoot, relativePath);
        try {
            if (!(await fs.pathExists(fullPath))) {
                return;
            }
            const stats = await fs.stat(fullPath);
            // Skip if file is too large
            if (stats.size > maxSize) {
                return;
            }
            let content = await fs.readFile(fullPath, 'utf-8');
            // Truncate if too many lines
            const lines = content.split('\n');
            if (lines.length > maxLines) {
                content = lines.slice(0, maxLines).join('\n') + '\n\n[... truncated ...]';
            }
            sampledFiles.push({
                path: relativePath,
                content,
                purpose
            });
        }
        catch (error) {
            // Silently skip files that can't be read
        }
    }
}
//# sourceMappingURL=codebase-analyzer.js.map