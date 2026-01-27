/**
 * Output writer - creates .claude folder structure
 */
import type { GeneratedOutputs, WriteSummary } from '../types/generation.js';
export declare class OutputWriter {
    private projectRoot;
    constructor(projectRoot: string);
    writeAll(outputs: GeneratedOutputs): Promise<WriteSummary>;
}
//# sourceMappingURL=index.d.ts.map