# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Yuque Lite** - a minimalist personal knowledge base system built with pure vanilla JavaScript, CSS, and HTML (zero dependencies). It replicates the core functionality of Yuque (语雀) with a clean, modern UI in mint green (#10B981) theme.

**Key Stats:**
- ~500 lines of JavaScript across 7 modules
- ~940 lines of CSS across 4 modular files
- No build tools, no npm, no dependencies
- LocalStorage-based data persistence
- Single HTML entry point

## High-Level Architecture

### Data Flow
```
User Action → Main Controller (main.js) → Data API (data.js) → LocalStorage → Renderer (render.js) → UI Update
```

### Module Structure

**JavaScript Modules (loaded in order):**
1. `js/utils.js` - Utility functions: debounce(), uuid(), formatDate(), downloadFile()
2. `js/data.js` - Data layer: DataModel, DataHelper, DataAPI (CRUD operations)
3. `js/markdown.js` - Markdown renderer with regex-based parsing
4. `js/search.js` - Full-text search with inverted index
5. `js/render.js` - UI rendering for all panels (left, center, main)
6. `js/templates.js` - Document templates with variable substitution
7. `js/main.js` - Main application controller (YuqueLiteApp class)

**CSS Modules:**
1. `css/base.css` - CSS variables, resets, theme definitions (light/dark)
2. `css/layout.css` - Page layout structure (3-panel grid)
3. `css/components.css` - UI components (buttons, lists, modals, editor)
4. `css/theme.css` - Theme-specific overrides and animations

### Data Model
```javascript
{
  user: { theme: 'light', autoSave: true },
  workspaces: [
    { id, name, books: [
      { id, title, icon, coverColor, docs: [
        { id, title, content, tags, stats, status, created, updated }
      ]}
    ]}
  ],
  active: { workspaceId, bookId, docId, search }
}
```

## Key Components

### YuqueLiteApp (main.js:3-550)
The main controller that orchestrates all modules. Key methods:
- `init()` - Loads data, applies theme, binds shortcuts
- `renderAll()` / `renderMainWithCenter()` - UI rendering pipeline
- CRUD methods for workspaces, books, docs
- Search handling with debouncing
- Template system integration
- Backup/import/export functionality
- Keyboard shortcuts (Ctrl+S, Ctrl+P, Ctrl+K, Ctrl+N, Ctrl+B)

### SearchEngine (search.js:3-114)
Inverted index implementation:
- Builds index on first search (lazy loading)
- Tokenizes text using regex splitting
- Supports special `tag:` prefix for tag search
- Returns sorted results by relevance count

### MarkdownRenderer (markdown.js)
Regex-based markdown parsing (no AST):
- Headers: `# ## ###`
- Bold: `**text**`
- Code: `` `inline` `` or ``` ```code``` ```
- Lists: `* item`
- Blockquotes: `> text`
- Links: `[text](url)`
- Auto paragraph wrapping

### DataAPI (data.js:152-385)
CRUD operations with automatic LocalStorage persistence:
- `load()` / `save()` - Data persistence
- `findWorkspace()`, `findBook()`, `findDoc()` - Lookups
- `autoCreate.*()` - Creates + sets active state
- `updateDoc()` - Updates content + stats (words, time)
- `toggleDocStatus()` - Draft ↔ Published
- `delete*()` - Cascading deletions
- `addTagToDoc()` - Tag management

### Renderer (render.js:3-373)
Pure string-based template rendering:
- `renderLeftPanel()` - Workspaces list
- `renderCenterPanel()` - Books/docs or search results
- `renderMainPanel()` - Editor with split view
- `renderStats()` - Statistics modal with tag cloud
- `renderBackupManager()` - Backup UI
- `renderTemplateSelector()` / `renderTemplateForm()` - Template UI

## Common Development Tasks

### Running the Application
```bash
# No build needed - just open in browser
# Option 1: Double-click index.html
# Option 2: Local server (recommended for file API)
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Adding a New Feature
1. **Choose the right module:**
   - Data logic → `js/data.js` (add to DataAPI)
   - UI rendering → `js/render.js` (add renderer method)
   - Business logic → `js/main.js` (add to YuqueLiteApp)

2. **Follow the pattern:**
   - Update data structure in `data.js`
   - Add UI renderer in `render.js`
   - Wire up controller method in `main.js`
   - Add event handlers to HTML

3. **Test flow:**
   - `localStorage.clear()` in browser console to reset
   - Refresh page (auto-generates demo data)

### Debugging Data Issues
```javascript
// Inspect current state
JSON.parse(localStorage.getItem('yuque-lite-data-v1'))

// Reset to demo data
localStorage.removeItem('yuque-lite-data-v1'); location.reload()

// Check backups
JSON.parse(localStorage.getItem('yuque-lite-backups'))
```

### Adding New Markdown Syntax
Edit `js/markdown.js` - the `render()` method uses chained regex replacements. Add new patterns before the paragraph wrap at the end.

### Adding a Template
Edit `js/templates.js` - `Templates.defaults` array. Format:
```javascript
{
  id: 'your-id',
  name: '模板名称',
  icon: '📌',
  content: '内容支持 {{variable}} 插值'
}
```

## Important Files & Locations

### Core Logic Flow
- **Entry point**: `index.html` → `js/main.js`
- **Data layer**: `js/data.js`
- **Rendering**: `js/render.js`
- **Search**: `js/search.js`

### Styling System
- **Variables**: `css/base.css` (theme definitions)
- **Layout**: `css/layout.css` (3-panel grid)
- **Components**: `css/components.css` (UI elements)
- **Theme**: `css/theme.css` (dark mode variants)

### Utilities
- **Shortcuts**: `main.js:493-532`
- **Toast**: `render.js:230-248`
- **Modals**: Rendered via `insertAdjacentHTML`, closed via `closeModal()`
- **Debounce**: `utils.js:4-10` (used for search & editor input)

## Testing User Flows

### 1. First-Time User
1. Open `index.html`
2. Demo data auto-populates (2 books, 2 docs)
3. Toast: "语雀 Lite 已就绪"

### 2. Full Workflow
1. Create workspace → Create book → Create doc
2. Edit content (real-time preview updates)
3. Add tags via editor toolbar
4. Search (Ctrl+K) → See highlighted results
5. Save (Ctrl+S) → Toast confirmation
6. Theme toggle (Ctrl+B)
7. Backup → Export → Clear storage → Import

### 3. Edge Cases
- Empty state rendering (no workspace/book/doc)
- Search with <2 characters (clears results)
- Duplicate workspace names (allowed in merge)
- Large documents (debounced at 500ms)
- Keyboard shortcuts while editing (prevented default)

## Performance Notes

- **Debouncing**: 300ms for search, 500ms for editor input
- **Lazy indexing**: Search index built on first query
- **Batched DOM**: `innerHTML` updates per panel (single reflow)
- **LocalStorage**: JSON.parse/stringify on every change (OK for ~KB scale)

## CSS Architecture

### Color System
```css
--primary: #10B981;        /* Mint green */
--bg-main: #F8FAFC;        /* Light background */
--bg-panel: #FFFFFF;       /* White panels */
--border-light: #E2E8F0;   /* Soft borders */
```

### Dark Theme
```css
body.dark-theme {
  --bg-main: #0B1120;      /* Deep navy */
  --bg-panel: #0F172A;     /* Darker panel */
  --text-primary: #F8FAFC; /* White text */
}
```

### Component Classes
- `.list-item` - Hover effects, active states
- `.btn` - Base button style
- `.btn-primary` - Primary action (green)
- `.modal` - Overlay + centered content
- `.toast-container` - Fixed top-right notifications
- `.search-box` - Input with focus styles

## Git Strategy

The project uses manual git commits. Recommended pattern:
```bash
# View planned work
cat planning.md

# Each feature is atomic
git add js/data.js && git commit -m "feat: add workspace deletion"

# Follow commit message format
feat: new feature
fix: bug fix
style: CSS changes
docs: readme updates
```

## Security Notes

- **No external requests**: All data in localStorage
- **No image uploads**: Supports only text content
- **Single user**: No authentication/authorization
- **Local only**: Data never leaves the browser

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Data won't load | Check localStorage quota, try `localStorage.clear()` |
| Search not working | Wait for index build (first search may be slow) |
| Styles missing | Verify all 4 CSS files are loaded in order |
| Shortcuts not working | Check if focus is in input/textarea |
| Modal won't close | Click overlay or press Esc (closeModal in main.js:484-487) |

## Quick Reference

**Keyboard Shortcuts:**
- `Ctrl+S` - Save document
- `Ctrl+P` - Toggle preview mode
- `Ctrl+K` - Focus search
- `Ctrl+N` - New document
- `Ctrl+B` - Toggle theme
- `Esc` - Close modal / clear search

**Data Locations:**
- Main data: `localStorage['yuque-lite-data-v1']`
- Backups: `localStorage['yuque-lite-backups']`

**File Sizes (approx):**
- `main.js`: ~250 lines (app logic)
- `data.js`: ~200 lines (CRUD + models)
- `render.js`: ~150 lines (UI templates)
- `search.js`: ~60 lines (indexing)
- `markdown.js`: ~40 lines (parser)
- `templates.js`: ~40 lines (system)
- `utils.js`: ~50 lines (helpers)

---

**Note**: This is a complete, production-ready application. All features work out-of-the-box without any build process or setup.