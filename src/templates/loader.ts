/**
 * Template loader - loads and renders local templates
 *
 * Design:
 * - Use local templates for common agents/skills to reduce API calls
 * - Template variables: {{projectName}}, {{framework}}, {{goal}}, etc.
 * - Fallback to API generation if no template exists
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import type { GenerationContext } from '../types/generation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template variables that can be replaced
interface TemplateVars {
  projectName: string;
  goal: string;
  category: string;
  framework: string;
  language: string;
  dependencies: string;
  patterns: string;
  skills: string;
  agents: string;
  model: string;
  generatedAt: string;
}

/**
 * Available base templates (bundled with the package)
 */
const BUNDLED_AGENTS = [
  'backend-engineer',
  'code-reviewer',
  'debugger',
  'frontend-specialist',
  'devops-specialist',
  'security-analyst',
  'database-specialist',
  'api-designer',
  'testing-specialist',
  'docs-writer',
  'performance-optimizer'
];

const BUNDLED_SKILLS = [
  'typescript',
  'nodejs',
  'react',
  'nextjs',
  'tailwind',
  'prisma',
  'drizzle',
  'express',
  'supabase',
  'vue',
  'vitest',
  'graphql',
  'docker',
  'python',
  'fastapi',
  'mcp'
];

/**
 * Check if a local template exists for the given item
 */
export function hasTemplate(type: 'agent' | 'skill', name: string): boolean {
  const templates = type === 'agent' ? BUNDLED_AGENTS : BUNDLED_SKILLS;
  return templates.includes(name.toLowerCase());
}

/**
 * Load and render a template with context variables
 */
export async function loadTemplate(
  type: 'agent' | 'skill',
  name: string,
  context: GenerationContext
): Promise<string | null> {
  const templatePath = path.join(__dirname, type === 'agent' ? 'agents' : 'skills', `${name.toLowerCase()}.md`);

  if (!(await fs.pathExists(templatePath))) {
    return null;
  }

  const template = await fs.readFile(templatePath, 'utf-8');
  return renderTemplate(template, buildTemplateVars(context));
}

/**
 * Build template variables from generation context
 */
function buildTemplateVars(context: GenerationContext): TemplateVars {
  return {
    projectName: context.goal.description.split(' ').slice(0, 3).join(' '),
    goal: context.goal.description,
    category: context.goal.category,
    framework: context.codebase.framework || 'none',
    language: context.codebase.language || 'javascript',
    dependencies: context.codebase.dependencies.slice(0, 10).map(d => d.name).join(', '),
    patterns: context.codebase.detectedPatterns.map(p => `${p.type}: ${p.description}`).join('\n'),
    skills: context.selectedSkills.join(', '),
    agents: context.selectedAgents.join(', '),
    model: context.selectedModel,
    generatedAt: new Date(context.generatedAt).toLocaleString()
  };
}

/**
 * Render template by replacing {{variable}} placeholders
 */
function renderTemplate(template: string, vars: TemplateVars): string {
  let result = template;

  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, value || '');
  }

  return result;
}

/**
 * Get list of available templates
 */
export function getAvailableTemplates(): { agents: string[]; skills: string[] } {
  return {
    agents: BUNDLED_AGENTS,
    skills: BUNDLED_SKILLS
  };
}
