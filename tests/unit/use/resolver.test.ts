/**
 * Unit tests for blueprint source resolver
 */

import { describe, it, expect } from 'vitest';
import { parseSource } from '../../../src/use/resolver.js';

describe('parseSource', () => {
  it('should parse HTTPS URLs', () => {
    const result = parseSource('https://example.com/blueprint.zip');
    expect(result).toEqual({
      type: 'url',
      url: 'https://example.com/blueprint.zip',
    });
  });

  it('should parse HTTP URLs', () => {
    const result = parseSource('http://localhost:3000/blueprint.zip');
    expect(result).toEqual({
      type: 'url',
      url: 'http://localhost:3000/blueprint.zip',
    });
  });

  it('should parse absolute local paths', () => {
    const result = parseSource('/Users/test/blueprint.zip');
    expect(result).toEqual({
      type: 'local',
      path: '/Users/test/blueprint.zip',
    });
  });

  it('should parse relative local paths', () => {
    const result = parseSource('./my-blueprint.zip');
    expect(result).toEqual({
      type: 'local',
      path: './my-blueprint.zip',
    });
  });

  it('should parse bare filenames as local', () => {
    const result = parseSource('blueprint.zip');
    expect(result).toEqual({
      type: 'local',
      path: 'blueprint.zip',
    });
  });
});
