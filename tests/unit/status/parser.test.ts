/**
 * Unit tests for ROADMAP.md parser
 */

import { describe, it, expect } from 'vitest';
import { parseRoadmap } from '../../../src/status/parser.js';

describe('parseRoadmap', () => {
  it('should parse a single phase with tasks', () => {
    const content = `# My Roadmap

## Phase 1: Foundation
Get started

- [ ] Set up project
  Description here
- [ ] Add auth
  Auth description
`;

    const phases = parseRoadmap(content);

    expect(phases).toHaveLength(1);
    expect(phases[0].number).toBe(1);
    expect(phases[0].name).toBe('Foundation');
    expect(phases[0].tasks).toHaveLength(2);
    expect(phases[0].tasks[0]).toEqual({ title: 'Set up project', done: false, description: 'Description here' });
    expect(phases[0].tasks[1]).toEqual({ title: 'Add auth', done: false, description: 'Auth description' });
  });

  it('should parse multiple phases', () => {
    const content = `# Roadmap

## Phase 1: Foundation
Setup

- [ ] Task A

## Phase 2: Core
Build

- [ ] Task B
- [ ] Task C

## Phase 3: Launch
Ship

- [ ] Task D
`;

    const phases = parseRoadmap(content);

    expect(phases).toHaveLength(3);
    expect(phases[0].name).toBe('Foundation');
    expect(phases[0].tasks).toHaveLength(1);
    expect(phases[1].name).toBe('Core');
    expect(phases[1].tasks).toHaveLength(2);
    expect(phases[2].name).toBe('Launch');
    expect(phases[2].tasks).toHaveLength(1);
  });

  it('should distinguish done and not-done tasks', () => {
    const content = `## Phase 1: Work

- [x] Completed task
- [ ] Pending task
- [X] Also completed (uppercase)
`;

    const phases = parseRoadmap(content);

    expect(phases[0].tasks).toHaveLength(3);
    expect(phases[0].tasks[0]).toEqual({ title: 'Completed task', done: true });
    expect(phases[0].tasks[1]).toEqual({ title: 'Pending task', done: false });
    expect(phases[0].tasks[2]).toEqual({ title: 'Also completed (uppercase)', done: true });
  });

  it('should return empty array for content with no phases', () => {
    const content = `# Just a title

Some paragraph text.

- Regular list item
`;

    expect(parseRoadmap(content)).toEqual([]);
  });

  it('should return empty array for empty string', () => {
    expect(parseRoadmap('')).toEqual([]);
  });

  it('should ignore task lines outside of a phase', () => {
    const content = `# Roadmap

- [ ] Orphaned task

## Phase 1: Real
Description

- [ ] Real task
`;

    const phases = parseRoadmap(content);

    expect(phases).toHaveLength(1);
    expect(phases[0].tasks).toHaveLength(1);
    expect(phases[0].tasks[0].title).toBe('Real task');
  });

  it('should ignore description lines (indented text under tasks)', () => {
    const content = `## Phase 1: Setup

- [ ] Install dependencies
  Run npm install to get started
- [x] Configure TypeScript
  Set up tsconfig.json with strict mode
`;

    const phases = parseRoadmap(content);

    expect(phases[0].tasks).toHaveLength(2);
    expect(phases[0].tasks[0].title).toBe('Install dependencies');
    expect(phases[0].tasks[1].title).toBe('Configure TypeScript');
  });

  it('should handle phases with no tasks', () => {
    const content = `## Phase 1: Empty
Nothing here yet

## Phase 2: Has tasks

- [ ] One task
`;

    const phases = parseRoadmap(content);

    expect(phases).toHaveLength(2);
    expect(phases[0].tasks).toHaveLength(0);
    expect(phases[1].tasks).toHaveLength(1);
  });

  it('should parse phase numbers correctly even if non-sequential', () => {
    const content = `## Phase 3: Late start

- [ ] Task

## Phase 7: Jump ahead

- [ ] Another
`;

    const phases = parseRoadmap(content);

    expect(phases[0].number).toBe(3);
    expect(phases[1].number).toBe(7);
  });

  it('should capture task descriptions from indented lines', () => {
    const content = `## Phase 1: Setup

- [ ] Install dependencies
  Run npm install to get started
- [x] Configure TypeScript
  Set up tsconfig.json with strict mode
`;

    const phases = parseRoadmap(content);

    expect(phases[0].tasks[0].description).toBe('Run npm install to get started');
    expect(phases[0].tasks[1].description).toBe('Set up tsconfig.json with strict mode');
  });

  it('should leave description undefined when no indented line follows', () => {
    const content = `## Phase 1: Quick

- [ ] Task without description
- [ ] Another bare task
`;

    const phases = parseRoadmap(content);

    expect(phases[0].tasks[0].description).toBeUndefined();
    expect(phases[0].tasks[1].description).toBeUndefined();
  });

  it('should only capture first indented line as description', () => {
    const content = `## Phase 1: Detailed

- [ ] Multi-line task
  First description line
  Second line should be ignored
`;

    const phases = parseRoadmap(content);

    expect(phases[0].tasks[0].description).toBe('First description line');
  });
});
