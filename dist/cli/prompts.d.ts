/**
 * Interactive prompts using @clack/prompts
 */
import type { GoalCategory } from '../types/goal.js';
import type { Recommendations } from '../types/config.js';
export declare function collectProjectGoal(): Promise<{
    description: string;
    category: GoalCategory;
}>;
export declare function selectModel(): Promise<'opus' | 'sonnet'>;
export declare function confirmSelections(recommendations: Recommendations): Promise<{
    agents: string[];
    skills: string[];
}>;
export declare function confirmOverwrite(): Promise<boolean>;
//# sourceMappingURL=prompts.d.ts.map