/**
 * Unit tests for codebase analyzer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { CodebaseAnalyzer } from '../../../src/analyzer/codebase-analyzer.js';

const testDir = path.join(os.tmpdir(), `superagents-analyzer-test-${Date.now()}`);

beforeEach(async () => {
  await fs.ensureDir(testDir);
});

afterEach(async () => {
  await fs.remove(testDir);
});

describe('CodebaseAnalyzer', () => {
  describe('detectProjectType', () => {
    it('should detect nextjs from next.config.js', async () => {
      await fs.writeFile(path.join(testDir, 'next.config.js'), 'module.exports = {}');

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.projectType).toBe('nextjs');
    });

    it('should detect angular from angular.json', async () => {
      await fs.writeFile(path.join(testDir, 'angular.json'), '{}');

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.projectType).toBe('angular');
    });

    it('should detect react from package.json dependencies', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        dependencies: { react: '^18.0.0' }
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.projectType).toBe('react');
    });

    it('should detect node from express dependency', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        dependencies: { express: '^4.18.0' }
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.projectType).toBe('node');
    });

    it('should detect python from requirements.txt', async () => {
      await fs.writeFile(path.join(testDir, 'requirements.txt'), 'django==4.0.0');

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.projectType).toBe('python');
    });

    it('should detect go from go.mod', async () => {
      await fs.writeFile(path.join(testDir, 'go.mod'), 'module example.com/app\n\ngo 1.21');

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.projectType).toBe('go');
    });

    it('should detect rust from Cargo.toml', async () => {
      await fs.writeFile(path.join(testDir, 'Cargo.toml'), '[package]\nname = "app"');

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.projectType).toBe('rust');
    });

    it('should return unknown for empty directory', async () => {
      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.projectType).toBe('unknown');
    });
  });

  describe('detectFramework', () => {
    it('should detect nextjs from package.json', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        dependencies: { next: '^14.0.0' }
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.framework).toBe('nextjs');
    });

    it('should detect express from package.json', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        dependencies: { express: '^4.18.0' }
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.framework).toBe('express');
    });

    it('should detect django from requirements.txt', async () => {
      await fs.writeFile(path.join(testDir, 'requirements.txt'), 'django==4.0.0\nrequests==2.28.0');

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.framework).toBe('django');
    });

    it('should return null when no framework detected', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        dependencies: { lodash: '^4.17.21' }
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.framework).toBeNull();
    });
  });

  describe('detectPackageManager', () => {
    it('should detect yarn from yarn.lock', async () => {
      await fs.writeFile(path.join(testDir, 'yarn.lock'), '');
      await fs.writeJson(path.join(testDir, 'package.json'), {});

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.packageManager).toBe('yarn');
    });

    it('should detect pnpm from pnpm-lock.yaml', async () => {
      await fs.writeFile(path.join(testDir, 'pnpm-lock.yaml'), '');
      await fs.writeJson(path.join(testDir, 'package.json'), {});

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.packageManager).toBe('pnpm');
    });

    it('should detect bun from bun.lockb', async () => {
      await fs.writeFile(path.join(testDir, 'bun.lockb'), '');
      await fs.writeJson(path.join(testDir, 'package.json'), {});

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.packageManager).toBe('bun');
    });

    it('should default to npm when no lockfile present', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {});

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.packageManager).toBe('npm');
    });
  });

  describe('generateNegativeConstraints', () => {
    it('should generate constraint for prisma over drizzle', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        dependencies: { prisma: '^5.0.0' }
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      const prismaConstraints = result.negativeConstraints.filter(
        c => c.technology === 'Prisma' && c.alternative === 'Drizzle'
      );

      expect(prismaConstraints).toHaveLength(1);
      expect(prismaConstraints[0].rule).toBe('Use Prisma, NOT Drizzle');
    });

    it('should generate constraint for vitest over jest', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        devDependencies: { vitest: '^4.0.0' }
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      const vitestConstraints = result.negativeConstraints.filter(
        c => c.technology === 'Vitest' && c.alternative === 'Jest'
      );

      expect(vitestConstraints).toHaveLength(1);
      expect(vitestConstraints[0].rule).toBe('Use Vitest, NOT Jest');
    });

    it('should not generate constraints when no matching deps', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        dependencies: { lodash: '^4.17.21' }
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.negativeConstraints).toHaveLength(0);
    });
  });

  describe('inferAgents', () => {
    it('should include backend-engineer for nextjs project', async () => {
      await fs.writeFile(path.join(testDir, 'next.config.js'), 'module.exports = {}');

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.suggestedAgents).toContain('backend-engineer');
    });

    it('should include backend-engineer when components pattern detected', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        dependencies: { react: '^18.0.0' }
      });

      // Create a component file
      await fs.ensureDir(path.join(testDir, 'components'));
      await fs.writeFile(
        path.join(testDir, 'components', 'Button.tsx'),
        'export const Button = () => <button>Click</button>;'
      );

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.suggestedAgents).toContain('backend-engineer');
    });

    it('should always include code-reviewer and debugger', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {});

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.suggestedAgents).toContain('code-reviewer');
      expect(result.suggestedAgents).toContain('debugger');
    });
  });

  describe('inferSkills', () => {
    it('should include nextjs skill when framework is nextjs', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        dependencies: { next: '^14.0.0' }
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.suggestedSkills).toContain('nextjs');
    });

    it('should include typescript skill when typescript dependency present', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        devDependencies: { typescript: '^5.0.0' }
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.suggestedSkills).toContain('typescript');
    });

    it('should include tailwind skill when tailwindcss dependency present', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        devDependencies: { tailwindcss: '^3.0.0' }
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.suggestedSkills).toContain('tailwind');
    });

    it('should include multiple skills from dependencies', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        dependencies: {
          next: '^14.0.0',
          '@supabase/supabase-js': '^2.0.0',
          stripe: '^13.0.0'
        },
        devDependencies: {
          typescript: '^5.0.0'
        }
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.suggestedSkills).toContain('nextjs');
      expect(result.suggestedSkills).toContain('typescript');
      expect(result.suggestedSkills).toContain('supabase');
      expect(result.suggestedSkills).toContain('stripe');
    });
  });

  describe('detectEnvFiles', () => {
    it('should detect .env file', async () => {
      await fs.writeFile(path.join(testDir, '.env'), 'API_KEY=test');
      await fs.writeJson(path.join(testDir, 'package.json'), {});

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.hasEnvFile).toBe(true);
    });

    it('should detect .env.local file', async () => {
      await fs.writeFile(path.join(testDir, '.env.local'), 'API_KEY=test');
      await fs.writeJson(path.join(testDir, 'package.json'), {});

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.hasEnvFile).toBe(true);
    });

    it('should return false when no env files present', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {});

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.hasEnvFile).toBe(false);
    });
  });

  describe('detectMonorepo', () => {
    it('should detect npm workspaces', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        workspaces: ['packages/*']
      });

      // Create a workspace package
      await fs.ensureDir(path.join(testDir, 'packages', 'app'));
      await fs.writeJson(path.join(testDir, 'packages', 'app', 'package.json'), {
        name: '@monorepo/app'
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.monorepo).not.toBeNull();
      expect(result.monorepo?.isMonorepo).toBe(true);
      expect(result.monorepo?.tool).toBe('npm');
      expect(result.monorepo?.packages).toHaveLength(1);
      expect(result.monorepo?.packages[0].name).toBe('@monorepo/app');
    });

    it('should detect yarn workspaces', async () => {
      await fs.writeFile(path.join(testDir, 'yarn.lock'), '');
      await fs.writeJson(path.join(testDir, 'package.json'), {
        workspaces: ['packages/*']
      });

      // Create a workspace package
      await fs.ensureDir(path.join(testDir, 'packages', 'ui'));
      await fs.writeJson(path.join(testDir, 'packages', 'ui', 'package.json'), {
        name: '@monorepo/ui'
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.monorepo?.tool).toBe('yarn');
    });

    it('should detect pnpm workspace', async () => {
      // Need root package.json for analyzer to work
      await fs.writeJson(path.join(testDir, 'package.json'), {
        name: 'monorepo-root'
      });

      await fs.writeFile(
        path.join(testDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"\n'
      );

      // Create a workspace package
      await fs.ensureDir(path.join(testDir, 'packages', 'core'));
      await fs.writeJson(path.join(testDir, 'packages', 'core', 'package.json'), {
        name: '@monorepo/core'
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.monorepo?.tool).toBe('pnpm');
    });

    it('should return null for non-monorepo project', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        name: 'regular-project'
      });

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      expect(result.monorepo).toBeNull();
    });
  });

  describe('.superagentsignore', () => {
    it('should respect ignore patterns from .superagentsignore', async () => {
      await fs.writeJson(path.join(testDir, 'package.json'), {
        dependencies: { express: '^4.18.0' }
      });

      // Create files in both regular and ignored directories
      await fs.ensureDir(path.join(testDir, 'src'));
      await fs.ensureDir(path.join(testDir, 'ignored'));

      await fs.writeFile(path.join(testDir, 'src', 'index.ts'), 'console.log("src");');
      await fs.writeFile(path.join(testDir, 'ignored', 'test.ts'), 'console.log("ignored");');

      // Create ignore file
      await fs.writeFile(path.join(testDir, '.superagentsignore'), 'ignored/**\n');

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      // The ignored directory should not affect file counts
      const ignoredFileInSamples = result.sampledFiles.some(
        f => f.path.includes('ignored/')
      );
      expect(ignoredFileInSamples).toBe(false);
    });
  });

  describe('full analyze() integration', () => {
    it('should analyze a complete Node.js project', async () => {
      // Setup a realistic project structure
      await fs.writeJson(path.join(testDir, 'package.json'), {
        name: 'test-project',
        scripts: {
          dev: 'node index.js',
          test: 'vitest',
          build: 'tsc'
        },
        dependencies: {
          express: '^4.18.0',
          typescript: '^5.0.0'
        },
        devDependencies: {
          vitest: '^4.0.0',
          '@types/node': '^20.0.0'
        }
      });

      await fs.writeJson(path.join(testDir, 'tsconfig.json'), {
        compilerOptions: { strict: true }
      });

      // Create some source files
      await fs.ensureDir(path.join(testDir, 'src'));
      await fs.writeFile(
        path.join(testDir, 'src', 'index.ts'),
        'import express from "express";\nconst app = express();'
      );

      await fs.ensureDir(path.join(testDir, 'src', 'services'));
      await fs.writeFile(
        path.join(testDir, 'src', 'services', 'user.ts'),
        'export class UserService {}'
      );

      const analyzer = new CodebaseAnalyzer(testDir);
      const result = await analyzer.analyze();

      // Verify all aspects of the analysis
      expect(result.projectType).toBe('node');
      expect(result.framework).toBe('express');
      expect(result.language).toBe('typescript');
      expect(result.packageManager).toBe('npm');
      expect(result.dependencies).toHaveLength(2);
      expect(result.devDependencies).toHaveLength(2);
      expect(result.totalFiles).toBeGreaterThan(0);
      expect(result.totalLines).toBeGreaterThan(0);
      expect(result.testCommand).toBe('npm test');
      expect(result.devCommand).toBe('npm run dev');
      expect(result.buildCommand).toBe('npm run build');

      // Check patterns
      const servicePattern = result.detectedPatterns.find(p => p.type === 'services');
      expect(servicePattern).toBeDefined();
      expect(servicePattern?.paths).toHaveLength(1);

      // Check negative constraints
      const vitestConstraint = result.negativeConstraints.find(
        c => c.technology === 'Vitest'
      );
      expect(vitestConstraint).toBeDefined();

      // Check suggested skills
      expect(result.suggestedSkills).toContain('typescript');
      expect(result.suggestedSkills).toContain('express');

      // Check metadata
      expect(result.analyzedAt).toBeDefined();
      expect(result.analysisTimeMs).toBeGreaterThan(0);
    });
  });
});
