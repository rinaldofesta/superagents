/**
 * Types for the evolve command — detect project changes and propose config updates
 */
export interface EvolveDelta {
    field: string;
    label: string;
    before: string;
    after: string;
}
export interface EvolveProposal {
    type: 'add-agent' | 'remove-agent' | 'add-skill' | 'remove-skill' | 'update-claude-md';
    name: string;
    reason: string;
}
export interface EvolveResult {
    deltas: EvolveDelta[];
    proposals: EvolveProposal[];
    snapshotPath: string;
}
//# sourceMappingURL=evolve.d.ts.map