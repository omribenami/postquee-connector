# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

PostQuee Connector is a WordPress plugin that integrates the PostQuee social media scheduling platform with WordPress. The plugin provides two main integration approaches:

1. **Bridge Mode** (`postquee-bridge.php`): iframe-based embedding with admin dashboard
2. **Connector Mode** (`postquee-connector.php`): Direct API integration with automatic/manual syncing

**Current Version**: 1.0.7 (bridge), 1.0.0 (connector)
**Target WordPress**: 5.8+
**Target PHP**: 7.4+
**PostQuee API Base**: `https://app.postquee.com/api/public/v1`

## Important: Dual Architecture

This plugin currently has **two entry points** reflecting different design approaches:

- **`postquee-bridge.php`**: Legacy bridge mode with custom UI and iframe integration
- **`postquee-connector.php`**: Modern API-first connector with namespaced architecture

When modifying code, verify which architecture is currently active by checking which main file WordPress loads. The connector mode uses PSR-4 autoloading with the `PostQuee\Connector` namespace.

## Directory Structure

```
/root/WP_PostQuee/
├── postquee-bridge.php          # Main plugin file (bridge mode)
├── postquee-connector.php       # Main plugin file (connector mode)
├── includes/
│   ├── class-postquee-bridge.php    # Bridge core loader
│   ├── class-postquee-admin.php     # Bridge admin functionality
│   ├── API/
│   │   ├── class-client.php         # HTTP client for PostQuee API
│   │   └── class-endpoints.php      # API endpoint wrappers
│   ├── Admin/
│   │   ├── class-dashboard.php      # Admin dashboard UI
│   │   ├── class-settings.php       # Settings page
│   │   └── class-metabox.php        # Post editor metabox
│   ├── Core/
│   │   ├── class-hooks.php          # Auto-sync and manual triggers
│   │   └── class-mapper.php         # Post data mapping
│   ├── Rest/
│   │   └── class-controller.php     # WordPress REST API endpoints
│   └── Utils/
│       └── class-date-helper.php    # Date utilities
├── assets/
│   ├── css/
│   │   ├── postquee-bridge.css      # Main styles
│   │   └── postquee-admin.css       # Admin-specific styles
│   └── js/
│       ├── postquee-bridge.js       # Calendar UI and AJAX handlers
│       ├── postquee-admin.js        # Admin UI handlers
│       └── gutenberg-sidebar.js     # Block editor integration
└── README.md
```

## Key Architecture Patterns

### 1. PostQuee API Integration

**Authentication**: Raw API key in `Authorization` header (no "Bearer" prefix)

```php
// API Client (includes/API/class-client.php)
'Authorization' => $this->api_key,  // NOT 'Bearer ' . $this->api_key
```

**Base URL**: `https://app.postquee.com/api/public/v1` (filterable via `postquee_api_base`)

**Key Endpoints**:
- `GET /integrations` - Fetch connected channels
- `POST /posts` - Create new scheduled post
- `DELETE /posts/{id}` - Remove post

### 2. Auto-Sync Flow (Connector Mode)

Located in `includes/Core/class-hooks.php`:

1. Hook: `transition_post_status` fires when post status changes
2. Guard clauses check:
   - New status is 'publish'
   - Old status was NOT 'publish' (prevents re-sync on edits)
   - Post meta `_postquee_enabled` is true
   - Post meta `_postquee_synced_id` is empty (idempotency)
3. `sync_post()` maps content via `Core\Mapper` and calls API
4. On success: stores returned UUID in `_postquee_synced_id` meta

### 3. Manual Sync Triggers

**Row Actions**: "Send to PostQuee" links in post list
- Handler: `admin_post_postquee_trigger_sync` action
- Nonce: `postquee_sync_link`
- Redirects back with query param for admin notice

**AJAX Push**: "Push Now" button in metabox
- Action: `wp_ajax_postquee_push_now`
- Returns JSON success/error

**Gutenberg Sidebar**: Button in block editor panel
- Script: `assets/js/gutenberg-sidebar.js`
- Calls same AJAX handler as metabox

### 4. Caching Strategy

Channels are cached via WordPress transients:
- Transient key: `postquee_channels`
- TTL: 1 hour (`HOUR_IN_SECONDS`)
- Invalidate manually via `delete_transient('postquee_channels')`

### 5. Calendar UI (Bridge Mode)

JavaScript calendar implementation in `assets/js/postquee-bridge.js`:

- Views: Day, Week, Month
- State management with local JS object
- Posts fetched from `postqueeObj.posts` (localized from PHP)
- Modal-based post creation with channel selection
- Real-time preview in modal

**Important**: Calendar currently displays posts but does NOT fetch live updates. Posts are loaded once via `wp_localize_script()` in `class-postquee-admin.php:enqueue_scripts()`.

## Common Development Tasks

### Adding a New API Endpoint

1. Add method to `includes/API/class-endpoints.php`:
```php
public function get_analytics($integration_id) {
    return $this->client->request("/analytics/{$integration_id}");
}
```

2. Call from hooks or admin classes:
```php
$endpoints = new \PostQuee\Connector\API\Endpoints($client);
$analytics = $endpoints->get_analytics($channel_id);
```

### Modifying Post Sync Payload

Edit `includes/Core/class-mapper.php`:
```php
public function map(\WP_Post $post, $channel_id) {
    // Add custom fields, taxonomies, etc.
}
```

Payload structure follows PostQuee API schema:
```json
{
  "content": "Post content with link",
  "media": ["https://example.com/image.jpg"],
  "integrations": [{"id": "channel-uuid"}],
  "date": "2024-01-15T10:00:00Z"
}
```

### Adding Custom Meta Fields

Register in `includes/Admin/class-metabox.php`:
```php
public function render($post) {
    // Add custom checkboxes, dropdowns, etc.
}
```

Save in `includes/Core/class-hooks.php`:
```php
private function sync_post($post_id) {
    $custom_value = get_post_meta($post_id, '_my_custom_field', true);
    // Include in payload via mapper
}
```

### Debugging API Requests

Enable WordPress debug logging in `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

Add logging to `includes/API/class-client.php`:
```php
error_log('PostQuee Request: ' . $url);
error_log('PostQuee Response: ' . print_r($data, true));
```

## Settings and Options

WordPress options (stored in `wp_options` table):

- `postquee_api_key` - API authentication key
- `postquee_base_url` - API base URL (default: `https://api.postiz.com`)
- `postquee_default_channel` - UUID of default channel for auto-sync

Post meta keys:

- `_postquee_enabled` - Boolean, enable auto-sync for this post
- `_postquee_synced_id` - UUID returned from PostQuee API
- `_postquee_error_log` - Last error message if sync failed

## WordPress Hooks & Filters

**Actions**:
- `transition_post_status` - Auto-sync trigger
- `admin_post_postquee_trigger_sync` - Manual sync handler
- `wp_ajax_postquee_push_now` - AJAX sync handler
- `enqueue_block_editor_assets` - Load Gutenberg sidebar

**Filters**:
- `postquee_api_base` - Modify API base URL
- `post_row_actions` - Add "Send to PostQuee" link

## Security Notes

- All AJAX actions verify nonces
- Direct file access blocked with `defined('ABSPATH')` checks
- User capabilities checked: `manage_options` for settings, `edit_posts` for syncing
- API key stored as plain option (WordPress encrypts database at rest)
- Input sanitization: `sanitize_text_field()`, `esc_url_raw()`, `esc_attr()`, `esc_html()`

## Testing Sync Functionality

1. Configure API key in **Settings > PostQuee Connector**
2. Select default channel from dropdown
3. Create/edit a post
4. Enable "Schedule for PostQuee" checkbox in metabox
5. Publish post
6. Check post meta: `_postquee_synced_id` should contain UUID
7. Verify post appears in PostQuee dashboard at `https://app.postquee.com`

For errors: Check `_postquee_error_log` post meta or WordPress debug log.

## Deployment

Plugin can be deployed via:

1. **Manual upload**: Zip entire `/root/WP_PostQuee` directory, upload via WordPress admin
2. **FTP/SSH**: Copy to `/wp-content/plugins/postquee-connector/`
3. **WordPress.org**: Submit via SVN (requires compliance with Plugin Check tool)

Build process: None required. Plugin is pure PHP/JS/CSS with no build step.

## Related Projects

This plugin integrates with the main PostQuee application:
- **PostQuee App**: `/opt/PostQuee` (see `/opt/PostQuee/CLAUDE.md`)
- **Production Deployment**: `/opt/postiz/` (Docker Compose setup)
- **Production URL**: `https://app.postquee.com`

## Git Workflow

Repository: `https://github.com/omribenami/WP_PostQuee`

Git is pre-configured with authentication token. Standard workflow:

```bash
git add .
git commit -m "Description"
git push origin master
```

Current branch: `master` (also the main branch for PRs)
