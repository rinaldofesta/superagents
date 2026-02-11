/**
 * Blueprint extractor — reads project state and builds PublishedBlueprintMeta
 */
import type { PublishedBlueprintMeta } from '../types/published-blueprint.js';
export declare function extractBlueprint(projectRoot: string, meta: {
    name: string;
    author: string;
    description: string;
    version: string;
    keywords: string[];
}): Promise<PublishedBlueprintMeta>;
//# sourceMappingURL=extractor.d.ts.map