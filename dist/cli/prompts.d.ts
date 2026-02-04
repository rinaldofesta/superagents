/**
 * Interactive prompts using @clack/prompts
 */
import type { MonorepoPackage } from '../types/codebase.js';
import type { Recommendations } from '../types/config.js';
import type { GoalCategory, ProjectMode, ProjectSpec } from '../types/goal.js';
export declare function collectProjectGoal(): Promise<{
    description: string;
    category: GoalCategory;
}>;
export declare function selectModel(): Promise<'opus' | 'sonnet'>;
export declare function confirmSelections(recommendations: Recommendations): Promise<{
    agents: string[];
    skills: string[];
}>;
export declare function confirmOverwrite(dirName?: string): Promise<boolean>;
export declare function selectPackages(packages: MonorepoPackage[]): Promise<string[]>;
/**
 * Detect if this is a new project (empty/minimal) or existing codebase
 */
export declare function detectProjectMode(projectRoot?: string): Promise<ProjectMode>;
/**
 * Guided spec gathering for NEW projects
 * Asks 4 questions to understand what the user is building
 */
export declare function collectNewProjectSpec(): Promise<ProjectSpec>;
/**
 * Convert ProjectSpec to ProjectGoal for existing codebase flow compatibility
 */
export declare function specToGoal(spec: ProjectSpec): {
    description: string;
    category: GoalCategory;
};
//# sourceMappingURL=prompts.d.ts.map