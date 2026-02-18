/**
 * Unit tests for handoff renderer
 */

import { describe, it, expect } from 'vitest';
import { renderHandoff } from '../../../src/handoff/renderer.js';

import type { HandoffContext } from '../../../src/types/handoff.js';

const fullContext: HandoffContext = {
  projectName: 'My SaaS',
  description: 'A SaaS dashboard for analytics',
  techStack: 'TypeScript / next | 12 deps',
  buildStatus: 'passing',
  fileCount: 42,
  roadmapProgress: 'Phase 2: 3/5 tasks (60%)',
  agents: ['backend-engineer', 'copywriter'],
  skills: ['typescript', 'nodejs'],
  nextSteps: ['Add auth', 'Build dashboard', 'Deploy'],
  generatedAt: '2025-01-01T00:00:00.000Z',
};

describe('renderHandoff', () => {
  it('should include all required sections', () => {
    const output = renderHandoff(fullContext);

    expect(output).toContain('# Project Handoff');
    expect(output).toContain('## Overview');
    expect(output).toContain('## Tech Stack');
    expect(output).toContain('## Current State');
    expect(output).toContain('## Team Configuration');
    expect(output).toContain("## What's Next");
    expect(output).toContain('## Getting Started');
  });

  it('should render project description', () => {
    const output = renderHandoff(fullContext);
    expect(output).toContain('A SaaS dashboard for analytics');
  });

  it('should render tech stack', () => {
    const output = renderHandoff(fullContext);
    expect(output).toContain('TypeScript / next | 12 deps');
  });

  it('should render build status and file count', () => {
    const output = renderHandoff(fullContext);
    expect(output).toContain('- Build: passing');
    expect(output).toContain('- Files: 42');
  });

  it('should render roadmap progress when present', () => {
    const output = renderHandoff(fullContext);
    expect(output).toContain('- Progress: Phase 2: 3/5 tasks (60%)');
  });

  it('should omit progress line when null', () => {
    const output = renderHandoff({ ...fullContext, roadmapProgress: null });
    expect(output).not.toContain('Progress:');
  });

  it('should render agents and skills', () => {
    const output = renderHandoff(fullContext);
    expect(output).toContain('- Agents: backend-engineer, copywriter');
    expect(output).toContain('- Skills: typescript, nodejs');
  });

  it('should render "none" for empty agents/skills', () => {
    const output = renderHandoff({ ...fullContext, agents: [], skills: [] });
    expect(output).toContain('- Agents: none');
    expect(output).toContain('- Skills: none');
  });

  it('should render numbered next steps', () => {
    const output = renderHandoff(fullContext);
    expect(output).toContain('1. Add auth');
    expect(output).toContain('2. Build dashboard');
    expect(output).toContain('3. Deploy');
  });

  it('should show fallback when no next steps', () => {
    const output = renderHandoff({ ...fullContext, nextSteps: [] });
    expect(output).toContain('No ROADMAP.md found');
  });

  it('should include getting started instructions', () => {
    const output = renderHandoff(fullContext);
    expect(output).toContain('superagents status');
    expect(output).toContain('superagents evolve');
    expect(output).toContain('/status');
  });

  it('should use project name as fallback when no description', () => {
    const output = renderHandoff({ ...fullContext, description: '' });
    expect(output).toContain('My SaaS');
  });
});
