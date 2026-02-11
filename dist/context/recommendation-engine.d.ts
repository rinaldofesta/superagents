/**
 * Recommendation engine - combines goal and codebase analysis
 */
import type { ProjectGoal } from '../types/goal.js';
import type { CodebaseAnalysis } from '../types/codebase.js';
import type { Recommendations } from '../types/config.js';
export declare class RecommendationEngine {
    static readonly AGENT_SKILL_LINKS: Record<string, string[]>;
    private static readonly TECH_KEYWORDS;
    recommend(goal: ProjectGoal, codebase: CodebaseAnalysis): Recommendations;
    /**
     * Remove overlapping agents from defaults — keep the higher-scored one
     */
    private applyOverlapSuppression;
    /**
     * Build a project-specific reason for an agent based on codebase analysis
     */
    private buildProjectSpecificReason;
    /**
     * Extract technology keywords from goal description
     */
    private extractTechnologies;
}
//# sourceMappingURL=recommendation-engine.d.ts.map