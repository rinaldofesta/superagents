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

import type { CodebaseAnalysis, Framework, MonorepoPackage } from '../types/codebase.js';
import type { Recommendations } from '../types/config.js';
import type { GoalCategory, ProjectMode, ProjectSpec, TechStack, ProjectFocus, ProjectRequirement } from '../types/goal.js';

export async function collectProjectGoal(codebaseAnalysis?: CodebaseAnalysis): Promise<{ description: string; category: GoalCategory }> {
  p.intro(bgOrange(pc.black(' SuperAgents ')));

  // If we have codebase analysis, show what was detected and streamline the flow
  if (codebaseAnalysis && codebaseAnalysis.projectType !== 'unknown') {
    const infoLine = formatCodebaseInfo(codebaseAnalysis);
    p.note(infoLine, 'Your Project');

    const description = await p.text({
      message: 'What do you need help with?',
      placeholder: 'e.g., "Add authentication" or "Improve test coverage"',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Tell us a bit more so we can find the right specialists for you';
        }
        if (value.trim().length < 10) {
          return 'A few more details will help us match you with the best team';
        }
        return undefined;
      }
    });

    if (p.isCancel(description)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    // Combine codebase-inferred category with text-based detection
    const codebaseCategory = inferCategoryFromCodebase(codebaseAnalysis);
    const textCategory = categorizeGoal(description as string);
    // Prefer text-based if it gives a specific result, otherwise use codebase
    const category = textCategory !== 'custom' ? textCategory : codebaseCategory;

    return {
      description: description as string,
      category
    };
  }

  // Fallback: no codebase analysis or unknown project — full interactive flow
  const answers = await p.group({
    description: () => p.text({
      message: 'What do you want to create or get help with?',
      placeholder: 'e.g., "A marketing strategy for Q2" or "A React app with auth"',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Tell us a bit more so we can find the right specialists for you';
        }
        if (value.trim().length < 10) {
          return 'A few more details will help us match you with the best team';
        }
        return undefined;
      }
    }),
    category: ({ results }) => {
      const suggestedCategory = categorizeGoal(results.description as string || '');

      // Build options array with grouped categories
      const allOptions: Array<{ value: GoalCategory; label: string; hint: string }> = [
        // Development
        { value: 'saas-dashboard', label: 'Web App', hint: 'Web apps, dashboards, admin tools' },
        { value: 'api-service', label: 'Server & APIs', hint: 'Services, data, integrations' },
        { value: 'mobile-app', label: 'Mobile App', hint: 'iOS, Android, cross-platform apps' },
        { value: 'ecommerce', label: 'E-Commerce', hint: 'Stores, shopping carts, checkout flows' },
        { value: 'cli-tool', label: 'Command-Line Tool', hint: 'Command-line tools, automation scripts' },
        { value: 'data-pipeline', label: 'Data Processing', hint: 'Data workflows, analytics, automation' },
        { value: 'content-platform', label: 'Website', hint: 'Landing pages, blogs, CMS, content sites' },
        { value: 'auth-service', label: 'Authentication', hint: 'Login, user accounts, security' },
        // Business & Strategy
        { value: 'business-plan', label: 'Business Plan', hint: 'Strategy, financials, pitch decks' },
        { value: 'marketing-campaign', label: 'Marketing', hint: 'Campaigns, ads, growth strategy' },
        // Content & Research
        { value: 'content-creation', label: 'Content', hint: 'Articles, posts, copywriting' },
        { value: 'research-analysis', label: 'Research', hint: 'Analysis, reports, insights' },
        { value: 'project-docs', label: 'Documentation', hint: 'Specs, processes, guides' },
        // Other
        { value: 'custom', label: 'Something else', hint: 'Tell us what you need' }
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
        message: 'What are you working on?',
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

export async function selectModel(showPicker?: boolean): Promise<'opus' | 'sonnet'> {
  if (!showPicker) {
    return 'sonnet';
  }

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
  let agents: string[] = [];
  let skills: string[] = [];
  let confirmed = false;

  while (!confirmed) {
    if (agents.length === 0) {
      agents = await pickAgents(recommendations);
    }

    if (skills.length === 0) {
      skills = await pickSkills(recommendations);
    }

    // Review summary
    const summary =
      `  Agents: ${agents.join(', ')}\n` +
      `  Skills: ${skills.join(', ')}`;
    p.note(summary, 'Your Team');

    const action = await p.select({
      message: 'Ready to go?',
      options: [
        { value: 'confirm' as const, label: 'Looks good', hint: 'Generate configuration' },
        { value: 'agents' as const, label: 'Change agents', hint: 'Go back to agent selection' },
        { value: 'skills' as const, label: 'Change skills', hint: 'Go back to skill selection' },
      ]
    });

    if (p.isCancel(action)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    if (action === 'confirm') {
      confirmed = true;
    } else if (action === 'agents') {
      agents = [];
    } else if (action === 'skills') {
      skills = [];
    }
  }

  return { agents, skills };
}

async function pickAgents(recommendations: Recommendations): Promise<string[]> {
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

  console.log(pc.dim('\n  Agents are AI specialists trained with industry-proven methods.\n  Each one brings deep expertise in a specific area.\n'));

  const agents = await p.multiselect({
    message: `Pick your team ${pc.dim('(Space to toggle, Enter to confirm)')}`,
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

  return agents;
}

async function pickSkills(recommendations: Recommendations): Promise<string[]> {
  p.note(
    recommendations.skills
      .slice(0, 5)
      .map(s => `  ${pc.green('✓')} ${pc.bold(s.name)} - ${pc.dim(s.reasons[0])}`)
      .join('\n'),
    'Recommended Skills'
  );

  console.log(pc.dim('\n  Skills are knowledge packs — they teach your AI team about specific tools and frameworks.\n'));

  const skills = await p.multiselect({
    message: `Add skills to your team ${pc.dim('(Space to toggle, Enter to confirm)')}`,
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

  return skills;
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
    message: `Which packages need Claude configuration? ${pc.dim('(Space to select)')}`,
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
      message: 'What do you want to create?',
      placeholder: 'e.g., "A task app for my team" or "A landing page for my startup"',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Tell us what you have in mind so we can assemble the right team';
        }
        if (value.trim().length < 10) {
          return 'A few more details will help us find the best specialists';
        }
        return undefined;
      }
    }),

    // Step 2: Tech stack / tools
    stack: () => p.select<{ value: TechStack; label: string; hint: string }[], TechStack>({
      message: 'What tools or platform will you work with?',
      options: [
        { value: 'nextjs', label: 'Next.js', hint: 'Full-stack React framework' },
        { value: 'react-node', label: 'React + Node.js', hint: 'Separate frontend/backend' },
        { value: 'python-fastapi', label: 'Python + FastAPI', hint: 'Python API backend' },
        { value: 'vue-node', label: 'Vue + Node.js', hint: 'Vue frontend, Node backend' },
        { value: 'other', label: 'Other / Not sure yet', hint: 'We\'ll help you figure out the best setup' }
      ],
      initialValue: 'nextjs'
    }),

    // Step 3: Focus area
    focus: () => p.select<{ value: ProjectFocus; label: string; hint: string }[], ProjectFocus>({
      message: 'Where will most of your work happen?',
      options: [
        { value: 'fullstack', label: 'Full-stack', hint: 'Both frontend and backend' },
        { value: 'frontend', label: 'Frontend-heavy', hint: 'UI, interactions, components' },
        { value: 'backend', label: 'Backend-heavy', hint: 'APIs, data, business logic' },
        { value: 'api', label: 'API-only', hint: 'Pure backend service' }
      ],
      initialValue: 'fullstack'
    }),

    // Step 4: Key requirements
    requirements: () => {
      return p.multiselect<{ value: ProjectRequirement; label: string; hint: string }[], ProjectRequirement>({
        message: `What capabilities do you need? ${pc.dim('(Space to select)')}`,
        options: [
          { value: 'auth', label: 'User accounts', hint: 'Login, signup, social sign-in' },
          { value: 'database', label: 'Data storage', hint: 'Database with ORM' },
          { value: 'api', label: 'Integrations', hint: 'Third-party APIs and services' },
          { value: 'payments', label: 'Payments', hint: 'Stripe, subscriptions' },
          { value: 'realtime', label: 'Real-time updates', hint: 'WebSockets, live data' }
        ],
        required: false
      });
    }
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
 * Now preserves requirements for use in recommendations and templates
 */
export function specToGoal(spec: ProjectSpec): { description: string; category: GoalCategory; requirements: ProjectRequirement[] } {
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
    category: categoryMap[spec.stack],
    requirements: spec.requirements  // Preserve requirements
  };
}

// Helper functions

function categorizeGoal(description: string): GoalCategory {
  if (!description) {
    return 'custom';
  }
  const lower = description.toLowerCase();

  const keywords: Record<GoalCategory, string[]> = {
    // Development categories
    'saas-dashboard': ['saas', 'dashboard', 'analytics', 'metrics', 'admin', 'panel', 'web app'],
    'ecommerce': ['ecommerce', 'e-commerce', 'shop', 'store', 'marketplace', 'cart', 'checkout'],
    'content-platform': ['blog', 'cms', 'publishing platform', 'media site', 'landing page', 'landing', 'website', 'homepage', 'web page'],
    'api-service': ['api', 'rest', 'graphql', 'microservice', 'backend', 'service', 'integration'],
    'mobile-app': ['mobile', 'ios', 'android', 'react native', 'flutter', 'phone app'],
    'cli-tool': ['cli', 'command line', 'terminal', 'script', 'automation tool'],
    'data-pipeline': ['pipeline', 'etl', 'data processing', 'batch', 'warehouse', 'data flow'],
    'auth-service': ['authentication', 'auth system', 'login system', 'identity', 'sso', 'oauth'],
    // Business & Strategy categories
    'business-plan': ['business plan', 'pitch deck', 'investor', 'startup plan', 'financials', 'funding', 'strategy document'],
    'marketing-campaign': ['marketing', 'campaign', 'ads', 'advertising', 'growth', 'seo', 'social media', 'launch'],
    // Content & Research categories
    'content-creation': ['article', 'blog post', 'copywriting', 'content', 'writing', 'newsletter', 'copy'],
    'research-analysis': ['research', 'analysis', 'report', 'insights', 'study', 'findings', 'data analysis'],
    'project-docs': ['documentation', 'specs', 'requirements', 'process', 'guide', 'handbook', 'sop'],
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
    // Development
    'saas-dashboard': 'Web App',
    'ecommerce': 'E-Commerce',
    'content-platform': 'Website',
    'api-service': 'Server & APIs',
    'mobile-app': 'Mobile App',
    'cli-tool': 'Command-Line Tool',
    'data-pipeline': 'Data Processing',
    'auth-service': 'Authentication',
    // Business & Strategy
    'business-plan': 'Business Plan',
    'marketing-campaign': 'Marketing',
    // Content & Research
    'content-creation': 'Content',
    'research-analysis': 'Research',
    'project-docs': 'Documentation',
    'custom': 'Something else'
  };

  return labels[category];
}

const DISPLAY_NAMES: Record<string, string> = {
  'nextjs': 'Next.js', 'nuxtjs': 'Nuxt.js', 'react': 'React', 'vue': 'Vue',
  'angular': 'Angular', 'svelte': 'Svelte', 'express': 'Express', 'fastify': 'Fastify',
  'nestjs': 'NestJS', 'django': 'Django', 'fastapi': 'FastAPI', 'flask': 'Flask',
  'gin': 'Gin', 'fiber': 'Fiber', 'actix': 'Actix', 'rocket': 'Rocket',
  'spring': 'Spring', 'laravel': 'Laravel', 'rails': 'Rails',
  'typescript': 'TypeScript', 'javascript': 'JavaScript', 'python': 'Python',
  'go': 'Go', 'rust': 'Rust', 'java': 'Java', 'csharp': 'C#',
  'php': 'PHP', 'ruby': 'Ruby', 'node': 'Node.js',
};

function formatCodebaseInfo(analysis: CodebaseAnalysis): string {
  const parts: string[] = [];
  if (analysis.framework) {
    parts.push(pc.bold(DISPLAY_NAMES[analysis.framework] || analysis.framework));
  } else if (analysis.projectType !== 'unknown') {
    parts.push(pc.bold(DISPLAY_NAMES[analysis.projectType] || analysis.projectType));
  }
  if (analysis.language) {
    parts.push(DISPLAY_NAMES[analysis.language] || analysis.language);
  }
  const techLine = parts.length > 0 ? parts.join(' + ') : 'Project detected';
  const statsLine = `${analysis.totalFiles} files, ${analysis.dependencies.length} dependencies`;
  return `  ${pc.green('✓')} ${techLine}\n  ${pc.dim(statsLine)}`;
}

function inferCategoryFromCodebase(analysis: CodebaseAnalysis): GoalCategory {
  const { framework, projectType, dependencies } = analysis;
  const depNames = new Set(dependencies.map(d => d.name));

  // E-commerce indicators
  if (depNames.has('stripe') || depNames.has('@stripe/stripe-js') || depNames.has('@shopify/polaris')) {
    return 'ecommerce';
  }
  // CLI tool indicators
  if (depNames.has('commander') || depNames.has('yargs') || depNames.has('oclif')) {
    return 'cli-tool';
  }
  // Data pipeline indicators
  if (depNames.has('bull') || depNames.has('bullmq') || depNames.has('kafkajs')) {
    return 'data-pipeline';
  }

  // Framework-based detection
  const frontendFrameworks: Framework[] = ['nextjs', 'nuxtjs', 'react', 'vue', 'angular', 'svelte'];
  const backendFrameworks: Framework[] = ['express', 'fastify', 'nestjs', 'django', 'fastapi', 'flask', 'gin', 'fiber', 'actix', 'rocket', 'spring'];

  if (framework && frontendFrameworks.includes(framework)) return 'saas-dashboard';
  if (framework && backendFrameworks.includes(framework)) return 'api-service';
  if (framework === 'laravel' || framework === 'rails') return 'content-platform';

  // Project type fallback
  if (['react', 'vue', 'angular', 'svelte', 'nextjs'].includes(projectType)) return 'saas-dashboard';
  if (['node', 'python', 'go', 'java', 'csharp'].includes(projectType)) return 'api-service';
  if (['php', 'ruby'].includes(projectType)) return 'content-platform';
  if (projectType === 'rust') return 'cli-tool';

  return 'custom';
}
