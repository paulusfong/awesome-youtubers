// filter.js - Client-side filter logic with XSS protection

/**
 * Filter channels by search term, category, tags, and bookmarks
 * @param {Array} channels - Channel data
 * @param {string} searchTerm - Search query (lowercase)
 * @param {string} category - Selected category ('all' or category name)
 * @param {Array<string>} tags - Selected topic tags (AND logic)
 * @param {boolean} bookmarksOnly - Show only bookmarked channels
 * @returns {Array} Filtered channels
 */
export function filterChannels(channels, searchTerm, category, tags = [], bookmarksOnly = false) {
  let filtered = channels;

  // Filter by search term (name, topics, playlists)
  if (searchTerm) {
    filtered = filtered.filter((channel) =>
      channel.searchText.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by category
  if (category && category !== 'all') {
    filtered = filtered.filter((channel) => channel.category === category);
  }

  // Filter by tags (AND logic: channel must have ALL selected tags)
  if (tags.length > 0) {
    filtered = filtered.filter((channel) =>
      tags.every((tag) => channel.topics.includes(tag))
    );
  }

  // Filter by bookmarks
  if (bookmarksOnly) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    filtered = filtered.filter((channel) => bookmarks.includes(channel.id));
  }

  return filtered;
}

/**
 * Sort channels
 * @param {Array} channels - Channels to sort
 * @param {string} sortMode - 'az', 'za', or 'random'
 * @returns {Array} Sorted channels
 */
export function sortChannels(channels, sortMode) {
  const sorted = [...channels];

  if (sortMode === 'az') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortMode === 'za') {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortMode === 'random') {
    // Deterministic shuffle based on date seed
    const seed = new Date().toDateString();
    const seededRandom = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash) / 2147483647;
    };

    sorted.sort((a, b) => {
      const aHash = seededRandom(a.id + seed);
      const bHash = seededRandom(b.id + seed);
      return aHash - bHash;
    });
  }

  return sorted;
}

/**
 * Update URL params without page reload
 * @param {Object} params - Filter state
 */
export function updateURLParams(params) {
  const url = new URL(window.location);

  // Clear existing params
  url.searchParams.delete('search');
  url.searchParams.delete('category');
  url.searchParams.delete('tags');
  url.searchParams.delete('sort');
  url.searchParams.delete('bookmarks');

  // Set active params
  if (params.search) url.searchParams.set('search', params.search);
  if (params.category && params.category !== 'all') url.searchParams.set('category', params.category);
  if (params.tags && params.tags.length > 0) url.searchParams.set('tags', params.tags.join(','));
  if (params.sort && params.sort !== 'az') url.searchParams.set('sort', params.sort);
  if (params.bookmarksOnly) url.searchParams.set('bookmarks', 'true');

  window.history.replaceState({}, '', url);
}

/**
 * Render empty state with XSS protection
 * @param {HTMLElement} container - Container element
 * @param {string} message - Safe message text
 */
export function renderEmptyState(container, message) {
  // XSS protection: use DOM methods, never innerHTML with user content
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const emptyDiv = document.createElement('div');
  emptyDiv.className = 'empty-state';

  const messageP = document.createElement('p');
  messageP.textContent = message; // Safe: textContent escapes HTML

  emptyDiv.appendChild(messageP);
  container.appendChild(emptyDiv);
}

/**
 * Update results count display
 * @param {number} count - Number of results
 */
export function updateResultsCount(count) {
  const countSpan = document.getElementById('results-count');
  if (countSpan) {
    countSpan.textContent = count.toString(); // Safe: textContent
  }
}
