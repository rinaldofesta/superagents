/**
 * Types for published blueprints — packaged project templates for sharing
 */
import type { BlueprintPhase } from './blueprint.js';
export interface PublishedBlueprintMeta {
    format: 'superagents-blueprint';
    formatVersion: 1;
    name: string;
    author: string;
    description: string;
    version: string;
    keywords: string[];
    stack: string[];
    phases: BlueprintPhase[];
    agents: string[];
    skills: string[];
    publishedAt: string;
}
//# sourceMappingURL=published-blueprint.d.ts.map