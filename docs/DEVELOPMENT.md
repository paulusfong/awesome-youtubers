# Development Guide

## Setup

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
# Install dependencies
npm ci

# Generate channels data from README
node src/scripts/parseReadme.js ../README.md

# Start dev server
npm run dev
```

## Development

### Project Structure

```
├── src/
│   ├── components/      # Astro components
│   │   ├── ChannelCard.astro
│   │   ├── FilterBar.astro
│   │   └── SearchBar.astro
│   ├── pages/           # Pages (index.astro)
│   ├── scripts/         # Build scripts & client logic
│   │   ├── parseReadme.js  # README parser
│   │   └── filter.js       # Client-side filter logic
│   └── styles/          # Global CSS
├── public/              # Static assets (channels.json)
├── tests/               # Vitest tests
└── docs/                # Documentation
```

### Scripts

```bash
# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Parse README.md
node src/scripts/parseReadme.js ../README.md
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch
```

Tests use Vitest with global `describe`, `test`, `expect`.

### Manual Testing

1. Start dev server: `npm run dev`
2. Open http://localhost:4321
3. Test features:
   - Search (debounced 300ms)
   - Category filter (single-select)
   - Topic tags (multi-select, AND logic)
   - Bookmarks (localStorage)
   - Sort (A-Z, Z-A, Random)
   - URL params (shareable links)

## Building

### Production Build

```bash
# Parse README
node src/scripts/parseReadme.js ../README.md

# Build site
npm run build

# Output: ./dist/
```

### Validation

Build validates:
- channels.json exists
- Minimum 200 channels
- No duplicate IDs
- Required fields present

## Deployment

GitHub Actions auto-deploys main branch:
- Parses README.md
- Validates channels.json
- Builds Astro site
- Deploys to GitHub Pages

See `.github/workflows/deploy.yml` for workflow details.

## Architecture

### Data Flow

1. **Build time**: `parseReadme.js` reads README.md → generates `channels.json`
2. **Server render**: `index.astro` loads channels.json → renders initial HTML
3. **Client hydration**: `filter.js` handles dynamic filtering

### Filter Logic

- **Search**: full-text over `searchText` field (name + topics + playlists)
- **Category**: single-select, "All" default
- **Tags**: multi-select, AND logic (channel must have ALL tags)
- **Bookmarks**: localStorage, sync across tabs
- **Sort**: A-Z, Z-A, deterministic random (date seed)
- **URL state**: all filters shareable via query params

### Security

- **XSS protection**: All DOM mutations use `createElement` + `textContent`
- **No innerHTML**: Empty states rendered safely
- **No user HTML**: Filter logic never renders user content as HTML

## Contributing

### Code Style

- ES6+ modules
- No TypeScript (Astro interfaces in frontmatter only)
- Modern CSS (Grid, custom properties)
- Semantic HTML

### Git Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Make changes + test
3. Commit: descriptive message
4. Push + open PR
5. GitHub Actions validates build

## Troubleshooting

### Build fails: "channels.json not found"

Run parser first:
```bash
node src/scripts/parseReadme.js ../README.md
```

### Tests fail: "describe is not defined"

Check `vitest.config.js` has `globals: true`.

### Dev server 404s

Astro config has `base: '/awesome-youtubers'`. In dev mode, site is at root `/`.

### Random sort changes every reload

Expected behavior. Random seed is date-based (same day = same order).
