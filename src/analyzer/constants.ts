/**
 * Hardcoded lookup tables for codebase analysis.
 * Extracted to keep codebase-analyzer.ts focused on logic rather than data.
 */

import type { ProgrammingLanguage } from '../types/codebase.js';

/** Maps file extension to programming language */
export const EXTENSION_TO_LANGUAGE: Record<string, ProgrammingLanguage> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  go: 'go',
  rs: 'rust',
  java: 'java',
  cs: 'csharp',
  php: 'php',
  rb: 'ruby'
};

/** npm package names that indicate a CLI project */
export const CLI_DEPS = ['commander', 'yargs', 'oclif', 'ink', 'meow', 'cac', 'citty'];

/** npm package names that indicate a server/backend project */
export const SERVER_DEPS = ['@nestjs/core', 'koa', 'hapi', '@hapi/hapi', 'restify'];

/** Common entry point filenames to sample for AI context */
export const ENTRY_POINTS = [
  'src/index.ts',
  'src/index.js',
  'src/main.ts',
  'src/main.js',
  'index.ts',
  'index.js',
  'app/layout.tsx',
  'app/page.tsx'
];

/**
 * Mutually-exclusive technology groups for negative constraint generation.
 * Each inner array is [packageName, displayName] pairs within a group.
 * When one package is installed, all others in the group become "do not use" constraints.
 */
export const NEGATIVE_CONSTRAINT_GROUPS: Array<[string, string][]> = [
  [['prisma', 'Prisma'], ['drizzle-orm', 'Drizzle']],
  [['vitest', 'Vitest'], ['jest', 'Jest']],
  [['tailwindcss', 'Tailwind CSS'], ['styled-components', 'styled-components'], ['@emotion/react', 'Emotion']],
  [['express', 'Express'], ['fastify', 'Fastify'], ['@nestjs/core', 'NestJS']],
  [['react', 'React'], ['vue', 'Vue'], ['svelte', 'Svelte'], ['@angular/core', 'Angular']],
  [['next', 'Next.js'], ['nuxt', 'Nuxt']],
  [['pino', 'Pino'], ['winston', 'Winston']],
  [['zod', 'Zod'], ['joi', 'Joi'], ['yup', 'Yup']],
  [['playwright', 'Playwright'], ['cypress', 'Cypress']],
  [['@supabase/supabase-js', 'Supabase'], ['firebase', 'Firebase']],
];
