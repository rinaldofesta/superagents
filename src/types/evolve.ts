/**
 * Types for the evolve command — detect project changes and propose config updates
 */

export interface EvolveDelta {
  field: string;           // e.g. 'dependencies', 'detectedPatterns', 'framework'
  label: string;           // Human-readable label for display
  before: string;          // Stringified old value
  after: string;           // Stringified new value
}

export interface EvolveProposal {
  type: 'add-agent' | 'remove-agent' | 'add-skill' | 'remove-skill' | 'update-claude-md';
  name: string;            // Agent/skill name or 'CLAUDE.md'
  reason: string;          // Why this change is proposed
}

export interface EvolveResult {
  deltas: EvolveDelta[];
  proposals: EvolveProposal[];
  snapshotPath: string;    // Where snapshot was saved
}
