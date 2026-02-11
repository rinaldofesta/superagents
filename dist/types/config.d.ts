/**
 * Types for configuration and library definitions
 */
import type { GoalCategory } from './goal.js';
export interface AgentDefinition {
    name: string;
    category: 'engineering' | 'quality' | 'documentation' | 'operations' | 'security' | 'optimization';
    description: string;
    recommendedFor: GoalCategory[] | ['*'];
    defaultTools: string[];
    defaultSkills: string[];
}
export interface SkillDefinition {
    category: 'framework' | 'language' | 'database' | 'orm' | 'styling' | 'auth' | 'payments' | 'testing' | 'devops' | 'other';
    description: string;
    autoDetect: {
        packageNames?: string[];
        configFiles?: string[];
        filePatterns?: string[];
        envVars?: string[];
    };
    relatedSkills: string[];
}
export interface AgentScore {
    name: string;
    score: number;
    reasons: string[];
}
export interface SkillScore {
    name: string;
    score: number;
    reasons: string[];
}
export interface Recommendations {
    agents: AgentScore[];
    skills: SkillScore[];
    defaultAgents: string[];
    defaultSkills: string[];
    agentSkillLinks: Record<string, string[]>;
}
//# sourceMappingURL=config.d.ts.map