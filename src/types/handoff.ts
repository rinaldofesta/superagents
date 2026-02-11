/**
 * Types for the handoff command — generate HANDOFF.md for developer hand-off
 */

export interface HandoffContext {
  projectName: string;
  description: string;
  techStack: string;
  buildStatus: 'passing' | 'failing' | 'unknown';
  fileCount: number;
  roadmapProgress: string | null;
  agents: string[];
  skills: string[];
  nextSteps: string[];
  generatedAt: string;
}
