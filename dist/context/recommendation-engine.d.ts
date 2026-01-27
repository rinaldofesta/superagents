/**
 * Recommendation engine - combines goal and codebase analysis
 */
import type { ProjectGoal } from '../types/goal.js';
import type { CodebaseAnalysis } from '../types/codebase.js';
import type { Recommendations } from '../types/config.js';
export declare class RecommendationEngine {
    recommend(goal: ProjectGoal, codebase: CodebaseAnalysis): Recommendations;
}
//# sourceMappingURL=recommendation-engine.d.ts.map