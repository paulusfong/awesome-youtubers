# Awesome YouTubers Web Directory — Design Specification

**Date:** 2026-08-08  
**Status:** Approved  
**Goal:** Create a browsable, filterable web directory for the 248+ tech YouTubers in this repository

## Overview

Transform the awesome-youtubers README.md into a modern web directory that visitors can search, filter by category/topic, sort, and bookmark. Built as a static site (Astro) that parses the existing README.md, deployed to GitHub Pages, designed to be pitched to the original repo maintainer for inclusion.

## Strategy

**Pitch-first approach:** Open an issue on JoseDeFreitas/awesome-youtubers proposing the feature before building. If approved, build in fork and submit PR. If rejected, maintain independently.

**Minimal disruption:** Parse README.md as source of truth. Contributors keep existing PR workflow (edit README.md). No dual-file maintenance, no workflow changes.

## Platform & Architecture

### Stack
- **Framework:** Astro (static site generator)
- **Styling:** Vanilla CSS (modern bold aesthetic)
- **Interactivity:** Vanilla JavaScript (no framework)
- **Hosting:** GitHub Pages (free, automatic)
- **CI/CD:** GitHub Actions

### Build Pipeline
1. Parse `README.md` at build time (Node.js script)
2. Extract structured data → generate `public/channels.json`
3. Astro renders static HTML pages
4. Deploy to `gh-pages` branch via GitHub Actions

### File Structure
```
/
├── src/
│   ├── pages/
│   │   └── index.astro          # Main page
│   ├── components/
│   │   ├── SearchBar.astro      # Search input
│   │   ├── FilterBar.astro      # Category pills + topic tags
│   │   ├── ChannelCard.astro    # Individual channel card
│   │   └── BookmarkButton.astro # Bookmark toggle (client-side)
│   ├── scripts/
│   │   ├── parseReadme.js       # README → JSON parser
│   │   └── filter.js            # Client-side filter/search logic
│   └── styles/
│       └── global.css           # Modern bold theme
├── public/
│   └── channels.json            # Generated at build time
├── .github/
│   └── workflows/
│       └── deploy.yml           # CI/CD pipeline
└── README.md                    # Source of truth (unchanged)
```

## Data Model

### Parsed Structure
Extract from README.md at build time:

```json
{
  "channels": [
    {
      "id": "techsith",
      "name": "techsith",
      "url": "https://www.youtube.com/c/Techsithtube",
      "avatar": "https://yt3.ggpht.com/...",
      "category": "Programming in general",
      "topics": ["React.js", "JavaScript"],
      "playlists": [
        "react js from scratch",
        "Node.js Tutorials For Beginners"
      ]
    }
  ],
  "categories": ["Programming in general", "Web Development", ...],
  "allTopics": ["React.js", "JavaScript", "Python", ...]
}
```

### Parser Rules
- Extract category from `## Category Name` headers
- Extract avatar from `<img ... src="URL"/>`
- Extract name from `[**Name**](URL)`
- Extract topics from `Content about: TOPIC1, TOPIC2`
- Extract playlists from backtick-wrapped list
- Skip non-channel entries (TOC, headers, language links)
- Generate unique ID from channel name (slugified)
- Create searchable text field: `${name} ${topics.join(' ')} ${playlists.join(' ')}`

### Validation
- Minimum 200 channels (catches mass deletion)
- Required fields: id, name, url, category
- YouTube URL format validation
- No duplicate IDs
- Avatar URL format check (not liveness)

## Visual Design

### Aesthetic: Modern Bold
- Thick borders (3px solid #000)
- Vibrant gradients (background accents)
- Rounded corners (12px cards, 6px inputs)
- High-energy color palette
- Playful, stands out from typical GitHub Pages sites

### Color Palette
- **Primary gradient:** `linear-gradient(135deg, #fa709a 0%, #fee140 100%)`
- **Secondary gradient:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Text:** #000 (black) on white cards
- **Borders:** #000 (always black, thick)
- **Hover states:** Gradient backgrounds

### Typography
- **Headings:** Bold, sans-serif (system font stack)
- **Body:** Regular weight, 16px base
- **Cards:** 14px content, 18px channel name

## Layout

### Top Bar Filters (Sticky)
```
┌─────────────────────────────────────────────────────────┐
│ [Search box........................] [Sort ▼] [⭐ Bookmarks] │
│                                                           │
│ [All] [Programming] [Web Dev] [ML] [DevOps] ... [+Tags ▼] │
│                                                           │
│ Showing 248 channels                                      │
└─────────────────────────────────────────────────────────┘
```

- Sticky to top on scroll
- Search: full-width input, debounced 300ms
- Category pills: horizontal scroll, single-select
- Tags dropdown: multi-select with checkboxes
- Results count updates live
- Clear filters button appears when filters active

### Channel Card
```
┌─────────────────────────────────────┐
│  ╭─────╮                             │
│  │ AVA │ Channel Name           ⭐   │
│  │ TAR │                             │
│  ╰─────╯ Topics: React, JavaScript   │
│                                      │
│  Featured Playlists:                 │
│  • Playlist Name 1                   │
│  • Playlist Name 2                   │
│  • Playlist Name 3                   │
│                                      │
│  [Visit Channel →]                   │
└─────────────────────────────────────┘
```

- 3px solid black border
- 12px border-radius
- White background
- Gradient on hover (75% opacity overlay)
- Avatar: 80px circle, left-aligned
- Star icon (top-right) for bookmarking
- Playlist links open in new tab
- Main button links to YouTube channel

### Grid Layout
- **Desktop (≥1024px):** 3 columns
- **Tablet (768px-1023px):** 2 columns
- **Mobile (<768px):** 1 column
- Gap: 1.5rem
- Equal height cards via CSS Grid
- Smooth animations on filter changes

## Features

### 1. Search
- Full-text search across: channel name, topics, playlists
- Case-insensitive
- Debounced 300ms (avoid lag)
- Updates results instantly
- Empty state: "No channels match 'query'"

### 2. Category Filter
- Single-select (one category at a time)
- Click pill → filter by category
- Click again → deselect (show all)
- Active state: gradient background + bold border
- Pill list scrolls horizontally on mobile

### 3. Topic Tags
- Multi-select dropdown
- Checkboxes for each unique topic
- AND logic: channel must have ALL selected tags
- Badge on dropdown shows active tag count
- Clear tags button inside dropdown

### 4. Sort
- Options: A-Z (default), Z-A, Random
- Persists in URL params (`?sort=random`)
- Random: shuffles on page load (deterministic from seed)

### 5. Bookmarks
- Star icon on each card (client-side toggle)
- Stores channel IDs in localStorage
- "Show Bookmarks" filter button in top bar
- Badge shows bookmark count
- Works offline, no login
- Persists across sessions

### 6. URL State (Shareable Links)
- `?search=react` → pre-fills search
- `?category=web-development` → selects category
- `?tags=react,typescript` → pre-selects tags
- `?sort=random` → applies sort
- `?bookmarks=true` → shows only bookmarked channels
- All params combinable
- Back button works (history API)

## Error Handling

### Parser Failures
- Build fails if README.md parsing breaks
- CI catches errors before deploy
- Error message shows failing line/section
- Graceful degradation: skip malformed entries, log warning, continue
- Exit code 1 prevents broken deploy

### Empty States
- **No search results:** "No channels match 'query'. Try clearing filters."
- **No bookmarks:** "No bookmarks yet. Click ⭐ to save channels."
- **Broken filter combo:** Show count, suggest broadening search

### Performance
- 248 channels = ~200KB JSON (acceptable for static site)
- Client-side filtering via vanilla JS
- Debounced search (300ms)
- CSS containment on cards for smooth scroll
- Lazy load avatars (`loading="lazy"`)
- No framework = fast first load

### Browser Compatibility
- Modern browsers only (ES6+, CSS Grid)
- No IE11 support
- localStorage fallback: if blocked, bookmarks disabled (show message)

## Deployment

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js (v20)
      - Install dependencies (npm ci)
      - Run parser (node src/scripts/parseReadme.js)
      - Build Astro site (npm run build)
      - Validate channels.json exists
      - Validate minimum 200 channels
      - Deploy to gh-pages branch (if main)
```

### PR Preview
- Each PR gets preview URL
- GitHub Actions builds and deploys to temporary URL
- Contributors see changes before merge
- Catches parser breaks early

### Hosting
- GitHub Pages: `username.github.io/awesome-youtubers`
- Custom domain optional (CNAME file)
- HTTPS automatic
- Global CDN (fast worldwide)

### Build Validation
- Parser exit code 0 (success)
- `public/channels.json` exists
- Minimum 200 channels in JSON
- No duplicate channel IDs
- All channels have required fields
- YouTube URL format valid

## Testing

### Build-Time Tests
- Parser unit tests (sample README snippets)
- Integration test: parse full README.md
- Schema validation on channels.json
- Link format validation

### Manual QA Checklist
- Search works across all fields
- Category filter toggles correctly
- Multi-tag selection (AND logic)
- Sort options apply
- Bookmarks persist in localStorage
- URL params work (shareable links)
- Mobile responsive (test 3 breakpoints)
- Avatar images load (check 404s)
- External links open new tab
- Keyboard navigation works

### Accessibility
- Semantic HTML (`<nav>`, `<main>`, `<article>`)
- Alt text on avatars
- Keyboard navigation (tab through cards)
- Focus visible on interactive elements
- ARIA labels on filter controls
- Color contrast meets WCAG AA
- Screen reader friendly (test with VoiceOver/NVRF)

## Implementation Notes

### Parser Edge Cases
- Handle missing playlists (some entries have none)
- Handle short "Featured playlists" (no `<br/>` tag)
- Handle special characters in channel names
- Handle broken image URLs (skip or use fallback)
- Handle inconsistent topic formatting ("Frontend, Backend" vs "Frontend,Backend")

### Client-Side Filter Logic
```javascript
function filterChannels(channels, filters) {
  return channels.filter(channel => {
    // Search filter
    if (filters.search && !channel.searchText.includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.category && channel.category !== filters.category) {
      return false;
    }
    
    // Topic tags (AND logic)
    if (filters.tags.length > 0) {
      if (!filters.tags.every(tag => channel.topics.includes(tag))) {
        return false;
      }
    }
    
    // Bookmarks filter
    if (filters.bookmarksOnly && !isBookmarked(channel.id)) {
      return false;
    }
    
    return true;
  });
}
```

### Bookmark Storage Format
```javascript
// localStorage key: 'awesome-youtubers-bookmarks'
// value: JSON array of channel IDs
["techsith", "programmingwithmosh", "freecodecamp"]
```

## Out of Scope (Future Enhancements)

- Subscriber count / stats (requires YouTube API, adds complexity)
- User accounts / cloud sync bookmarks (backend required)
- Comments / ratings (backend required)
- "Add channel" UI (keep PR workflow)
- Admin dashboard (not needed, PRs work)
- Video thumbnails (too heavy, avatars sufficient)
- RSS feed (not requested)
- Dark mode toggle (future enhancement)

## Success Criteria

1. **Maintainer accepts:** Issue/PR approved by JoseDeFreitas
2. **Build works:** CI passes, deploys to GitHub Pages
3. **Parser robust:** Handles all 248 current channels without errors
4. **Features work:** Search, filter, sort, bookmarks all functional
5. **Mobile works:** Usable on phone (responsive design)
6. **Fast load:** First contentful paint <2s on 3G
7. **Accessible:** Keyboard navigable, screen reader friendly
8. **No workflow change:** Contributors still just edit README.md

## Next Steps

1. Open issue on original repo (pitch the idea)
2. Wait for maintainer feedback
3. If approved → proceed with implementation plan
4. If rejected → build independently in fork

---

**End of Design Specification**
