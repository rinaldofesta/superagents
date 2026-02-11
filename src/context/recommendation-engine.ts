/**
 * Recommendation engine - combines goal and codebase analysis
 */

import type { ProjectGoal, ProjectRequirement } from '../types/goal.js';
import type { CodebaseAnalysis } from '../types/codebase.js';
import type { Recommendations, AgentScore, SkillScore } from '../types/config.js';
import { GOAL_PRESETS } from '../config/presets.js';

const SUPPRESS_FROM_DEFAULTS = new Set([
  'debugger', 'docs-writer', 'code-reviewer', 'product-manager', 'accessibility-specialist'
]);

// Requirement to agent/skill boosting
const REQUIREMENT_AGENTS: Record<ProjectRequirement, { agents: string[]; skills: string[]; reason: string }> = {
  'auth': {
    agents: ['security-analyst', 'backend-engineer'],
    skills: ['nodejs', 'typescript'],
    reason: 'Authentication requires security focus'
  },
  'payments': {
    agents: ['security-analyst', 'backend-engineer', 'api-designer'],
    skills: ['typescript', 'nodejs'],
    reason: 'Payment processing requires security and API design'
  },
  'database': {
    agents: ['database-specialist', 'backend-engineer'],
    skills: ['prisma', 'drizzle'],
    reason: 'Data storage requires database expertise'
  },
  'realtime': {
    agents: ['backend-engineer', 'frontend-specialist'],
    skills: ['nodejs', 'react'],
    reason: 'Real-time features span frontend and backend'
  },
  'api': {
    agents: ['api-designer', 'backend-engineer', 'docs-writer'],
    skills: ['typescript', 'nodejs'],
    reason: 'API integrations require design and documentation'
  }
};

// Agents that overlap in function — if both are in defaults, keep only the higher-scored one
const AGENT_OVERLAP_GROUPS: string[][] = [
  ['docs-writer', 'copywriter'],
  ['code-reviewer', 'testing-specialist'],
  ['architect', 'tech-lead'],
];

export class RecommendationEngine {
  // Agent-to-skill auto-linking: when an agent is selected, these skills auto-attach
  static readonly AGENT_SKILL_LINKS: Record<string, string[]> = {
    'testing-specialist': ['vitest', 'playwright'],
    'frontend-specialist': ['react', 'nextjs', 'vue', 'tailwind', 'angular', 'svelte'],
    'backend-engineer': ['nodejs', 'express', 'nestjs', 'python', 'fastapi'],
    'database-specialist': ['prisma', 'drizzle', 'supabase'],
    'devops-specialist': ['docker'],
    'api-designer': ['graphql'],
    'security-analyst': ['stripe'],
    'mobile-specialist': ['react'],
    'cfo': ['financial-planning', 'fundraising'],
  };

  // Technology keywords to skill mappings
  private static readonly TECH_KEYWORDS: Record<string, { skills: string[]; agents: string[] }> = {
    // Python ecosystem
    'fastapi': { skills: ['fastapi', 'python'], agents: ['backend-engineer', 'api-designer'] },
    'django': { skills: ['python'], agents: ['backend-engineer'] },
    'flask': { skills: ['python'], agents: ['backend-engineer'] },
    'python': { skills: ['python'], agents: ['backend-engineer'] },

    // JavaScript/TypeScript ecosystem
    'react': { skills: ['react', 'typescript'], agents: ['frontend-specialist'] },
    'nextjs': { skills: ['nextjs', 'react', 'typescript'], agents: ['frontend-specialist', 'backend-engineer'] },
    'next.js': { skills: ['nextjs', 'react', 'typescript'], agents: ['frontend-specialist', 'backend-engineer'] },
    'vue': { skills: ['vue', 'typescript'], agents: ['frontend-specialist'] },
    'nuxt': { skills: ['vue', 'typescript'], agents: ['frontend-specialist'] },
    'express': { skills: ['express', 'nodejs'], agents: ['backend-engineer'] },
    'node': { skills: ['nodejs'], agents: ['backend-engineer'] },
    'nodejs': { skills: ['nodejs'], agents: ['backend-engineer'] },
    'typescript': { skills: ['typescript'], agents: [] },

    // Databases
    'postgresql': { skills: ['prisma', 'drizzle'], agents: ['database-specialist'] },
    'postgres': { skills: ['prisma', 'drizzle'], agents: ['database-specialist'] },
    'mysql': { skills: ['prisma', 'drizzle'], agents: ['database-specialist'] },
    'mongodb': { skills: [], agents: ['database-specialist'] },
    'supabase': { skills: ['supabase'], agents: ['database-specialist'] },
    'redis': { skills: [], agents: ['database-specialist'] },

    // ORMs
    'prisma': { skills: ['prisma'], agents: ['database-specialist'] },
    'drizzle': { skills: ['drizzle'], agents: ['database-specialist'] },

    // Cloud & DevOps
    'docker': { skills: ['docker'], agents: ['devops-specialist'] },
    'kubernetes': { skills: ['docker'], agents: ['devops-specialist'] },
    'aws': { skills: [], agents: ['devops-specialist'] },
    'gcp': { skills: [], agents: ['devops-specialist'] },
    'azure': { skills: [], agents: ['devops-specialist'] },

    // Testing
    'vitest': { skills: ['vitest'], agents: ['testing-specialist'] },
    'jest': { skills: [], agents: ['testing-specialist'] },
    'pytest': { skills: ['python'], agents: ['testing-specialist'] },

    // Styling
    'tailwind': { skills: ['tailwind'], agents: ['frontend-specialist'] },
    'tailwindcss': { skills: ['tailwind'], agents: ['frontend-specialist'] },

    // Additional frameworks
    'angular': { skills: ['angular', 'typescript'], agents: ['frontend-specialist'] },
    'svelte': { skills: ['svelte', 'typescript'], agents: ['frontend-specialist'] },
    'sveltekit': { skills: ['svelte', 'typescript'], agents: ['frontend-specialist'] },
    'nestjs': { skills: ['nestjs', 'typescript'], agents: ['backend-engineer'] },
    'nest': { skills: ['nestjs', 'typescript'], agents: ['backend-engineer'] },

    // Payments
    'stripe': { skills: ['stripe'], agents: ['backend-engineer', 'security-analyst'] },

    // E2E testing
    'playwright': { skills: ['playwright'], agents: ['testing-specialist'] },
    'cypress': { skills: ['playwright'], agents: ['testing-specialist'] },

    // Finance & Business
    'financial': { skills: ['financial-planning'], agents: ['cfo'] },
    'fundraising': { skills: ['fundraising', 'financial-planning'], agents: ['cfo'] },
    'investor': { skills: ['fundraising'], agents: ['cfo'] },
    'pitch deck': { skills: ['fundraising'], agents: ['cfo', 'copywriter'] },
    'revenue': { skills: ['financial-planning'], agents: ['cfo'] },
    'pricing': { skills: ['financial-planning'], agents: ['cfo'] },
    'budget': { skills: ['financial-planning'], agents: ['cfo'] },

    // API
    'graphql': { skills: ['graphql'], agents: ['api-designer'] },
    'rest': { skills: [], agents: ['api-designer'] },
    'api': { skills: [], agents: ['api-designer'] },

    // MCP
    'mcp': { skills: ['mcp'], agents: [] },
  };

  recommend(goal: ProjectGoal, codebase: CodebaseAnalysis): Recommendations {
    const agentScores = new Map<string, AgentScore>();
    const skillScores = new Map<string, SkillScore>();

    // Get preset recommendations for this goal category
    const preset = GOAL_PRESETS[goal.category];

    if (preset) {
      // Score agents from goal presets
      for (const suggestion of preset.recommendedAgents) {
        agentScores.set(suggestion.name, {
          name: suggestion.name,
          score: suggestion.priority * 10,
          reasons: [suggestion.reason]
        });
      }

      // Score skills from goal presets
      for (const suggestion of preset.recommendedSkills) {
        skillScores.set(suggestion.name, {
          name: suggestion.name,
          score: suggestion.priority * 10,
          reasons: [suggestion.reason]
        });
      }
    }

    // Parse goal description for technology keywords (HIGH PRIORITY)
    const mentionedTechs = this.extractTechnologies(goal.description);
    for (const tech of mentionedTechs) {
      const mapping = RecommendationEngine.TECH_KEYWORDS[tech];
      if (mapping) {
        // Add skills mentioned in goal (high score - user explicitly mentioned)
        for (const skillName of mapping.skills) {
          const existing = skillScores.get(skillName);
          if (existing) {
            existing.score += 50; // High boost for explicitly mentioned tech
            if (!existing.reasons.includes('Mentioned in your goal')) {
              existing.reasons.unshift('Mentioned in your goal');
            }
          } else {
            skillScores.set(skillName, {
              name: skillName,
              score: 80, // High base score for mentioned tech
              reasons: ['Mentioned in your goal']
            });
          }
        }

        // Add related agents
        for (const agentName of mapping.agents) {
          const existing = agentScores.get(agentName);
          if (existing) {
            existing.score += 30;
            if (!existing.reasons.includes('Relevant to your tech stack')) {
              existing.reasons.unshift('Relevant to your tech stack');
            }
          } else {
            agentScores.set(agentName, {
              name: agentName,
              score: 60,
              reasons: ['Relevant to your tech stack']
            });
          }
        }
      }
    }

    // Boost scores based on user-selected requirements (NEW PROJECT FLOW)
    if (goal.requirements && goal.requirements.length > 0) {
      for (const requirement of goal.requirements) {
        const mapping = REQUIREMENT_AGENTS[requirement];
        if (mapping) {
          // Boost agents for this requirement
          for (const agentName of mapping.agents) {
            const existing = agentScores.get(agentName);
            if (existing) {
              existing.score += 40; // High boost for explicitly selected requirement
              if (!existing.reasons.includes(mapping.reason)) {
                existing.reasons.unshift(mapping.reason);
              }
            } else {
              agentScores.set(agentName, {
                name: agentName,
                score: 70, // High base score for requirement-based agent
                reasons: [mapping.reason]
              });
            }
          }

          // Boost skills for this requirement
          for (const skillName of mapping.skills) {
            const existing = skillScores.get(skillName);
            if (existing) {
              existing.score += 30;
              if (!existing.reasons.includes(mapping.reason)) {
                existing.reasons.push(mapping.reason);
              }
            } else {
              skillScores.set(skillName, {
                name: skillName,
                score: 60,
                reasons: [mapping.reason]
              });
            }
          }
        }
      }
    }

    // Boost scores based on codebase analysis
    for (const agentName of codebase.suggestedAgents) {
      const existing = agentScores.get(agentName);
      if (existing) {
        existing.score += 15; // Boost if detected in codebase
        existing.reasons.push('Detected in your codebase');
      } else {
        agentScores.set(agentName, {
          name: agentName,
          score: 15,
          reasons: ['Detected in your codebase']
        });
      }
    }

    for (const skillName of codebase.suggestedSkills) {
      const existing = skillScores.get(skillName);
      if (existing) {
        existing.score += 15;
        existing.reasons.push('Already in use');
      } else {
        skillScores.set(skillName, {
          name: skillName,
          score: 15,
          reasons: ['Already in use']
        });
      }
    }

    // Sort by score
    const agents = Array.from(agentScores.values())
      .sort((a, b) => b.score - a.score);

    const skills = Array.from(skillScores.values())
      .sort((a, b) => b.score - a.score);

    // Pre-select items with score >= 80, suppress low-value agents, cap at 3
    let defaultAgents = agents
      .filter(a => a.score >= 80 && !SUPPRESS_FROM_DEFAULTS.has(a.name))
      .map(a => a.name)
      .slice(0, 3);

    // Apply overlap suppression to avoid recommending redundant agents
    defaultAgents = this.applyOverlapSuppression(agents, defaultAgents);

    const defaultSkills = skills
      .filter(s => s.score >= 70)
      .map(s => s.name)
      .slice(0, 5);

    // Replace generic reasons with project-specific ones
    for (const agent of agents) {
      const specificReason = this.buildProjectSpecificReason(agent.name, codebase, goal);
      if (specificReason) {
        agent.reasons[0] = specificReason;
      }
    }

    return {
      agents,
      skills,
      defaultAgents,
      defaultSkills,
      agentSkillLinks: RecommendationEngine.AGENT_SKILL_LINKS
    };
  }

  /**
   * Remove overlapping agents from defaults — keep the higher-scored one
   */
  private applyOverlapSuppression(agents: AgentScore[], defaults: string[]): string[] {
    const result = [...defaults];
    const scoreMap = new Map(agents.map(a => [a.name, a.score]));

    for (const group of AGENT_OVERLAP_GROUPS) {
      const inDefaults = group.filter(name => result.includes(name));
      if (inDefaults.length > 1) {
        // Keep the highest-scored, remove the rest
        inDefaults.sort((a, b) => (scoreMap.get(b) || 0) - (scoreMap.get(a) || 0));
        for (const name of inDefaults.slice(1)) {
          const idx = result.indexOf(name);
          if (idx !== -1) result.splice(idx, 1);
        }
      }
    }

    return result;
  }

  /**
   * Build a project-specific reason for an agent based on codebase analysis
   */
  private buildProjectSpecificReason(agentName: string, codebase: CodebaseAnalysis, goal: ProjectGoal): string | null {
    const { detectedPatterns, dependencies, totalFiles, testCommand } = codebase;
    const depNames = new Set(dependencies.map(d => d.name));
    const utilPattern = detectedPatterns.find(p => p.type === 'utils');
    const testPattern = detectedPatterns.find(p => p.type === 'tests');
    const apiPattern = detectedPatterns.find(p => p.type === 'api-routes');
    const componentPattern = detectedPatterns.find(p => p.type === 'components');

    switch (agentName) {
      case 'backend-engineer': {
        if (utilPattern && utilPattern.paths.length > 0) {
          return `Your project has ${utilPattern.paths.length} utility modules \u2014 clean architecture keeps this maintainable`;
        }
        if (totalFiles > 20) {
          return `${totalFiles} files detected \u2014 structured backend patterns keep complexity manageable`;
        }
        return null;
      }
      case 'testing-specialist': {
        if (testPattern) {
          return `${testPattern.paths.length} test file${testPattern.paths.length === 1 ? '' : 's'} found \u2014 helps expand coverage systematically`;
        }
        if (testCommand) {
          return `Test runner detected (${testCommand}) \u2014 helps expand coverage systematically`;
        }
        return 'No tests found yet \u2014 helps build coverage from scratch';
      }
      case 'frontend-specialist': {
        if (componentPattern && componentPattern.paths.length > 0) {
          return `${componentPattern.paths.length} component${componentPattern.paths.length === 1 ? '' : 's'} detected \u2014 maintains consistent UI patterns`;
        }
        if (depNames.has('react') || depNames.has('vue') || depNames.has('svelte')) {
          return 'Frontend framework detected \u2014 ensures component best practices';
        }
        return null;
      }
      case 'copywriter': {
        if (goal.category === 'cli-tool') {
          return 'CLI help text, error messages, and README need clear writing';
        }
        if (goal.category === 'ecommerce') {
          return 'Product descriptions, CTAs, and checkout copy drive conversions';
        }
        return null;
      }
      case 'docs-writer': {
        if (goal.category === 'api-service' || apiPattern) {
          return 'API documentation helps consumers integrate correctly';
        }
        return null;
      }
      case 'security-analyst': {
        if (depNames.has('stripe') || depNames.has('@stripe/stripe-js')) {
          return 'Payment integration detected \u2014 ensures secure transaction handling';
        }
        return null;
      }
      case 'database-specialist': {
        if (depNames.has('prisma') || depNames.has('drizzle-orm')) {
          return 'ORM detected \u2014 optimizes queries and data modeling';
        }
        return null;
      }
      case 'api-designer': {
        if (apiPattern && apiPattern.paths.length > 0) {
          return `${apiPattern.paths.length} API route${apiPattern.paths.length === 1 ? '' : 's'} found \u2014 ensures consistent API design`;
        }
        return null;
      }
      case 'devops-specialist': {
        if (depNames.has('docker') || codebase.detectedPatterns.some(p => p.description.toLowerCase().includes('docker'))) {
          return 'Container setup detected \u2014 ensures reliable deployments';
        }
        return null;
      }
      case 'code-reviewer': {
        if (totalFiles > 30) {
          return `${totalFiles} files \u2014 code review catches issues before they compound`;
        }
        return null;
      }
      default:
        return null;
    }
  }

  /**
   * Extract technology keywords from goal description
   */
  private extractTechnologies(description: string): string[] {
    const lower = description.toLowerCase();
    const found: string[] = [];

    for (const tech of Object.keys(RecommendationEngine.TECH_KEYWORDS)) {
      // Match whole word or tech followed by common delimiters
      const pattern = new RegExp(`\\b${tech.replace('.', '\\.')}\\b`, 'i');
      if (pattern.test(lower)) {
        found.push(tech);
      }
    }

    return found;
  }
}
