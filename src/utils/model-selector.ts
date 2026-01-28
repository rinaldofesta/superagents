/**
 * Tiered model selection for cost optimization
 *
 * Uses cheaper/faster models for simpler tasks:
 * - Haiku: Simple skills, hooks
 * - Sonnet: Agents, complex skills
 * - Opus: CLAUDE.md (only if user selected Opus)
 */

export type ModelTier = 'haiku' | 'sonnet' | 'opus';
export type GenerationType = 'agent' | 'skill' | 'hook' | 'claude-md';

export const MODEL_IDS = {
  haiku: 'claude-3-5-haiku-20241022',
  sonnet: 'claude-sonnet-4-5-20250929',
  opus: 'claude-opus-4-5-20251101'
} as const;

// Cost per 1M tokens (approximate USD)
export const MODEL_COSTS = {
  haiku: { input: 0.25, output: 1.25 },
  sonnet: { input: 3, output: 15 },
  opus: { input: 15, output: 75 }
} as const;

interface ModelSelectionOptions {
  userSelectedModel: 'sonnet' | 'opus';
  generationType: GenerationType;
  complexity?: 'simple' | 'medium' | 'complex';
}

/**
 * Select the appropriate model based on task type and complexity
 *
 * Tiering strategy:
 * - Haiku: Simple tasks (hooks, basic skills) - 80% cost reduction vs Sonnet
 * - Sonnet: Complex tasks (agents, advanced skills) - baseline
 * - Opus: Only when user explicitly selects it for CLAUDE.md
 * Never exceed user's selected tier to respect budget constraints.
 */
export function selectModel(options: ModelSelectionOptions): string {
  const { userSelectedModel, generationType, complexity = 'medium' } = options;

  // Mapping based on generation type
  const tierMap: Record<GenerationType, ModelTier> = {
    'hook': 'haiku',              // Hooks are simple bash scripts
    'skill': complexity === 'simple' ? 'haiku' : 'sonnet',
    'agent': 'sonnet',            // Agents need good reasoning
    'claude-md': userSelectedModel // Respect user's choice for main doc
  };

  const tier = tierMap[generationType];

  // Never use a model more expensive than user selected
  if (tier === 'opus' && userSelectedModel === 'sonnet') {
    return MODEL_IDS.sonnet;
  }

  return MODEL_IDS[tier];
}

/**
 * Get the tier name from a model ID
 */
export function getModelTier(modelId: string): ModelTier {
  if (modelId.includes('haiku')) return 'haiku';
  if (modelId.includes('opus')) return 'opus';
  return 'sonnet';
}

/**
 * Determine skill complexity based on name
 */
export function getSkillComplexity(skillName: string): 'simple' | 'medium' | 'complex' {
  const simpleSkills = [
    'markdown', 'git', 'npm', 'eslint', 'prettier',
    'yaml', 'json', 'dotenv', 'editorconfig'
  ];

  const complexSkills = [
    'nextjs', 'react', 'typescript', 'graphql', 'kubernetes',
    'docker', 'aws', 'terraform', 'prisma', 'drizzle',
    'trpc', 'nestjs', 'fastify', 'express'
  ];

  const lowerName = skillName.toLowerCase();

  if (simpleSkills.some(s => lowerName.includes(s))) return 'simple';
  if (complexSkills.some(s => lowerName.includes(s))) return 'complex';
  return 'medium';
}

/**
 * Get a human-readable model name
 */
export function getModelDisplayName(modelId: string): string {
  if (modelId.includes('haiku')) return 'Haiku 3.5';
  if (modelId.includes('opus')) return 'Opus 4.5';
  if (modelId.includes('sonnet')) return 'Sonnet 4.5';
  return modelId;
}
