/**
 * Unit tests for evolve display functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { displayDeltas, displayProposals } from '../../../src/evolve/display.js';

import type { EvolveDelta, EvolveProposal } from '../../../src/types/evolve.js';

// Mock dependencies
vi.mock('@clack/prompts', () => ({
  note: vi.fn(),
}));

vi.mock('picocolors', () => ({
  default: {
    green: (text: string) => `[green]${text}[/green]`,
    red: (text: string) => `[red]${text}[/red]`,
    bold: (text: string) => `[bold]${text}[/bold]`,
    dim: (text: string) => `[dim]${text}[/dim]`,
  },
}));

vi.mock('../../../src/cli/colors.js', () => ({
  orange: (text: string) => `[orange]${text}[/orange]`,
}));

describe('displayDeltas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display added items with green prefix', async () => {
    const p = await import('@clack/prompts');
    const deltas: EvolveDelta[] = [
      {
        field: 'dependencies',
        label: 'React',
        before: '(none)',
        after: 'react@18.0.0',
      },
    ];

    displayDeltas(deltas);

    expect(p.note).toHaveBeenCalledWith(
      expect.stringContaining('[green]'),
      'Changes detected'
    );
    expect(p.note).toHaveBeenCalledWith(
      expect.stringContaining('React'),
      'Changes detected'
    );
  });

  it('should display added items with "(none new)" before value', async () => {
    const p = await import('@clack/prompts');
    const deltas: EvolveDelta[] = [
      {
        field: 'framework',
        label: 'Framework',
        before: '(none new)',
        after: 'Next.js',
      },
    ];

    displayDeltas(deltas);

    expect(p.note).toHaveBeenCalledWith(
      expect.stringContaining('[green]'),
      'Changes detected'
    );
  });

  it('should display removed items with red prefix', async () => {
    const p = await import('@clack/prompts');
    const deltas: EvolveDelta[] = [
      {
        field: 'dependencies',
        label: 'jQuery',
        before: 'jquery@3.0.0',
        after: '(none)',
      },
    ];

    displayDeltas(deltas);

    expect(p.note).toHaveBeenCalledWith(
      expect.stringContaining('[red]'),
      'Changes detected'
    );
    expect(p.note).toHaveBeenCalledWith(
      expect.stringContaining('jQuery'),
      'Changes detected'
    );
  });

  it('should display modified items with orange prefix', async () => {
    const p = await import('@clack/prompts');
    const deltas: EvolveDelta[] = [
      {
        field: 'framework',
        label: 'Framework',
        before: 'Express',
        after: 'Fastify',
      },
    ];

    displayDeltas(deltas);

    expect(p.note).toHaveBeenCalledWith(
      expect.stringContaining('[orange]'),
      'Changes detected'
    );
    expect(p.note).toHaveBeenCalledWith(
      expect.stringContaining('Framework'),
      'Changes detected'
    );
  });

  it('should display multiple deltas', async () => {
    const p = await import('@clack/prompts');
    const deltas: EvolveDelta[] = [
      {
        field: 'deps',
        label: 'React',
        before: '(none)',
        after: 'react@18.0.0',
      },
      {
        field: 'deps',
        label: 'Vue',
        before: 'vue@2.0.0',
        after: '(none)',
      },
      {
        field: 'framework',
        label: 'Framework',
        before: 'Express',
        after: 'Fastify',
      },
    ];

    displayDeltas(deltas);

    expect(p.note).toHaveBeenCalledTimes(1);
    const call = (p.note as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toContain('React');
    expect(call[0]).toContain('Vue');
    expect(call[0]).toContain('Framework');
  });

  it('should handle empty deltas array', async () => {
    const p = await import('@clack/prompts');

    displayDeltas([]);

    expect(p.note).toHaveBeenCalledWith('', 'Changes detected');
  });
});

describe('displayProposals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display add-agent proposals', async () => {
    const p = await import('@clack/prompts');
    const proposals: EvolveProposal[] = [
      {
        type: 'add-agent',
        name: 'frontend-engineer',
        reason: 'React detected',
      },
    ];

    displayProposals(proposals);

    expect(p.note).toHaveBeenCalledWith(
      expect.stringContaining('add agent'),
      'Proposed changes'
    );
    expect(p.note).toHaveBeenCalledWith(
      expect.stringContaining('frontend-engineer'),
      'Proposed changes'
    );
    expect(p.note).toHaveBeenCalledWith(
      expect.stringContaining('React detected'),
      'Proposed changes'
    );
  });

  it('should display remove-skill proposals', async () => {
    const p = await import('@clack/prompts');
    const proposals: EvolveProposal[] = [
      {
        type: 'remove-skill',
        name: 'python',
        reason: 'No longer detected',
      },
    ];

    displayProposals(proposals);

    expect(p.note).toHaveBeenCalledWith(
      expect.stringContaining('remove skill'),
      'Proposed changes'
    );
  });

  it('should display update-claude-md proposals', async () => {
    const p = await import('@clack/prompts');
    const proposals: EvolveProposal[] = [
      {
        type: 'update-claude-md',
        name: 'CLAUDE.md',
        reason: 'New dependencies require updated config',
      },
    ];

    displayProposals(proposals);

    expect(p.note).toHaveBeenCalledWith(
      expect.stringContaining('update claude-md'),
      'Proposed changes'
    );
  });

  it('should display multiple proposals with numbering', async () => {
    const p = await import('@clack/prompts');
    const proposals: EvolveProposal[] = [
      {
        type: 'add-agent',
        name: 'backend-engineer',
        reason: 'Express detected',
      },
      {
        type: 'add-skill',
        name: 'nodejs',
        reason: 'Node.js project',
      },
      {
        type: 'remove-agent',
        name: 'python-developer',
        reason: 'Python removed',
      },
    ];

    displayProposals(proposals);

    expect(p.note).toHaveBeenCalledTimes(1);
    const call = (p.note as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toContain('1.');
    expect(call[0]).toContain('2.');
    expect(call[0]).toContain('3.');
  });

  it('should handle empty proposals array', async () => {
    const p = await import('@clack/prompts');

    displayProposals([]);

    expect(p.note).toHaveBeenCalledWith('', 'Proposed changes');
  });
});
