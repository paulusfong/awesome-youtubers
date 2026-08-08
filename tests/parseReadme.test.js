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

  // Category extraction tests
  describe('category extraction', () => {
    test('extracts single category from ## headers', () => {
      const readmeContent = '## Programming in general\n\nContent here';
      const result = parseReadme(readmeContent);

      expect(result.categories).toContain('Programming in general');
    });

    test('extracts multiple categories', () => {
      const readmeContent = `## Programming in general
Content here

## Web Development
More content

## Machine Learning
Even more content`;
      const result = parseReadme(readmeContent);

      expect(result.categories).toHaveLength(3);
      expect(result.categories).toContain('Programming in general');
      expect(result.categories).toContain('Web Development');
      expect(result.categories).toContain('Machine Learning');
    });

    test('skips meta sections: "Table of Contents", "Contents", "Other languages"', () => {
      const readmeContent = `## Other languages
Content

## Contents
- [Programming in general](#programming-in-general)

## Table of Contents
- More links

## Programming in general
Content here`;
      const result = parseReadme(readmeContent);

      expect(result.categories).not.toContain('Table of Contents');
      expect(result.categories).not.toContain('Contents');
      expect(result.categories).not.toContain('Other languages');
      expect(result.categories).toContain('Programming in general');
      expect(result.categories).toHaveLength(1);
    });

    test('skips "Want to add a YouTuber?" section', () => {
      const readmeContent = `## Programming in general
Content here

## Want to add a YouTuber?
Instructions for adding

## Web Development
More content`;
      const result = parseReadme(readmeContent);

      expect(result.categories).not.toContain('Want to add a YouTuber?');
      expect(result.categories).toContain('Programming in general');
      expect(result.categories).toContain('Web Development');
      expect(result.categories).toHaveLength(2);
    });

    test('handles special characters in category names', () => {
      const readmeContent = `## Internet/networking
Content here

## Audio and Video
More content`;
      const result = parseReadme(readmeContent);

      expect(result.categories).toContain('Internet/networking');
      expect(result.categories).toContain('Audio and Video');
    });

    test('preserves category order', () => {
      const readmeContent = `## Programming in general
Content

## Web Development
Content

## Machine Learning
Content`;
      const result = parseReadme(readmeContent);

      expect(result.categories[0]).toBe('Programming in general');
      expect(result.categories[1]).toBe('Web Development');
      expect(result.categories[2]).toBe('Machine Learning');
    });

    test('keeps channels and allTopics as empty arrays', () => {
      const readmeContent = `## Programming in general
Content

## Web Development
Content`;
      const result = parseReadme(readmeContent);

      expect(result.channels).toEqual([]);
      expect(result.allTopics).toEqual([]);
    });
  });
});
