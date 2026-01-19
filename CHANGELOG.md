# PostQuee Connector - Changelog

## Version 2.0.2 (2026-01-18)

### Bug Fixes
- **Fixed**: Post creation payload validation errors
  - Added platform-specific settings for each social network (TikTok, Pinterest, Discord, etc.)
  - Fixed image array format - now uses proper object structure: `[{id: 'x', path: 'url'}]`
  - Added `get_platform_settings()` method with correct settings for 15+ platforms
  - Dynamically fetches integration details to determine platform type

- **Fixed**: AI Assistant 404 error
  - Disabled AI content generation (not available in Public API v1)
  - Provides helpful error message directing users to full app
  - Prevents unnecessary API calls to non-existent `/generate` endpoint

- **Fixed**: Date navigation display in day view
  - Day view now shows single date (e.g., "01/18/2026") instead of range
  - Week/Month views correctly show date range (e.g., "01/12/2026 - 01/18/2026")
  - Updated `updateDateDisplay()` to detect current view mode

### Changes
- Enhanced post creation to support all PostQuee platforms
- Added comprehensive platform settings mapping
- Improved error handling for API validation

### Platform Support Added
Now correctly handles settings for:
- Twitter/X - reply permissions, communities
- LinkedIn - carousel posts
- Instagram - post types, collaborators
- TikTok - privacy, duets, stitches, music, brand content
- Pinterest - boards, titles, links
- Discord - channels
- Slack - channels
- Medium - titles, subtitles, tags
- Dev.to - titles, tags
- Hashnode - titles, subtitles, tags
- Reddit - subreddits
- Facebook - URLs
- YouTube - titles, visibility, made-for-kids
- Threads, Mastodon, Bluesky, Telegram, Nostr, VK, Warpcast

### Files Modified
- `includes/Admin/class-dashboard.php` - Platform settings, image format, AI disable
- `assets/js/postquee-calendar.js` - Date display fix
- `postquee-connector.php` - Version bump to 2.0.2

---

## Version 2.0.1 (2026-01-18)

### Bug Fixes
- **Fixed**: JavaScript error "wpApiSettings is not defined"
  - Added proper `wp_localize_script()` call to provide WordPress REST API settings
  - Added `wpApiSettings` global with `root` and `nonce` properties
  - Added `ajaxurl` global for WordPress admin compatibility
  - Updated asset versions to 1.3.1 to break cache

### Changes
- Enhanced script localization in `Dashboard::enqueue_assets()`
- Added inline script to ensure `ajaxurl` is always available
- Improved JavaScript compatibility with WordPress environment

### Files Modified
- `includes/Admin/class-dashboard.php` - Added wpApiSettings localization
- `postquee-connector.php` - Version bump to 2.0.1

---

## Version 2.0.0 (2026-01-18)

### Major Release - Complete Rewrite

#### New Features
- **Full Calendar Interface** matching PostQuee app
  - Week view with 24-hour time slots
  - Month view with day cells
  - Day view for single-day focus
  - Real-time post display with channel avatars
  - Navigation controls (prev/next/today)

- **API-Based Integration**
  - Complete implementation of PostQuee Public API v1
  - All endpoints: integrations, posts, uploads, AI features
  - Proper authentication (raw API key, no Bearer prefix)
  - WordPress REST API controller

- **Post Management**
  - Create posts with live preview
  - Multi-channel selection
  - Media upload (file + URL)
  - Schedule picker (now/schedule/draft)
  - Delete posts with confirmation
  - AI content assistant integration

- **Modern UI/UX**
  - Premium dark theme (#0F1115 background)
  - Orange gradient accents (#ff6900)
  - Smooth animations and hover effects
  - Responsive design
  - Loading states and error handling

#### Technical Improvements
- **Enhanced API Client** (`includes/API/class-client.php`)
  - Multipart file upload support
  - Upload from URL capability
  - Query parameter support
  - Robust error handling

- **Complete API Endpoints** (`includes/API/class-endpoints.php`)
  - `list_integrations()` - Get all channels
  - `list_posts()` - Get posts for date range
  - `create_post()` - Create/schedule posts
  - `delete_post()` - Remove posts
  - `upload_file()` - Upload media
  - `upload_from_url()` - URL-based upload
  - `generate_video()` - AI video generation
  - `is_connected()` - Connection check

- **WordPress REST API** (`includes/Rest/class-controller.php`)
  - Full REST endpoints at `/wp-json/postquee-connector/v1/`
  - Proper nonce verification
  - Capability checks
  - Error handling

- **JavaScript Calendar App** (`assets/js/postquee-calendar.js`)
  - State management for posts and integrations
  - API service layer
  - Calendar renderers for all views
  - Post creation modal
  - Real-time updates

- **Modern CSS** (`assets/css/postquee-admin.css`)
  - 800+ lines of custom styling
  - Calendar grid layouts
  - Post cards and animations
  - Responsive breakpoints

#### Architecture Changes
- PSR-4 autoloading for all classes
- Namespaced classes (`PostQuee\Connector\`)
- Modular architecture:
  - API Layer (Client + Endpoints)
  - REST API Layer (Controller)
  - Admin Layer (Dashboard, Settings, Metabox)
  - Core Layer (Hooks, Mapper)
  - Utils Layer (Helpers)

#### Files Added
- `includes/API/class-client.php` - Enhanced HTTP client
- `includes/API/class-endpoints.php` - API wrappers
- `includes/Admin/class-dashboard.php` - Calendar dashboard
- `includes/Admin/class-settings.php` - Settings page
- `includes/Admin/class-metabox.php` - Gutenberg integration
- `includes/Core/class-hooks.php` - Event handlers
- `includes/Core/class-mapper.php` - Data mapping
- `includes/Rest/class-controller.php` - REST API
- `includes/Utils/class-date-helper.php` - Utilities
- `assets/js/postquee-calendar.js` - Calendar app (500+ lines)
- `assets/css/postquee-admin.css` - Modern styling (800+ lines)
- `IMPLEMENTATION_SUMMARY.md` - Technical documentation
- `ZIP_VERIFICATION.md` - Deployment verification

#### Files Removed (Legacy Bridge Mode)
- `postquee-bridge.php` - Old main file
- `includes/class-postquee-bridge.php` - Old bridge class
- `includes/class-postquee-admin.php` - Old admin class
- `assets/css/postquee-bridge.css` - Old styling
- `assets/js/postquee-bridge.js` - Old JavaScript

#### Breaking Changes
- Complete plugin rewrite - not backward compatible with v1.0.0
- Different architecture and file structure
- Requires WordPress 5.8+ (was 5.0+)
- Requires PHP 7.4+ (was 7.2+)
- API key configuration required

#### Migration from v1.0.0
1. Deactivate and delete v1.0.0
2. Install v2.0.0
3. Configure API key in Settings > PostQuee Connector
4. Connect channels at app.postquee.com/settings/channels
5. Access new calendar interface via PostQuee menu

---

## Version 1.0.0 (Initial Release)

### Features
- Basic iframe embedding of PostQuee app
- Manual WordPress post sync
- Simple admin interface
- API key configuration
- Channel selection

### Files
- `postquee-bridge.php` - Main plugin file
- `includes/class-postquee-bridge.php` - Bridge class
- `includes/class-postquee-admin.php` - Admin class
- `assets/css/postquee-bridge.css` - Basic styling
- `assets/js/postquee-bridge.js` - Basic JavaScript

---

## Upgrade Notes

### From 1.0.0 to 2.0.0
This is a **complete rewrite** with breaking changes. Follow migration steps above.

### From 2.0.0 to 2.0.1
Simple update - no configuration changes needed. The update fixes JavaScript errors.

---

## Support

- **Documentation**: See IMPLEMENTATION_SUMMARY.md
- **Issues**: GitHub repository
- **Discord**: Link in plugin sidebar
- **API Docs**: https://api.postiz.com/public/v1
