// parseReadme.test.js - Parser tests
// Tests for the README.md parser

import { parseReadme } from '../src/scripts/parseReadme.js';
import { describe, test, expect } from 'vitest';

describe('parseReadme', () => {
  test('exports a function', () => {
    expect(typeof parseReadme).toBe('function');
  });

  test('accepts README content as string', () => {
    const readmeContent = '## Category\n- Channel item';
    expect(() => parseReadme(readmeContent)).not.toThrow();
  });

  test('returns object with expected structure', () => {
    const readmeContent = '## Category\n- Channel item';
    const result = parseReadme(readmeContent);

    expect(result).toHaveProperty('channels');
    expect(result).toHaveProperty('categories');
    expect(result).toHaveProperty('allTopics');

    expect(Array.isArray(result.channels)).toBe(true);
    expect(Array.isArray(result.categories)).toBe(true);
    expect(Array.isArray(result.allTopics)).toBe(true);
  });

  test('returns empty arrays initially', () => {
    const readmeContent = '## Category\n- Channel item';
    const result = parseReadme(readmeContent);

    expect(result.channels).toEqual([]);
    expect(result.categories).toEqual([]);
    expect(result.allTopics).toEqual([]);
  });
});
