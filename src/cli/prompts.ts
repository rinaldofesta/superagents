/**
 * Interactive prompts using @clack/prompts
 */

import path from 'path';

import * as p from '@clack/prompts';
import fs from 'fs-extra';
import { glob } from 'glob';
import pc from 'picocolors';

import { AGENT_EXPERTS } from './banner.js';
import { orange, bgOrange } from './colors.js';

import type { MonorepoPackage } from '../types/codebase.js';
import type { Recommendations } from '../types/config.js';
import type { GoalCategory, ProjectMode, ProjectSpec, TechStack, ProjectFocus, ProjectRequirement } from '../types/goal.js';

export async function collectProjectGoal(): Promise<{ description: string; category: GoalCategory }> {
  p.intro(bgOrange(pc.black(' SuperAgents ')));

  // Use p.group for back navigation support
  const answers = await p.group({
    description: () => p.text({
      message: 'Describe your project in one sentence',
      placeholder: 'A SaaS dashboard with real-time analytics and team collaboration',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'A brief description helps us recommend the right agents';
        }
        if (value.trim().length < 10) {
          return 'Add a bit more detail so we can tailor recommendations';
        }
        return undefined;
      }
    }),
    category: ({ results }) => {
      const suggestedCategory = categorizeGoal(results.description as string || '');

      // Build options array, filtering out duplicate
      const allOptions: Array<{ value: GoalCategory; label: string; hint: string }> = [
        { value: 'saas-dashboard', label: 'SaaS Dashboard', hint: 'Admin panels, analytics, metrics' },
        { value: 'ecommerce', label: 'E-Commerce', hint: 'Stores, carts, payments' },
        { value: 'content-platform', label: 'Content Platform', hint: 'Blogs, CMS, publishing' },
        { value: 'api-service', label: 'API Service', hint: 'REST, GraphQL, microservices' },
        { value: 'mobile-app', label: 'Mobile App', hint: 'React Native, iOS, Android' },
        { value: 'cli-tool', label: 'CLI Tool', hint: 'Terminal utilities, automation' },
        { value: 'data-pipeline', label: 'Data Pipeline', hint: 'ETL, batch processing' },
        { value: 'auth-service', label: 'Auth Service', hint: 'Login, OAuth, sessions' },
        { value: 'custom', label: 'Other', hint: 'Different project type' }
      ];

      // Add detected option at the top if it's not 'custom'
      const options = suggestedCategory !== 'custom'
        ? [
            {
              value: suggestedCategory,
              label: `${getCategoryLabel(suggestedCategory)} ${pc.dim('(detected)')}`,
              hint: 'Recommended based on your description'
            },
            ...allOptions.filter(opt => opt.value !== suggestedCategory)
          ]
        : allOptions;

      return p.select({
        message: 'What type of project is this?',
        options: options as any,
        initialValue: suggestedCategory
      });
    }
  }, {
    onCancel: () => {
      p.cancel('Operation cancelled');
      process.exit(0);
    }
  });

  return {
    description: answers.description as string,
    category: answers.category as GoalCategory
  };
}

export async function selectModel(): Promise<'opus' | 'sonnet'> {
  const result = await p.group({
    model: () => p.select<{ value: 'opus' | 'sonnet'; label: string; hint: string }[], 'opus' | 'sonnet'>({
      message: 'Choose generation quality',
      options: [
        {
          value: 'sonnet',
          label: 'Sonnet 4.5',
          hint: 'Fast, high quality (recommended)'
        },
        {
          value: 'opus',
          label: 'Opus 4.5',
          hint: 'Maximum quality, slower'
        }
      ],
      initialValue: 'sonnet'
    })
  }, {
    onCancel: () => {
      p.cancel('Operation cancelled');
      process.exit(0);
    }
  });

  return result.model;
}

export async function confirmSelections(recommendations: Recommendations): Promise<{
  agents: string[];
  skills: string[];
}> {
  // Show expert-backed agents recommendation
  const agentLines = recommendations.agents
    .slice(0, 5)
    .map(a => {
      const expert = AGENT_EXPERTS[a.name];
      const expertText = expert ? orange(` [${expert.expert}]`) : '';
      return `  ${pc.green('✓')} ${pc.bold(a.name)}${expertText}\n     ${pc.dim(a.reasons[0])}`;
    })
    .join('\n');

  p.note(
    agentLines,
    'Recommended Agents'
  );

  const agents = await p.multiselect({
    message: `Which agents should Claude use?`,
    options: recommendations.agents.map(agent => {
      const expert = AGENT_EXPERTS[agent.name];
      const expertHint = expert ? `${expert.domain} (${expert.expert})` : agent.reasons[0];
      return {
        value: agent.name,
        label: agent.name,
        hint: expertHint,
        selected: recommendations.defaultAgents.includes(agent.name)
      };
    }),
    required: true
  }) as string[];

  if (p.isCancel(agents)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  // Show skills recommendation
  p.note(
    recommendations.skills
      .slice(0, 5)
      .map(s => `  ${pc.green('✓')} ${pc.bold(s.name)} - ${pc.dim(s.reasons[0])}`)
      .join('\n'),
    'Recommended Skills'
  );

  const skills = await p.multiselect({
    message: `Which framework guides should Claude learn?`,
    options: recommendations.skills.map(skill => ({
      value: skill.name,
      label: skill.name,
      hint: skill.reasons[0],
      selected: recommendations.defaultSkills.includes(skill.name)
    })),
    required: true
  }) as string[];

  if (p.isCancel(skills)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  return { agents, skills };
}

export async function confirmOverwrite(dirName = '.claude'): Promise<boolean> {
  const shouldOverwrite = await p.confirm({
    message: `${dirName} already exists. Replace it with new config?`,
    initialValue: false
  });

  if (p.isCancel(shouldOverwrite)) {
    return false;
  }

  return shouldOverwrite as boolean;
}

export async function selectPackages(packages: MonorepoPackage[]): Promise<string[]> {
  p.note(
    `Found ${packages.length} packages:\n` +
    packages.map(p => `  ${pc.green('•')} ${p.name} (${p.relativePath})`).join('\n'),
    'Monorepo Detected'
  );

  const selected = await p.multiselect({
    message: `Which packages need Claude configuration?`,
    options: packages.map(pkg => ({
      value: pkg.relativePath,
      label: pkg.name,
      hint: pkg.relativePath,
      selected: true // Default to all selected
    })),
    required: true
  }) as string[];

  if (p.isCancel(selected)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  return selected;
}

/**
 * Detect if this is a new project (empty/minimal) or existing codebase
 */
export async function detectProjectMode(projectRoot: string = process.cwd()): Promise<ProjectMode> {
  // Check for package.json
  const hasPackageJson = await fs.pathExists(path.join(projectRoot, 'package.json'));

  // Check for src/ directory
  const hasSrcDir = await fs.pathExists(path.join(projectRoot, 'src'));

  // Count code files (excluding node_modules, .git, dist)
  let codeFileCount = 0;
  try {
    const codeFiles = await glob('**/*.{ts,tsx,js,jsx,py,go,rs,java}', {
      cwd: projectRoot,
      ignore: ['node_modules/**', '.git/**', 'dist/**', '.next/**', 'build/**'],
      nodir: true
    });
    codeFileCount = codeFiles.length;
  } catch {
    // If glob fails, assume empty
  }

  // New project criteria: no package.json OR (no src/ AND fewer than 5 code files)
  if (!hasPackageJson || (!hasSrcDir && codeFileCount < 5)) {
    return 'new';
  }

  return 'existing';
}

/**
 * Guided spec gathering for NEW projects
 * Asks 4 questions to understand what the user is building
 */
export async function collectNewProjectSpec(): Promise<ProjectSpec> {
  p.intro(bgOrange(pc.black(' SuperAgents - New Project ')));

  const answers = await p.group({
    // Step 1: Core vision
    vision: () => p.text({
      message: 'Describe what you want to build',
      placeholder: 'A task management app with team collaboration',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'A brief description helps us pick the right agents';
        }
        if (value.trim().length < 10) {
          return 'Add a bit more detail so we can tailor recommendations';
        }
        return undefined;
      }
    }),

    // Step 2: Tech stack
    stack: () => p.select<{ value: TechStack; label: string; hint: string }[], TechStack>({
      message: 'What tech stack will you use?',
      options: [
        { value: 'nextjs', label: 'Next.js', hint: 'Full-stack React with SSR' },
        { value: 'react-node', label: 'React + Node.js', hint: 'Separate frontend/backend' },
        { value: 'python-fastapi', label: 'Python + FastAPI', hint: 'Python API backend' },
        { value: 'vue-node', label: 'Vue + Node.js', hint: 'Vue frontend, Node backend' },
        { value: 'other', label: 'Other', hint: 'Different stack' }
      ],
      initialValue: 'nextjs'
    }),

    // Step 3: Focus area
    focus: () => p.select<{ value: ProjectFocus; label: string; hint: string }[], ProjectFocus>({
      message: 'Where will most of your work be?',
      options: [
        { value: 'fullstack', label: 'Full-stack', hint: 'Both frontend and backend' },
        { value: 'frontend', label: 'Frontend-heavy', hint: 'UI, interactions, components' },
        { value: 'backend', label: 'Backend-heavy', hint: 'APIs, data, business logic' },
        { value: 'api', label: 'API-only', hint: 'Pure backend service' }
      ],
      initialValue: 'fullstack'
    }),

    // Step 4: Key requirements
    requirements: () => p.multiselect<{ value: ProjectRequirement; label: string; hint: string }[], ProjectRequirement>({
      message: 'What features will you need?',
      options: [
        { value: 'auth', label: 'Authentication', hint: 'Login, OAuth, sessions' },
        { value: 'database', label: 'Database', hint: 'Data storage with ORM' },
        { value: 'api', label: 'External APIs', hint: 'Third-party integrations' },
        { value: 'payments', label: 'Payments', hint: 'Stripe, subscriptions' },
        { value: 'realtime', label: 'Real-time', hint: 'WebSockets, live updates' }
      ],
      required: false
    })
  }, {
    onCancel: () => {
      p.cancel('Operation cancelled');
      process.exit(0);
    }
  });

  return {
    vision: answers.vision as string,
    stack: answers.stack as TechStack,
    focus: answers.focus as ProjectFocus,
    requirements: (answers.requirements || []) as ProjectRequirement[]
  };
}

/**
 * Convert ProjectSpec to ProjectGoal for existing codebase flow compatibility
 */
export function specToGoal(spec: ProjectSpec): { description: string; category: GoalCategory } {
  // Map stack to a suitable category
  const categoryMap: Record<TechStack, GoalCategory> = {
    'nextjs': 'saas-dashboard',
    'react-node': 'saas-dashboard',
    'python-fastapi': 'api-service',
    'vue-node': 'saas-dashboard',
    'other': 'custom'
  };

  // Build a richer description from the spec
  const focusText = {
    frontend: 'frontend-focused',
    backend: 'backend-focused',
    fullstack: 'full-stack',
    api: 'API-first'
  }[spec.focus];

  const requirementsText = spec.requirements.length > 0
    ? ` with ${spec.requirements.join(', ')}`
    : '';

  const description = `${spec.vision} (${focusText}${requirementsText})`;

  return {
    description,
    category: categoryMap[spec.stack]
  };
}

// Helper functions

function categorizeGoal(description: string): GoalCategory {
  if (!description) {
    return 'custom';
  }
  const lower = description.toLowerCase();

  const keywords: Record<GoalCategory, string[]> = {
    'saas-dashboard': ['saas', 'dashboard', 'analytics', 'metrics', 'admin', 'panel'],
    'ecommerce': ['ecommerce', 'e-commerce', 'shop', 'store', 'marketplace', 'cart'],
    'content-platform': ['blog', 'cms', 'content', 'articles', 'posts', 'publishing'],
    'api-service': ['api', 'rest', 'graphql', 'microservice', 'backend', 'service'],
    'mobile-app': ['mobile', 'app', 'ios', 'android', 'react native', 'flutter'],
    'cli-tool': ['cli', 'command line', 'terminal', 'tool', 'utility'],
    'data-pipeline': ['pipeline', 'etl', 'data processing', 'batch', 'warehouse'],
    'auth-service': ['authentication', 'auth', 'login', 'identity', 'sso', 'oauth'],
    'custom': []
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => lower.includes(word))) {
      return category as GoalCategory;
    }
  }

  return 'custom';
}

function getCategoryLabel(category: GoalCategory): string {
  const labels: Record<GoalCategory, string> = {
    'saas-dashboard': 'SaaS Dashboard',
    'ecommerce': 'E-Commerce Platform',
    'content-platform': 'Content Platform',
    'api-service': 'API Service',
    'mobile-app': 'Mobile App',
    'cli-tool': 'CLI Tool',
    'data-pipeline': 'Data Pipeline',
    'auth-service': 'Auth Service',
    'custom': 'Custom'
  };

  return labels[category];
}
