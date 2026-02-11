/**
 * Blueprint installer — extracts and applies a published blueprint zip
 */
import type { PublishedBlueprintMeta } from '../types/published-blueprint.js';
export declare function installBlueprint(zipPath: string, projectRoot: string, options: {
    force?: boolean;
    preview?: boolean;
}): Promise<{
    meta: PublishedBlueprintMeta;
    filesWritten: number;
}>;
//# sourceMappingURL=installer.d.ts.map