import type { CodebaseAnalysis } from '../../src/types/codebase.js';
import type { ProjectGoal } from '../../src/types/goal.js';
import type { GeneratedOutput } from '../../src/types/generator.js';
import type { RecommendationContext } from '../../src/types/context.js';

/**
 * Factory function for creating test ProjectGoal instances.
 */
export function makeGoal(overrides: Partial<ProjectGoal> = {}): ProjectGoal {
  return {
    description: 'Build a SaaS dashboard',
    category: 'saas-dashboard',
    technicalRequirements: [],
    suggestedAgents: [],
    suggestedSkills: [],
    timestamp: new Date().toISOString(),
    confidence: 1.0,
    ...overrides,
  };
}

/**
 * Factory function for creating test CodebaseAnalysis instances.
 */
export function makeCodebase(overrides: Partial<CodebaseAnalysis> = {}): CodebaseAnalysis {
  return {
    projectRoot: '/test',
    projectType: 'node',
    language: 'typescript',
    framework: null,
    dependencies: [],
    devDependencies: [],
    fileStructure: [],
    totalFiles: 10,
    totalLines: 500,
    detectedPatterns: [],
    suggestedSkills: [],
    suggestedAgents: [],
    existingClaudeConfig: null,
    mcpServers: [],
    monorepo: null,
    sampledFiles: [],
    packageManager: 'npm',
    lintCommand: null,
    formatCommand: null,
    testCommand: null,
    devCommand: null,
    buildCommand: null,
    hasEnvFile: false,
    negativeConstraints: [],
    mcpSuggestions: [],
    ...overrides,
  };
}

/**
 * Factory function for creating test GeneratedOutput instances.
 */
export function makeGeneratedOutput(overrides: Partial<GeneratedOutput> = {}): GeneratedOutput {
  return {
    claudeMd: '# Project Name\n\nGenerated CLAUDE.md content',
    agents: [],
    skills: [],
    settings: {
      permissions: {
        allowedTools: ['Read', 'Bash'],
        blockedTools: [],
      },
      hooks: {},
    },
    slashCommands: [],
    roadmap: null,
    ...overrides,
  };
}

/**
 * Factory function for creating test RecommendationContext instances.
 */
export function makeContext(overrides: Partial<RecommendationContext> = {}): RecommendationContext {
  return {
    projectGoal: makeGoal(),
    codebaseAnalysis: makeCodebase(),
    selectedModel: 'claude-sonnet-4.5',
    availableAgents: [],
    availableSkills: [],
    ...overrides,
  };
}

/**
 * Creates a minimal package.json structure for testing.
 */
export function makePackageJson(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: 'test-project',
    version: '1.0.0',
    dependencies: {},
    devDependencies: {},
    scripts: {},
    ...overrides,
  };
}

/**
 * Creates a minimal ROADMAP.md structure for testing.
 */
export function makeRoadmap(phases: number = 3) {
  const phasesList = Array.from({ length: phases }, (_, i) => `
## Phase ${i + 1}

- [ ] Task 1
- [ ] Task 2
`).join('\n');

  return `# Project Roadmap

${phasesList}
`;
}
