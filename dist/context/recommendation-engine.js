/**
 * Recommendation engine - combines goal and codebase analysis
 */
import { GOAL_PRESETS } from '../config/presets.js';
export class RecommendationEngine {
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
}
//# sourceMappingURL=recommendation-engine.js.map