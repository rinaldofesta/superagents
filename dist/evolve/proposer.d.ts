/**
 * Proposer — generates config change proposals from detected deltas
 *
 * Rules-based (no AI calls): maps dependency changes to skill/agent suggestions
 */
import type { CodebaseAnalysis } from '../types/codebase.js';
import type { EvolveDelta, EvolveProposal } from '../types/evolve.js';
export declare function proposeChanges(deltas: EvolveDelta[], _currentAnalysis: CodebaseAnalysis, existingAgents: string[], existingSkills: string[]): EvolveProposal[];
//# sourceMappingURL=proposer.d.ts.map