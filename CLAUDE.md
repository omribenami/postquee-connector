# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

PostQuee Connector is a WordPress plugin that embeds a full-featured PostQuee calendar and post scheduler directly into the WordPress admin. It provides a native React-powered UI that matches the PostQuee app aesthetic, allowing users to schedule social media posts without leaving WordPress.

**Current Version**: 2.0.0
**Requires WordPress**: 5.8+
**Requires PHP**: 7.4+
**PostQuee API**: `https://app.postquee.com/api/public/v1`

## Build & Development Commands

### Frontend Build

```bash
# Install dependencies
npm install

# Development build with watch mode (auto-rebuilds on file changes)
npm run dev

# Production build (minified, optimized)
npm run build

# Analyze bundle size
npm run analyze
```

The build outputs to `assets/dist/calendar.bundle.js` and `assets/dist/calendar.css`.

### No Backend Build Required

The PHP backend has no build step. Changes to PHP files are immediately active.

## Architecture Overview

The plugin uses a **two-tier proxy architecture**:

```
React Frontend (TypeScript)
    ↓ WordPress REST API (with nonce authentication)
WordPress Backend (PHP)
    ↓ PostQuee API (with API key authentication)
PostQuee Service
```

This keeps the PostQuee API key secure on the server while providing a rich JavaScript experience.

### Key Architectural Decisions

1. **Single Entry Point**: Despite historical dual-mode references, the plugin now uses **`postquee-bridge.php`** as the sole entry point. The `postquee-connector.php` file is disabled for backwards compatibility.

2. **React + WordPress Hybrid**: The calendar page is a React SPA that mounts into a WordPress admin page. WordPress editor integration uses vanilla JS to communicate via `sessionStorage`.

3. **State Management**:
   - **Zustand**: Global UI state (current view, selected date, modal state)
   - **SWR**: Server state with automatic caching and revalidation
   - **Context**: Calendar-specific state (posts, loading state)

4. **Drag & Drop**: Uses `react-dnd` with HTML5 backend for rescheduling posts by dragging to different time slots.

5. **Rich Text Editing**: TipTap (ProseMirror-based) editor with formatting toolbar, link support, and emoji picker.

## Directory Structure

```
/opt/PostQuee/wp-content/plugins/postquee-connector/
├── postquee-bridge.php              # Main plugin file (WordPress recognizes this)
├── postquee-connector.php           # Disabled legacy file
│
├── includes/                        # PHP backend
│   ├── class-postquee-bridge.php    # Core plugin loader
│   ├── class-postquee-admin.php     # Admin page setup & asset enqueuing
│   ├── API/
│   │   ├── class-client.php         # HTTP client for PostQuee API
│   │   └── class-endpoints.php      # API method wrappers
│   ├── Admin/
│   │   ├── class-settings.php       # Settings page (API key config)
│   │   └── class-send-metabox.php   # "Send to PostQuee" button in post editor
│   ├── Core/
│   │   └── class-mapper.php         # WordPress post → PostQuee payload mapper
│   ├── Rest/
│   │   └── class-controller.php     # WordPress REST API endpoints for React
│   └── Utils/
│       └── class-date-helper.php    # Date formatting utilities
│
├── src/                             # React/TypeScript frontend
│   ├── calendar/                    # Main calendar application
│   │   ├── index.tsx                # React app entry point
│   │   ├── CalendarApp.tsx          # Root calendar component
│   │   ├── context.tsx              # Calendar state context
│   │   ├── types.ts                 # TypeScript interfaces
│   │   ├── views/                   # Day/Week/Month view components
│   │   └── components/              # CalendarSlot, PostCard, DndProvider
│   ├── post-creator/                # Post creation modal
│   │   ├── PostCreatorModal.tsx     # Main modal component
│   │   ├── components/              # Editor, media, tags, preview, etc.
│   │   └── platform-settings/       # X, Facebook, LinkedIn, Instagram settings
│   ├── shared/
│   │   └── api/client.ts            # WordPress REST API client
│   └── styles/
│       └── globals.css              # Tailwind base + custom styles
│
├── assets/
│   ├── dist/                        # Compiled bundles (git-ignored)
│   │   ├── calendar.bundle.js       # Main React bundle (~1.4 MB)
│   │   └── calendar.css             # Compiled styles
│   ├── css/                         # Legacy/admin styles
│   └── js/
│       └── gutenberg-sidebar.js     # Gutenberg "Send to PostQuee" integration
│
├── webpack.config.js                # Webpack 5 build config
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.js               # Tailwind CSS config (PostQuee theme)
└── package.json                     # NPM dependencies
```

## API Integration Details

### PostQuee API Authentication

**Critical**: The PostQuee API uses raw API key authentication, NOT Bearer token:

```php
// includes/API/class-client.php
'Authorization' => $this->api_key,  // NO "Bearer " prefix!
```

### WordPress REST API Endpoints

All endpoints are registered under `postquee-connector/v1`:

- `GET /integrations` - Fetch connected social channels
- `GET /posts?startDate=X&endDate=Y` - Fetch posts for calendar
- `POST /posts` - Create new scheduled post
- `DELETE /posts/{id}` - Delete post
- `PUT /posts/{id}/date` - Update post date (drag & drop)
- `POST /media` - Upload media file
- `GET /tags` - Fetch available tags
- `POST /tags` - Create new tag
- `POST /ai/refine` - AI content refinement (demo logic)

See `includes/Rest/class-controller.php` for full implementation.

### React → WordPress Communication

The React app calls WordPress REST endpoints via the `wpApiFetch` wrapper:

```typescript
// src/shared/api/client.ts
export const wpApiFetch = async ({ path, method = 'GET', data }) => {
  const { restUrl, nonce } = window.postqueeWP;

  return fetch(`${restUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,  // WordPress nonce authentication
    },
    body: data ? JSON.stringify(data) : undefined,
  });
};
```

The `window.postqueeWP` object is localized from PHP via `wp_localize_script()`.

## WordPress Editor Integration

### Classic Editor

`includes/Admin/class-send-metabox.php` adds a metabox with a "Send to PostQuee" button. When clicked:

1. Extracts post title, content, and featured image URL
2. Stores data in `sessionStorage` as JSON
3. Opens PostQuee calendar page in new tab
4. Calendar reads from `sessionStorage` and pre-fills post creator modal

### Gutenberg

`assets/js/gutenberg-sidebar.js` registers a sidebar panel with the same "Send to PostQuee" button using WordPress block editor APIs.

## Key React Components

### Calendar Views

- **DayView** (`src/calendar/views/DayView.tsx`): Hourly grid for single day
- **WeekView** (`src/calendar/views/WeekView.tsx`): 7-day view with hourly rows
- **MonthView** (`src/calendar/views/MonthView.tsx`): Traditional month calendar

All views render `CalendarSlot` components that accept drops and show `PostCard` items.

### Post Creator Modal

`src/post-creator/PostCreatorModal.tsx` is a complex modal with:

- **TipTapEditor**: Rich text with bold, italic, underline, links, lists, emoji picker
- **ChannelSelector**: Multi-select checkboxes for social channels
- **MediaUpload**: Drag & drop image/video upload (Uppy.js)
- **TagsInput**: Tag creation and selection
- **DateTimePicker**: Schedule date/time selector
- **PlatformSettings**: X, Facebook, LinkedIn, Instagram-specific options
- **AIRefineModal**: Content refinement with 6 styles (demo logic)

### State Management Pattern

```typescript
// Zustand for UI state (no server interaction)
const useCalendarStore = create((set) => ({
  view: 'week',
  currentDate: dayjs(),
  setView: (view) => set({ view }),
  // ...
}));

// SWR for server state (automatic caching & revalidation)
const { data: posts, mutate } = useSWR(
  ['posts', startDate, endDate],
  () => calendarAPI.getPosts({ startDate, endDate })
);
```

## Styling & Theme

The plugin uses **Tailwind CSS** with a custom PostQuee-themed config:

- Primary color: `#FF6900` (orange)
- Dark theme: `#1a1a1a` background, `#2a2a2a` boxes
- Custom colors: `newBoxColor`, `newBoxHover`, `newTextColor`, etc.

Tailwind classes are used throughout React components. Legacy admin pages use standard CSS.

## Common Development Patterns

### Adding a New REST Endpoint

1. Register route in `includes/Rest/class-controller.php`:

```php
register_rest_route('postquee-connector/v1', '/my-endpoint', [
    'methods' => 'GET',
    'callback' => [$this, 'my_callback'],
    'permission_callback' => [$this, 'check_permission'],
]);
```

2. Add method to `CalendarAPI` in `src/shared/api/client.ts`:

```typescript
async myEndpoint() {
  return wpApiFetch({
    path: 'postquee-connector/v1/my-endpoint',
    method: 'GET',
  });
}
```

3. Use in React component with SWR:

```typescript
const { data } = useSWR('my-endpoint', () => calendarAPI.myEndpoint());
```

### Modifying Post Payload

Edit `includes/Core/class-mapper.php` to change how WordPress posts are converted to PostQuee API format:

```php
public function map(\WP_Post $post, $channel_id) {
    return [
        'content' => $this->format_content($post),
        'media' => $this->get_media_urls($post),
        'integrations' => [['id' => $channel_id]],
        'date' => $this->format_date($post),
        // Add custom fields here
    ];
}
```

### Adding a React Component

1. Create component in appropriate directory (`src/calendar/components/` or `src/post-creator/components/`)
2. Use TypeScript interfaces from `types.ts` files
3. Follow existing patterns: functional components with hooks
4. Use Tailwind classes for styling
5. Run `npm run dev` to auto-rebuild on save

## Plugin Settings

WordPress options (stored in `wp_options`):

- `postquee_api_key` - PostQuee API key (required)

Post meta keys:

- `_postquee_synced_id` - UUID of synced post (if applicable)

## Security Notes

- All REST endpoints verify WordPress nonce via `X-WP-Nonce` header
- Permission callback checks `manage_options` or `edit_posts` capability
- PostQuee API key stored as plain WordPress option (encrypted at rest by WordPress)
- Direct file access blocked via `defined('ABSPATH')` checks
- Input sanitization: `sanitize_text_field()`, `esc_url_raw()`, `esc_attr()`, `esc_html()`

## Testing the Plugin

1. Install plugin in WordPress (copy to `wp-content/plugins/` and activate)
2. Navigate to **PostQuee → Settings** and enter API key from https://app.postquee.com/settings
3. Ensure at least one social channel is connected in PostQuee
4. Navigate to **PostQuee → Calendar** to open React calendar
5. Click a future time slot to create a post
6. Test "Send to PostQuee" from any post editor

## Debugging

### Frontend Debugging

- Open browser DevTools console
- Check `window.postqueeWP` object for localized data
- React DevTools extension shows component state
- Network tab shows REST API calls
- Webpack source maps available in dev mode

### Backend Debugging

Enable WordPress debugging in `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Add logging in PHP:

```php
error_log('PostQuee: ' . print_r($data, true));
```

Logs appear in `wp-content/debug.log`.

### Common Issues

1. **Calendar not loading**: Check API key is valid, at least one channel connected
2. **"Send to PostQuee" not working**: Ensure `sessionStorage` enabled, calendar page exists
3. **Drag & drop not working**: Browser must support HTML5 drag API
4. **Build errors**: Run `npm install` again, check Node version (14+)

## Git Workflow

This repository is at: `https://github.com/omribenami/WP_PostQuee`

Current branch: `master` (also the main branch)

Standard workflow:
```bash
git add .
git commit -m "Description"
git push origin master
```

Git authentication is pre-configured.

## Related Ecosystem

- **Main PostQuee App**: `/opt/PostQuee` (Next.js application)
- **Production Deployment**: `/opt/postiz/` (Docker Compose)
- **Production URL**: `https://app.postquee.com`

This plugin is a WordPress-specific client for the PostQuee platform.
