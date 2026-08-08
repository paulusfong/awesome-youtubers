// parseReadme.js
// Parses README.md at build time to extract YouTuber channels

export function parseReadme(readmeContent) {
  const categories = [];

  // Split content into lines
  const lines = readmeContent.split('\n');

  // Meta sections to skip
  const skipSections = new Set([
    'Table of Contents',
    'Contents',
    'Other languages',
    'Want to add a YouTuber?',
  ]);

  // Extract categories from ## headers
  for (const line of lines) {
    // Match lines starting with "## "
    const match = line.match(/^##\s+(.+)$/);

    if (match) {
      const categoryName = match[1].trim();

      // Skip known meta sections
      if (!skipSections.has(categoryName)) {
        categories.push(categoryName);
      }
    }
  }

  return {
    channels: [],
    categories,
    allTopics: [],
  };
}

// CLI execution mode: reads README.md and writes public/channels.json
if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('fs');
  const path = await import('path');

  const readmePath = process.argv[2] || path.join(process.cwd(), 'README.md');
  const outputDir = path.join(process.cwd(), 'public');
  const outputPath = path.join(outputDir, 'channels.json');

  try {
    // Read README.md
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');

    // Parse it
    const parsedData = parseReadme(readmeContent);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write channels.json
    fs.writeFileSync(outputPath, JSON.stringify(parsedData, null, 2));
    console.log(`✓ Generated ${outputPath}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
