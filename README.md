# PostQuee Connector for WordPress

**Version:** 2.0.0
**Requires WordPress:** 5.8+
**Requires PHP:** 7.4+

A powerful WordPress plugin that brings the full PostQuee social media scheduling experience directly into your WordPress admin dashboard.

## Overview

PostQuee Connector transforms your WordPress admin into a complete social media scheduling hub with a pixel-perfect recreation of PostQuee's Calendar tab. Schedule posts to multiple platforms, manage content with AI assistance, and leverage platform-specific settings - all without leaving WordPress.

## Key Features

### 📅 Interactive Calendar
- **Multiple Views**: Day, Week, and Month calendar views
- **Real-time Updates**: See all scheduled posts across all connected channels
- **Drag & Drop**: Reschedule posts by dragging to different time slots
- **Visual Post Cards**: Color-coded by platform with preview thumbnails
- **Time-based Actions**: Click any future time slot to create a post

### ✍️ Advanced Post Creator
- **Rich Text Editor**: TipTap editor with formatting (bold, italic, underline, links, lists)
- **Multi-Channel Posting**: Select multiple social media channels at once
- **Live Preview**: Real-time preview of how your post will look on each platform
- **Media Management**: Upload images and videos with drag & drop
- **Smart Scheduling**: Visual date/time picker with timezone support
- **Tag System**: Create and assign tags for content organization

### 🤖 AI-Powered Content
- **AI Refine Button**: Built into the editor toolbar
- **6 Refinement Styles**:
  - Improve Overall - Make content more engaging
  - Make Shorter - Condense while keeping key points
  - Add Details - Expand with more information
  - More Casual - Friendly, approachable tone
  - More Professional - Formal business tone
  - Add Emojis - Enhance engagement with relevant emojis
- **Side-by-side Comparison**: Review before applying changes

### 🎯 Platform-Specific Settings
Customize posts for each platform:
- **X (Twitter)**: Reply restrictions, community posting
- **Facebook**: Privacy settings, location, tags
- **LinkedIn**: Visibility options, carousel mode
- **Instagram**: Post type (post/reel/story), collaborators, location

### 🔗 WordPress Integration
- **Classic Editor**: "Send to PostQuee" metabox button
- **Gutenberg**: Dedicated sidebar panel with calendar button
- **Seamless Transfer**: Automatically pre-fills title, content, and featured image
- **One-Click Scheduling**: From any post editor to scheduled social media post

### 🎨 Beautiful Design
- Matches PostQuee app aesthetic perfectly
- Dark theme with orange accents (#FF6900)
- Smooth animations and transitions
- Responsive layout for all screen sizes

## Installation

### From ZIP File

1. Download the latest release ZIP
2. Go to **WordPress Admin** → **Plugins** → **Add New**
3. Click **Upload Plugin** and select the ZIP file
4. Click **Install Now**, then **Activate**

### From GitHub

```bash
cd /path/to/wordpress/wp-content/plugins/
git clone https://github.com/omribenami/WP_PostQuee.git postquee-connector
```

Then activate via WordPress admin.

## Setup & Configuration

### 1. Connect to PostQuee

1. Navigate to **PostQuee** → **Settings** in WordPress admin
2. Enter your PostQuee API key (get it from [PostQuee Settings](https://app.postquee.com/settings))
3. Click **Save Changes**
4. The plugin will automatically verify your connection

### 2. Connect Social Media Channels

Connect your social media accounts directly in PostQuee:
1. Go to [PostQuee Integrations](https://app.postquee.com/integrations)
2. Connect your desired platforms (X, Facebook, LinkedIn, Instagram, etc.)
3. These channels will automatically appear in the WordPress plugin

### 3. Start Scheduling

Once configured, you can:
- Click **PostQuee** → **Calendar** to open the scheduling interface
- Use "Send to PostQuee" from any post editor
- Create posts directly from calendar time slots

## Usage Guide

### Creating a Post from Calendar

1. Navigate to **PostQuee** → **Calendar**
2. Switch between Day/Week/Month views using the view switcher
3. Click any future time slot (shows orange + on hover)
4. Fill in your post:
   - Select target channels
   - Configure platform-specific settings (if needed)
   - Write your content with the rich text editor
   - Upload media (images/videos)
   - Add tags for organization
   - Set date/time
5. Click **Schedule Post** or **Save as Draft**

### Using AI Refinement

1. Write your initial post content
2. Click the **AI Refine** button in the editor toolbar
3. Select a refinement style (Improve, Shorten, Expand, etc.)
4. Click **Refine with AI**
5. Review the suggestion
6. Click **Apply Suggestion** or **Try Again**

### Sending WordPress Posts to PostQuee

#### From Classic Editor:
1. Edit any post or page
2. Look for the **PostQuee Connector** metabox (right sidebar)
3. Click **Send to PostQuee**
4. Calendar opens with content pre-filled
5. Select channels and schedule

#### From Gutenberg:
1. Edit any post or page
2. Open the **PostQuee** sidebar (three-dot menu → PostQuee)
3. Click **📅 Open in Calendar**
4. Calendar opens with content pre-filled
5. Select channels and schedule

### Managing Scheduled Posts

- **Edit**: Click the edit icon on any post card
- **Delete**: Click the trash icon and confirm
- **Reschedule**: Drag post card to a new time slot
- **View Details**: Click post card to see full content

### Using Platform Settings

When posting to a single channel, platform-specific options appear:

**X (Twitter):**
- Who can reply: Everyone, Verified, Following, Mentioned
- Community ID (optional)

**Facebook:**
- Privacy: Public, Friends, Only Me
- Location and tags

**LinkedIn:**
- Visibility: Public, Connections only
- Carousel mode for multiple images

**Instagram:**
- Post type: Post, Reel, Story
- Location and collaborators

## Development

### Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Editor**: TipTap (rich text)
- **State**: Zustand (global), SWR (data fetching)
- **Interactions**: react-dnd (drag & drop)
- **Build**: Webpack 5, Babel
- **Backend**: PHP 7.4+, WordPress REST API

### Project Structure

```
/root/WP_PostQuee/
├── postquee-bridge.php           # Main plugin file
├── includes/
│   ├── class-postquee-bridge.php # Core loader
│   ├── class-postquee-admin.php  # Admin page
│   ├── API/                       # PostQuee API client
│   ├── Admin/                     # Admin components
│   ├── Core/                      # Business logic
│   └── Rest/                      # WordPress REST endpoints
├── src/                           # React source code
│   ├── calendar/                  # Calendar app
│   ├── post-creator/              # Post creator modal
│   └── shared/                    # Shared utilities
├── assets/
│   ├── dist/                      # Compiled bundles
│   ├── css/                       # Styles
│   └── js/                        # Legacy scripts
└── package.json                   # Dependencies
```

### Building from Source

```bash
# Install dependencies
npm install

# Development build (with watch)
npm run dev

# Production build
npm run build

# Analyze bundle size
npm run analyze
```

### Development Workflow

The plugin uses a two-tier architecture:
1. **React Frontend** → WordPress REST API
2. **WordPress REST API** → PostQuee API

This keeps API keys secure on the server while providing a native JavaScript experience.

## API Endpoints

The plugin registers these WordPress REST endpoints:

- `GET /postquee-connector/v1/integrations` - Get connected channels
- `GET /postquee-connector/v1/posts` - Fetch scheduled posts
- `POST /postquee-connector/v1/posts` - Create new post
- `DELETE /postquee-connector/v1/posts/{id}` - Delete post
- `PUT /postquee-connector/v1/posts/{id}/date` - Update post date
- `POST /postquee/v1/ai/refine` - AI content refinement

## Requirements

### Minimum Requirements
- WordPress 5.8 or higher
- PHP 7.4 or higher
- Modern browser (Chrome, Firefox, Safari, Edge)
- PostQuee account with API key

### Recommended
- WordPress 6.0+
- PHP 8.0+
- HTTPS enabled
- At least one social media channel connected in PostQuee

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Calendar not loading
- Check that your PostQuee API key is correct
- Verify you have at least one connected channel
- Check browser console for JavaScript errors

### "Send to PostQuee" button not working
- Ensure you're on the PostQuee calendar page when it opens
- Check that sessionStorage is enabled in your browser
- Try refreshing the calendar page

### Posts not appearing in calendar
- Verify posts are scheduled in PostQuee dashboard
- Check date range (switch to Month view for wider range)
- Ensure connected channels are active

### AI Refinement not working
- Note: AI features currently use demo logic
- Full OpenAI integration requires additional configuration
- Check console for API errors

## Changelog

### Version 2.0.0 (2026-01-19)

Complete rebuild with React and full feature parity with PostQuee app:

**Added:**
- Interactive calendar (Day/Week/Month views)
- Full post creator with TipTap editor
- Drag & drop post rescheduling
- Platform-specific settings (X, Facebook, LinkedIn, Instagram)
- AI content refinement with 6 styles
- Tag management system
- WordPress editor integration (Classic & Gutenberg)
- Real-time post preview
- Media upload with drag & drop
- Multi-channel posting

**Changed:**
- Migrated from iframe bridge to native React app
- Complete UI redesign matching PostQuee aesthetic
- Improved performance with SWR caching

**Technical:**
- Bundle: 1.45 MB (React + TipTap + dependencies)
- Build: Webpack 5, TypeScript 5.5
- State: Zustand + SWR
- 8 development phases completed

### Version 1.0.x (Legacy)
- Basic iframe integration
- Simple content syncing
- Settings page

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

- **Issues**: [GitHub Issues](https://github.com/omribenami/WP_PostQuee/issues)
- **PostQuee Support**: [support@postquee.com](mailto:support@postquee.com)
- **Documentation**: [PostQuee Docs](https://docs.postquee.com)

## License

This plugin is licensed under the GNU General Public License v2.0 or later.

## Credits

- **PostQuee**: [postquee.com](https://postquee.com)
- **Development**: Built with React, TipTap, and WordPress REST API
- **Icons**: Dashicons and custom SVG icons
- **Code Generation**: Developed with [Claude Code](https://claude.com/claude-code)

## Roadmap

Future enhancements planned:
- [ ] Full OpenAI/CopilotKit integration for AI features
- [ ] Additional platform providers (TikTok, Pinterest, YouTube)
- [ ] Bulk scheduling interface
- [ ] Analytics dashboard
- [ ] Template library
- [ ] Post history and versioning

---

Made with ❤️ for WordPress and PostQuee users
