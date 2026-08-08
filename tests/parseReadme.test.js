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

  // Channel extraction tests
  describe('channel extraction', () => {
    test('extracts single channel with all fields', () => {
      const readmeContent = `## Programming in general

[<img align="left" height="94px" width="94px" alt="Channel's avatar" src="https://yt3.ggpht.com/example.jpg"/>](https://www.youtube.com/c/TheCodingTrain)

[**The Coding Train**](https://www.youtube.com/c/TheCodingTrain) \\
Content about: Algorithms, Processing \\
Featured playlists: \`The Nature of Code\`, \`Learning Processing\`.`;

      const result = parseReadme(readmeContent);

      expect(result.channels).toHaveLength(1);
      expect(result.channels[0]).toEqual({
        id: 'thecodingtrain',
        name: 'The Coding Train',
        url: 'https://www.youtube.com/c/TheCodingTrain',
        avatar: 'https://yt3.ggpht.com/example.jpg',
        category: 'Programming in general',
        topics: ['Algorithms', 'Processing'],
        playlists: ['The Nature of Code', 'Learning Processing'],
        searchText: expect.any(String),
      });
    });

    test('generates slug ID from channel name', () => {
      const readmeContent = `## Programming in general

[<img align="left" height="94px" width="94px" alt="avatar" src="https://yt3.ggpht.com/a.jpg"/>](https://www.youtube.com/c/freeCodeCamp)

[**freeCodeCamp.org**](https://www.youtube.com/c/freeCodeCamp) \\
Content about: Web Dev \\
Featured playlists: \`Python Tutorials\`.`;

      const result = parseReadme(readmeContent);

      expect(result.channels[0].id).toBe('freecodecamporg');
    });

    test('extracts multiple channels under same category', () => {
      const readmeContent = `## Programming in general

[<img align="left" height="94px" width="94px" alt="avatar" src="https://yt3.ggpht.com/a.jpg"/>](https://www.youtube.com/c/channel1)

[**Channel One**](https://www.youtube.com/c/channel1) \\
Content about: JavaScript \\
Featured playlists: \`JS Basics\`.

[<img align="left" height="94px" width="94px" alt="avatar" src="https://yt3.ggpht.com/b.jpg"/>](https://www.youtube.com/c/channel2)

[**Channel Two**](https://www.youtube.com/c/channel2) \\
Content about: Python \\
Featured playlists: \`Python 101\`.`;

      const result = parseReadme(readmeContent);

      expect(result.channels).toHaveLength(2);
      expect(result.channels[0].name).toBe('Channel One');
      expect(result.channels[1].name).toBe('Channel Two');
    });

    test('handles multiple topics separated by commas', () => {
      const readmeContent = `## Programming in general

[<img align="left" height="94px" width="94px" alt="avatar" src="https://yt3.ggpht.com/a.jpg"/>](https://www.youtube.com/c/test)

[**Test Channel**](https://www.youtube.com/c/test) \\
Content about: JavaScript, TypeScript, React.js, Node.js \\
Featured playlists: \`Tutorial Series\`.`;

      const result = parseReadme(readmeContent);

      expect(result.channels[0].topics).toEqual(['JavaScript', 'TypeScript', 'React.js', 'Node.js']);
    });

    test('handles multiple playlists in backticks separated by commas', () => {
      const readmeContent = `## Programming in general

[<img align="left" height="94px" width="94px" alt="avatar" src="https://yt3.ggpht.com/a.jpg"/>](https://www.youtube.com/c/test)

[**Test Channel**](https://www.youtube.com/c/test) \\
Content about: JavaScript \\
Featured playlists: \`Intro to JS\`, \`Advanced JS\`, \`JS Projects\`.`;

      const result = parseReadme(readmeContent);

      expect(result.channels[0].playlists).toEqual(['Intro to JS', 'Advanced JS', 'JS Projects']);
    });

    test('creates searchText from name, topics, and playlists', () => {
      const readmeContent = `## Programming in general

[<img align="left" height="94px" width="94px" alt="avatar" src="https://yt3.ggpht.com/a.jpg"/>](https://www.youtube.com/c/test)

[**Test Channel**](https://www.youtube.com/c/test) \\
Content about: JavaScript, React \\
Featured playlists: \`React Tutorial\`, \`JS Basics\`.`;

      const result = parseReadme(readmeContent);

      expect(result.channels[0].searchText).toContain('Test Channel');
      expect(result.channels[0].searchText).toContain('JavaScript');
      expect(result.channels[0].searchText).toContain('React');
      expect(result.channels[0].searchText).toContain('React Tutorial');
      expect(result.channels[0].searchText).toContain('JS Basics');
    });

    test('handles channel with <br /> at end', () => {
      const readmeContent = `## Programming in general

[<img align="left" height="94px" width="94px" alt="avatar" src="https://yt3.ggpht.com/a.jpg"/>](https://www.youtube.com/c/test)

[**Test Channel**](https://www.youtube.com/c/test) \\
Content about: Rust \\
Featured playlists: \`Intro to Rust\`. \\
<br />`;

      const result = parseReadme(readmeContent);

      expect(result.channels).toHaveLength(1);
      expect(result.channels[0].name).toBe('Test Channel');
    });
  });

  // Topic extraction tests
  describe('topic extraction', () => {
    test('extracts unique topics from all channels', () => {
      const readmeContent = `## Programming in general

[<img align="left" height="94px" width="94px" alt="avatar" src="https://yt3.ggpht.com/a.jpg"/>](https://www.youtube.com/c/channel1)

[**Channel One**](https://www.youtube.com/c/channel1) \\
Content about: JavaScript, React \\
Featured playlists: \`Tutorial\`.

[<img align="left" height="94px" width="94px" alt="avatar" src="https://yt3.ggpht.com/b.jpg"/>](https://www.youtube.com/c/channel2)

[**Channel Two**](https://www.youtube.com/c/channel2) \\
Content about: Python, JavaScript \\
Featured playlists: \`Basics\`.`;

      const result = parseReadme(readmeContent);

      expect(result.allTopics).toHaveLength(3);
      expect(result.allTopics).toContain('JavaScript');
      expect(result.allTopics).toContain('React');
      expect(result.allTopics).toContain('Python');
    });

    test('sorts topics alphabetically', () => {
      const readmeContent = `## Programming in general

[<img align="left" height="94px" width="94px" alt="avatar" src="https://yt3.ggpht.com/a.jpg"/>](https://www.youtube.com/c/test)

[**Test**](https://www.youtube.com/c/test) \\
Content about: Rust, Python, JavaScript \\
Featured playlists: \`Tutorial\`.`;

      const result = parseReadme(readmeContent);

      expect(result.allTopics).toEqual(['JavaScript', 'Python', 'Rust']);
    });
  });
});
