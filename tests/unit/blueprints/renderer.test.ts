/**
 * Unit tests for ROADMAP.md renderer
 */

import { describe, it, expect } from 'vitest';
import { renderRoadmap } from '../../../src/blueprints/renderer.js';
import { parseRoadmap } from '../../../src/status/parser.js';
import { BLUEPRINTS } from '../../../src/blueprints/definitions.js';

import type { BlueprintDefinition } from '../../../src/types/blueprint.js';
import type { GenerationContext } from '../../../src/types/generation.js';

const minimalBlueprint: BlueprintDefinition = {
  id: 'saas-dashboard',
  name: 'Test Blueprint',
  description: 'A test',
  categories: ['saas-dashboard'],
  keywords: [],
  requiredStack: [],
  phases: [
    {
      name: 'Foundation',
      description: 'Get started',
      tasks: [
        { title: 'Set up project', description: 'Initialize everything' },
        { title: 'Add auth', description: 'Authentication flow' }
      ]
    },
    {
      name: 'Features',
      description: 'Build stuff',
      tasks: [
        { title: 'Build UI', description: 'Create components' }
      ]
    }
  ]
};

// Minimal context stub — renderer only uses it for potential future use
const stubContext = {} as GenerationContext;

describe('renderRoadmap', () => {
  it('should render a title from blueprint name', () => {
    const output = renderRoadmap(minimalBlueprint, stubContext);
    expect(output).toContain('# Test Blueprint Roadmap');
  });

  it('should render phase headers with numbers', () => {
    const output = renderRoadmap(minimalBlueprint, stubContext);
    expect(output).toContain('## Phase 1: Foundation');
    expect(output).toContain('## Phase 2: Features');
  });

  it('should render phase descriptions', () => {
    const output = renderRoadmap(minimalBlueprint, stubContext);
    expect(output).toContain('Get started');
    expect(output).toContain('Build stuff');
  });

  it('should render tasks as unchecked checkboxes', () => {
    const output = renderRoadmap(minimalBlueprint, stubContext);
    expect(output).toContain('- [ ] Set up project');
    expect(output).toContain('- [ ] Add auth');
    expect(output).toContain('- [ ] Build UI');
  });

  it('should render task descriptions as indented lines', () => {
    const output = renderRoadmap(minimalBlueprint, stubContext);
    expect(output).toContain('  Initialize everything');
    expect(output).toContain('  Authentication flow');
  });

  it('should end with a newline', () => {
    const output = renderRoadmap(minimalBlueprint, stubContext);
    expect(output.endsWith('\n')).toBe(true);
  });

  it('should not contain checked checkboxes', () => {
    const output = renderRoadmap(minimalBlueprint, stubContext);
    expect(output).not.toContain('- [x]');
    expect(output).not.toContain('- [X]');
  });

  describe('roundtrip with parser', () => {
    it('should produce output that the parser can read back', () => {
      const output = renderRoadmap(minimalBlueprint, stubContext);
      const parsed = parseRoadmap(output);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].number).toBe(1);
      expect(parsed[0].name).toBe('Foundation');
      expect(parsed[0].tasks).toHaveLength(2);
      expect(parsed[0].tasks[0]).toEqual({ title: 'Set up project', done: false });
      expect(parsed[0].tasks[1]).toEqual({ title: 'Add auth', done: false });
      expect(parsed[1].number).toBe(2);
      expect(parsed[1].name).toBe('Features');
      expect(parsed[1].tasks).toHaveLength(1);
    });

    it('should roundtrip all real blueprints', () => {
      for (const blueprint of BLUEPRINTS) {
        const output = renderRoadmap(blueprint, stubContext);
        const parsed = parseRoadmap(output);

        expect(parsed.length).toBe(blueprint.phases.length);

        for (let i = 0; i < blueprint.phases.length; i++) {
          expect(parsed[i].name).toBe(blueprint.phases[i].name);
          expect(parsed[i].tasks.length).toBe(blueprint.phases[i].tasks.length);
          expect(parsed[i].tasks.every(t => t.done === false)).toBe(true);
        }
      }
    });
  });
});
