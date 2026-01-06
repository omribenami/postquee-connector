# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PostQuee Smart Bridge** is a WordPress plugin that embeds the PostQuee content scheduling platform (`app.postquee.com`) directly into the WordPress admin dashboard. The plugin uses iframe embedding with secure `postMessage` communication to enable seamless content pushing from WordPress to PostQuee.

Current Version: `1.0.3-beta.1`

## Core Architecture

### Plugin Structure

```
postquee-bridge.php              # Main plugin file (entry point)
includes/
  class-postquee-bridge.php      # Core plugin class, loads dependencies and hooks
  class-postquee-admin.php       # Admin functionality (menu, metabox, enqueuing)
assets/
  js/postquee-bridge.js          # Client-side logic (iframe communication, modal)
  css/postquee-bridge.css        # Styling for iframe wrapper and modal
```

### Communication Flow

The plugin uses a **postMessage bridge** for WordPress ↔ PostQuee communication:

1. **Main Dashboard Iframe** (`class-postquee-admin.php:32`): Embeds `https://app.postquee.com` in WordPress admin
2. **Modal Workflow** (`postquee-bridge.js:27-60`): Creates modal overlay with PostQuee iframe when "Send to PostQuee" is clicked
3. **Message Passing** (`postquee-bridge.js:81-102`): Sends post data via `postMessage` with retry mechanism (1.5s, 3s, 5s, 8s intervals) to handle async app loading/hydration

### Key Components

**PostQuee_Bridge** (`class-postquee-bridge.php`)
- Orchestrates plugin initialization
- Loads dependencies and registers admin hooks

**PostQuee_Admin** (`class-postquee-admin.php`)
- **Hardcoded App URL**: `https://app.postquee.com` (line 13) - no settings page per design
- **add_plugin_admin_menu()**: Registers top-level "PostQuee" menu item
- **add_post_row_action()**: Adds "Send to PostQuee" link to post list actions
- **add_meta_box()**: Adds sidebar button in post editor
- **Script/Style Enqueuing**: Only loads on relevant pages (`toplevel_page_postquee`, `post.php`, `post-new.php`, `edit.php`)

**JavaScript Bridge** (`assets/js/postquee-bridge.js`)
- **Iframe Resizing** (lines 8-21): Listens for `resize` messages from PostQuee app with strict origin validation
- **Modal System** (lines 26-60): Creates on-demand modal with PostQuee iframe
- **Message Retry Logic** (lines 98-102): Multiple send attempts to ensure message delivery during app hydration
- **Wildcard Origin** (line 86): Uses `'*'` for `postMessage` to handle protocol/redirect variations (intentional security tradeoff)

## Version Management

**Updating Plugin Version**: Must update in **two locations**:
1. `postquee-bridge.php` - Header comment `Version:` (line 6)
2. `postquee-bridge.php` - Constant definition `POSTQUEE_BRIDGE_VERSION` (line 16)

## WordPress Integration Points

### Hook Registration (`class-postquee-bridge.php:14-24`)
- `admin_menu` → Add PostQuee menu
- `admin_enqueue_scripts` → Load CSS/JS
- `post_row_actions` → Add "Send to PostQuee" to post list
- `add_meta_boxes` → Add editor sidebar button

### Data Passed to PostQuee
When "Send to PostQuee" is triggered, these fields are sent via `postMessage`:
- `post_title` - WordPress post title
- `post_url` - Permalink
- `featured_image` - Full-size featured image URL
- `excerpt` - Post excerpt

**Note**: Currently sends **saved** post state (PHP values), not live editor state.

## Development Guidelines

### Security Considerations
- **Origin Validation**: Main iframe resize logic validates `event.origin` against `targetOrigin` (`postquee-bridge.js:11-13`)
- **Data Sanitization**: All PHP data attributes use `esc_attr()` and `esc_url()`
- **Wildcard postMessage**: Intentionally uses `'*'` origin for send messages to handle redirects - this is a known tradeoff

### Performance Optimizations
- Scripts/styles only enqueue on relevant admin pages (not site-wide)
- Modal iframe created on-demand, not pre-loaded
- Single iframe instance reused for multiple "Send to PostQuee" actions

### CSS Architecture
- `.postquee-wrapper` - Full viewport height minus admin bar (32px desktop, 46px mobile)
- Modal overlay uses `z-index: 99999` to appear above all WordPress UI
- WordPress admin sidebar remains visible (restored in version 1.0.1)

## Testing the Plugin

Since this is a WordPress plugin without build steps:

1. **Local WordPress Setup**: Symlink or copy plugin to `wp-content/plugins/postquee-bridge/`
2. **Activate**: Via WordPress admin Plugins page
3. **Test Main Menu**: Click "PostQuee" menu item, verify iframe loads `app.postquee.com`
4. **Test Send Flow**:
   - Create/edit a post with title, excerpt, and featured image
   - Click "Send to PostQuee" from post list or editor sidebar
   - Verify modal appears and data is sent via browser DevTools console

## Known Design Decisions

- **No Settings Page**: App URL is hardcoded (removed in commit `85e55b7`)
- **Retry Mechanism**: Extended retry intervals (up to 8 seconds) added in `d501767` to handle slow app loading
- **Saved vs Live Data**: Editor button sends saved post state, not current editor state (acceptable for v1 - see `class-postquee-admin.php:103-110`)

## Debugging the Integration

**WordPress Side** (`assets/js/postquee-bridge.js`):
- Console logs show when "Send to PostQuee" is clicked
- Shows each message send attempt (1-6 attempts over 8 seconds)
- Look for: `[PostQuee Bridge] Sending message (attempt X)`

**PostQuee App Side** (`/opt/PostQuee/apps/frontend/src/components/layout/wp-listener.component.tsx`):
- Console logs show when messages are received
- Shows integration loading status
- Look for: `[PostQuee App] WordPress message detected!`

**Common Issues**:
1. **Integrations not loaded**: App buffers message until integrations load from `/integrations` API
2. **Modal doesn't open**: Check if user is logged into PostQuee app
3. **Data not populated**: Check console for parsing errors or missing fields

## Rebuilding After Code Changes

If you modify the PostQuee app code in `/opt/PostQuee/`:
```bash
cd /opt/postiz
docker compose build postiz-app
docker compose restart postiz-app
```
