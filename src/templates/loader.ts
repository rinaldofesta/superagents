/**
 * Template loader - loads and renders local templates
 *
 * Design:
 * - Use local templates for common agents/skills to reduce API calls
 * - Template variables: {{projectName}}, {{framework}}, {{goal}}, etc.
 * - Conditional sections: {{#if category === 'cli-tool'}}...{{/if}}
 * - Truthy checks: {{#if categoryGuidance}}...{{/if}}
 * - Fallback to API generation if no template exists
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import type { GenerationContext } from '../types/generation.js';
import { CATEGORY_SECURITY, type SecurityLevel } from '../types/goal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Maximum lines per sampled file in code examples
const MAX_LINES_PER_SAMPLE = 25;

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
  // New context-aware variables
  codeExamples: string;
  requirements: string;
  securityLevel: SecurityLevel;
  categoryGuidance: string;
  patternRules: string;
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
  'performance-optimizer',
  // New expert-backed agents
  'copywriter',
  'designer',
  'architect',
  'product-manager',
  // Specialist agents
  'data-engineer',
  'mobile-specialist',
  'accessibility-specialist',
  'sre-engineer',
  'tech-lead'
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
  'mcp',
  'angular',
  'svelte',
  'nestjs',
  'stripe',
  'playwright'
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
export function buildTemplateVars(context: GenerationContext): TemplateVars {
  const category = context.goal.category;
  const patterns = context.codebase.detectedPatterns.map(p => p.type);

  return {
    projectName: context.goal.description.split(' ').slice(0, 3).join(' '),
    goal: context.goal.description,
    category: category,
    framework: context.codebase.framework || 'none',
    language: context.codebase.language || 'javascript',
    dependencies: context.codebase.dependencies.slice(0, 10).map(d => d.name).join(', '),
    patterns: context.codebase.detectedPatterns.map(p => `${p.type}: ${p.description}`).join('\n'),
    skills: context.selectedSkills.join(', '),
    agents: context.selectedAgents.join(', '),
    model: context.selectedModel,
    generatedAt: new Date(context.generatedAt).toLocaleString(),
    // New context-aware variables
    codeExamples: buildCodeExamples(context),
    requirements: (context.goal.requirements || []).join(', '),
    securityLevel: CATEGORY_SECURITY[category] || 'standard',
    categoryGuidance: buildCategoryGuidance(category),
    patternRules: buildPatternRules(patterns)
  };
}

/**
 * Build code examples from sampled files
 */
function buildCodeExamples(context: GenerationContext): string {
  if (!context.sampledFiles || context.sampledFiles.length === 0) {
    return '_No code samples available for this project._';
  }

  const examples: string[] = [];

  for (const file of context.sampledFiles.slice(0, 3)) {
    const lines = file.content.split('\n');
    const truncated = lines.slice(0, MAX_LINES_PER_SAMPLE);
    const hasMore = lines.length > MAX_LINES_PER_SAMPLE;

    // Detect language from file extension
    const ext = file.path.split('.').pop() || '';
    const langMap: Record<string, string> = {
      'ts': 'typescript', 'tsx': 'typescript',
      'js': 'javascript', 'jsx': 'javascript',
      'py': 'python', 'go': 'go', 'rs': 'rust',
      'java': 'java', 'rb': 'ruby', 'php': 'php'
    };
    const lang = langMap[ext] || ext;

    examples.push(
      `### ${file.path}\n\`\`\`${lang}\n${truncated.join('\n')}${hasMore ? '\n// ...' : ''}\n\`\`\``
    );
  }

  return examples.join('\n\n');
}

/**
 * Build category-specific guidance based on project type
 */
function buildCategoryGuidance(category: string): string {
  const guidance: Record<string, string> = {
    'cli-tool': `### CLI-Specific Guidance
- Prioritize clear help text and error messages
- Handle stdin/stdout properly for pipeable commands
- Use exit codes correctly (0 for success, non-zero for errors)
- Support --help and --version flags
- Provide progress indicators for long-running operations`,

    'api-service': `### API-Specific Guidance
- Follow REST conventions (proper HTTP methods and status codes)
- Validate all inputs at the API boundary with schemas
- Document all endpoints with OpenAPI/Swagger
- Implement proper error responses with consistent format
- Use versioning for breaking changes`,

    'auth-service': `### Security-Critical Guidance
- NEVER log passwords, tokens, or secrets
- Use constant-time comparison for sensitive values
- Implement rate limiting on auth endpoints
- Follow OWASP authentication best practices
- Store passwords with bcrypt/argon2 (never plaintext)
- Use secure session management (HttpOnly, Secure cookies)`,

    'ecommerce': `### E-Commerce Guidance
- Handle payment flows securely (never log card data)
- Implement idempotency for payment operations
- Use optimistic UI updates with proper error handling
- Track inventory with atomic operations
- Implement cart abandonment safeguards`,

    'saas-dashboard': `### SaaS Dashboard Guidance
- Implement proper multi-tenancy (data isolation)
- Use role-based access control (RBAC)
- Optimize for dashboard performance (pagination, lazy loading)
- Cache expensive aggregations
- Implement audit logging for sensitive operations`,

    'data-pipeline': `### Data Pipeline Guidance
- Design for idempotency and restartability
- Implement proper error handling and dead letter queues
- Use checkpointing for long-running processes
- Monitor pipeline health with metrics
- Handle schema evolution gracefully`,

    'mobile-app': `### Mobile App Guidance
- Optimize for offline-first patterns
- Handle network connectivity changes gracefully
- Implement proper state persistence
- Use optimistic UI updates
- Follow platform-specific design guidelines`
  };

  return guidance[category] || '';
}

/**
 * Build pattern-specific rules based on detected patterns
 */
function buildPatternRules(patterns: string[]): string {
  const rules: string[] = [];

  if (patterns.includes('api-routes')) {
    rules.push(`### API Routes Rules
- Validate all inputs at the route boundary
- Use proper HTTP methods and status codes
- Keep route handlers thin (delegate to services)
- Implement consistent error response format`);
  }

  if (patterns.includes('server-actions')) {
    rules.push(`### Server Actions Rules
- Validate inputs with Zod schemas
- Handle errors gracefully with proper error boundaries
- Keep actions focused on a single mutation
- Revalidate paths/tags after mutations`);
  }

  if (patterns.includes('components')) {
    rules.push(`### Component Pattern Rules
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use composition over prop drilling
- Co-locate component styles and tests`);
  }

  if (patterns.includes('services')) {
    rules.push(`### Service Layer Rules
- Services coordinate business operations
- Keep services stateless when possible
- Use dependency injection for service dependencies
- Services should not depend on HTTP context directly`);
  }

  if (patterns.includes('models')) {
    rules.push(`### Data Model Rules
- Keep data access logic in model/repository classes
- Don't bypass models for direct database calls
- Use model interfaces for testing
- Models should encapsulate validation logic`);
  }

  if (patterns.includes('controllers')) {
    rules.push(`### Controller Pattern Rules
- Keep controllers thin (delegate to services)
- Business logic belongs in services, not controllers
- Use consistent response format
- Handle validation at the controller boundary`);
  }

  if (patterns.includes('middleware')) {
    rules.push(`### Middleware Pattern Rules
- Keep middleware focused on a single concern
- Order middleware appropriately (auth before handlers)
- Avoid heavy computation in middleware
- Use middleware for cross-cutting concerns only`);
  }

  if (patterns.includes('hooks')) {
    rules.push(`### Custom Hooks Rules
- Name hooks with use* prefix
- Keep hooks focused on a single concern
- Extract complex state logic into dedicated hooks
- Avoid side effects in render path`);
  }

  if (patterns.includes('tests')) {
    rules.push(`### Testing Rules
- Follow Arrange-Act-Assert pattern
- Test behavior, not implementation details
- Keep tests focused and independent
- Use descriptive test names that explain the scenario`);
  }

  return rules.join('\n\n');
}

/**
 * Render template by replacing {{variable}} placeholders
 * Also handles conditional sections:
 * - {{#if securityLevel === 'high'}}...{{/if}}
 * - {{#if categoryGuidance}}...{{/if}}
 */
export function renderTemplate(template: string, vars: TemplateVars): string {
  let result = template;

  // First, handle conditional sections
  // Pattern: {{#if condition}}content{{/if}}
  const conditionalPattern = /\{\{#if\s+(.+?)\}\}([\s\S]*?)\{\{\/if\}\}/g;

  result = result.replace(conditionalPattern, (_match, condition, content) => {
    const shouldRender = evaluateCondition(condition.trim(), vars);
    return shouldRender ? content : '';
  });

  // Then, replace simple variables
  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, String(value || ''));
  }

  // Clean up empty sections (multiple blank lines)
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

/**
 * Evaluate a simple condition against template variables
 */
function evaluateCondition(condition: string, vars: TemplateVars): boolean {
  // Cast vars to a record for dynamic access
  const varsRecord = vars as unknown as Record<string, string>;

  // Handle equality: securityLevel === 'high'
  const equalityMatch = condition.match(/^(\w+)\s*===\s*['"](.+)['"]$/);
  if (equalityMatch) {
    const [, varName, value] = equalityMatch;
    return varsRecord[varName] === value;
  }

  // Handle inequality: securityLevel !== 'standard'
  const inequalityMatch = condition.match(/^(\w+)\s*!==\s*['"](.+)['"]$/);
  if (inequalityMatch) {
    const [, varName, value] = inequalityMatch;
    return varsRecord[varName] !== value;
  }

  // Handle truthy check: categoryGuidance (check if non-empty string)
  if (/^\w+$/.test(condition)) {
    const value = varsRecord[condition];
    return Boolean(value && String(value).trim());
  }

  // Default to false for unrecognized conditions
  return false;
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
