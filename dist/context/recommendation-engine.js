/**
 * Recommendation engine - combines goal and codebase analysis
 */
import { GOAL_PRESETS } from '../config/presets.js';
// Requirement to agent/skill boosting
const REQUIREMENT_AGENTS = {
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
export class RecommendationEngine {
    // Technology keywords to skill mappings
    static TECH_KEYWORDS = {
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
    recommend(goal, codebase) {
        const agentScores = new Map();
        const skillScores = new Map();
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
                    }
                    else {
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
                    }
                    else {
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
                        }
                        else {
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
                        }
                        else {
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
            }
            else {
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
            }
            else {
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
        // Pre-select items with score >= 70
        const defaultAgents = agents
            .filter(a => a.score >= 70)
            .map(a => a.name);
        const defaultSkills = skills
            .filter(s => s.score >= 70)
            .map(s => s.name);
        return {
            agents,
            skills,
            defaultAgents,
            defaultSkills
        };
    }
    /**
     * Extract technology keywords from goal description
     */
    extractTechnologies(description) {
        const lower = description.toLowerCase();
        const found = [];
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
//# sourceMappingURL=recommendation-engine.js.map