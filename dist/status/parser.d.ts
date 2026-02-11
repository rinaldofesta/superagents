/**
 * ROADMAP.md parser — extracts phases and tasks from markdown
 */
export interface ParsedPhase {
    number: number;
    name: string;
    tasks: {
        title: string;
        done: boolean;
        description?: string;
    }[];
}
/**
 * Parse ROADMAP.md content into structured phases.
 *
 * Expects `## Phase N: Name` headers and `- [x]`/`- [ ]` task lines.
 */
export declare function parseRoadmap(content: string): ParsedPhase[];
//# sourceMappingURL=parser.d.ts.map