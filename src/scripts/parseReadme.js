// parseReadme.js
// Parses README.md at build time to extract YouTuber channels

export function parseReadme(readmeContent) {
  const categories = [];
  const channels = [];
  const topicsSet = new Set();

  // Split content into lines
  const lines = readmeContent.split('\n');

  // Meta sections to skip
  const skipSections = new Set([
    'Table of Contents',
    'Contents',
    'Other languages',
    'Want to add a YouTuber?',
  ]);

  let currentCategory = null;
  let channelBuffer = {
    avatar: null,
    name: null,
    url: null,
    topics: [],
    playlists: [],
  };

  function flushChannel() {
    if (channelBuffer.name && channelBuffer.url && currentCategory) {
      const id = generateSlug(channelBuffer.name);
      const searchText = [
        channelBuffer.name,
        ...channelBuffer.topics,
        ...channelBuffer.playlists,
      ].join(' ');

      channels.push({
        id,
        name: channelBuffer.name,
        url: channelBuffer.url,
        avatar: channelBuffer.avatar || '',
        category: currentCategory,
        topics: channelBuffer.topics,
        playlists: channelBuffer.playlists,
        searchText,
      });

      // Add topics to global set
      channelBuffer.topics.forEach(topic => topicsSet.add(topic));

      // Reset buffer
      channelBuffer = {
        avatar: null,
        name: null,
        url: null,
        topics: [],
        playlists: [],
      };
    }
  }

  function generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Category header
    const categoryMatch = line.match(/^##\s+(.+)$/);
    if (categoryMatch) {
      flushChannel(); // Save previous channel if any
      const categoryName = categoryMatch[1].trim();
      if (!skipSections.has(categoryName)) {
        categories.push(categoryName);
        currentCategory = categoryName;
      } else {
        currentCategory = null;
      }
      continue;
    }

    // Skip if not in a valid category
    if (!currentCategory) continue;

    // Avatar line: [<img ... src="URL"/>](channel-url)
    const avatarMatch = line.match(/\[<img[^>]*src="([^"]+)"[^>]*\/>\]\(([^)]+)\)/);
    if (avatarMatch) {
      flushChannel(); // New channel starts, flush previous
      channelBuffer.avatar = avatarMatch[1];
      channelBuffer.url = avatarMatch[2];
      continue;
    }

    // Name line: [**Name**](URL)
    const nameMatch = line.match(/^\[?\*\*([^*]+)\*\*\]?\(([^)]+)\)/);
    if (nameMatch) {
      channelBuffer.name = nameMatch[1];
      channelBuffer.url = nameMatch[2]; // Update URL (should match avatar URL)
      continue;
    }

    // Topics line: Content about: topic1, topic2
    const topicsMatch = line.match(/^Content about:\s*(.+?)(?:\s*\\)?$/);
    if (topicsMatch) {
      channelBuffer.topics = topicsMatch[1]
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      continue;
    }

    // Playlists line: Featured playlists: `playlist1`, `playlist2`.
    const playlistsMatch = line.match(/^Featured playlists:\s*(.+?)(?:\s*\\)?$/);
    if (playlistsMatch) {
      channelBuffer.playlists = playlistsMatch[1]
        .split(/`,\s*`/)
        .map(p => p.replace(/`/g, '').replace(/\.$/, '').trim())
        .filter(Boolean);
      continue;
    }

    // <br /> or blank line might end channel
    if (line === '<br />' || line === '') {
      flushChannel();
    }
  }

  // Flush final channel
  flushChannel();

  return {
    channels,
    categories,
    allTopics: Array.from(topicsSet).sort(),
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
