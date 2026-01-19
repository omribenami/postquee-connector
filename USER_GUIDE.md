# PostQuee Connector - User Guide

This guide will walk you through everything you need to know to get the most out of PostQuee Connector for WordPress.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Navigating the Calendar](#navigating-the-calendar)
3. [Creating Posts](#creating-posts)
4. [Using AI Refinement](#using-ai-refinement)
5. [WordPress Integration](#wordpress-integration)
6. [Platform-Specific Settings](#platform-specific-settings)
7. [Tips & Best Practices](#tips--best-practices)

## Getting Started

### First-Time Setup

1. **Install the Plugin**
   - Download from WordPress.org or GitHub
   - Upload via Plugins → Add New → Upload
   - Activate the plugin

2. **Get Your PostQuee API Key**
   - Log in to [PostQuee](https://app.postquee.com)
   - Navigate to Settings → API Keys
   - Generate a new API key
   - Copy the key (you'll need it in the next step)

3. **Configure the Plugin**
   - In WordPress, go to PostQuee → Settings
   - Paste your API key
   - Click Save Changes
   - You should see a green "Connected" message

4. **Connect Social Media Accounts**
   - In PostQuee (not WordPress), go to Integrations
   - Connect your social media accounts (X, Facebook, LinkedIn, Instagram, etc.)
   - These will automatically appear in the WordPress plugin

5. **Access the Calendar**
   - Click PostQuee → Calendar in WordPress admin
   - Your calendar is now ready to use!

## Navigating the Calendar

### Understanding the Interface

The calendar has three main components:

1. **Header Bar**
   - Navigation arrows (← →) to move between time periods
   - Current date range display
   - "Today" button to jump to current date
   - View switcher (Day/Week/Month buttons)

2. **Calendar Grid**
   - Shows time slots with scheduled posts
   - Color-coded post cards by platform
   - Orange + icon appears on hover (future slots only)
   - Past slots are grayed out and non-interactive

3. **Post Cards**
   - Platform icon and name
   - Post time
   - Content preview (first few lines)
   - Edit and delete buttons (on hover)

### Switching Views

**Day View:**
- Shows 24 hours in detail
- Best for managing hourly scheduling
- Wider time slots for easier clicking

**Week View:**
- Shows 7 days (Monday-Sunday)
- 24-hour rows for each day
- Good balance between detail and overview
- Recommended for most users

**Month View:**
- Shows 6 weeks (42 days total)
- Compact view with multiple posts per cell
- "+ X more" indicator when posts exceed display limit
- Best for long-range planning

### Navigation Shortcuts

- **Previous/Next**: Click arrows or use keyboard (← →)
- **Today**: Click "Today" button or press T
- **Switch Views**: Click Day/Week/Month buttons

## Creating Posts

### Method 1: From Calendar Time Slot

1. **Select a Time**
   - Navigate to your desired date/time
   - Hover over an empty future slot (orange + appears)
   - Click the slot

2. **The Post Creator Opens**
   - Pre-filled with the clicked date/time
   - Ready for you to add content

3. **Select Channels**
   - Click channel avatars to select (multiple allowed)
   - Selected channels show orange border + checkmark
   - Can select 1 or more channels

4. **Configure Platform Settings** (if 1 channel selected)
   - Platform-specific options appear below channel selector
   - Configure privacy, reply settings, etc.
   - Settings vary by platform (see Platform Settings section)

5. **Write Your Content**
   - Use the rich text editor (TipTap)
   - Formatting toolbar: Bold, Italic, Underline, Link, Lists
   - Character counter shows at bottom
   - Preview updates in real-time on the right

6. **Add Media** (optional)
   - Click "Add Media" or drag & drop files
   - Supports images and videos
   - Maximum 4 files
   - Preview shows in grid layout

7. **Set Date/Time**
   - Use date and time pickers
   - Must be in the future
   - Shows formatted preview below

8. **Add Tags** (optional)
   - Type tag name and press Enter
   - Select from existing tags (dropdown appears)
   - Click X to remove tags
   - Tags help organize your content

9. **Schedule or Draft**
   - **Schedule Post**: Publishes at the set time
   - **Save as Draft**: Saves for later editing
   - Success message appears and calendar refreshes

### Method 2: From WordPress Post Editor

See [WordPress Integration](#wordpress-integration) section below.

### Editing Existing Posts

1. Click the edit icon on any post card
2. Modal opens with content pre-filled
3. Make your changes
4. Click "Schedule Post" to update

### Deleting Posts

1. Click the trash icon on any post card
2. Confirm deletion in the dialog
3. Post is removed from calendar and PostQuee

### Rescheduling with Drag & Drop

1. Click and hold a post card
2. Drag to a new time slot
3. Release to drop
4. Post instantly reschedules
5. Original time is preserved when moving across days

## Using AI Refinement

AI-powered content improvement is built right into the editor.

### How to Use

1. **Write Your Initial Content**
   - Type your post in the editor
   - Can be rough draft or polished content

2. **Open AI Refiner**
   - Click the purple "AI Refine" button in editor toolbar
   - Modal opens with refinement options

3. **Choose a Style**
   - **Improve Overall**: Makes content more engaging and professional
   - **Make Shorter**: Reduces length while keeping key points
   - **Add Details**: Expands with more information and context
   - **More Casual**: Friendly, approachable, conversational tone
   - **More Professional**: Formal, business-appropriate language
   - **Add Emojis**: Adds relevant emojis for visual engagement

4. **Review the Suggestion**
   - Original content shows above
   - AI suggestion shows below in highlighted box
   - Compare side-by-side

5. **Apply or Retry**
   - **Apply Suggestion**: Replaces your content
   - **Try Again**: Select different style and refine again
   - Close modal to cancel

### Tips for Best Results

- Start with clear, complete thoughts
- Longer content gives AI more to work with
- Try multiple styles to see different approaches
- Always review before applying
- Edit the AI output to match your voice

### Note on AI Features

Currently uses demonstration logic. Full OpenAI/CopilotKit integration can be configured in WordPress settings for production-grade AI refinement.

## WordPress Integration

One of the most powerful features is sending WordPress posts directly to PostQuee.

### From Classic Editor

1. **Create or Edit a Post**
   - Open any post or page in WordPress
   - Write your content as normal

2. **Look for PostQuee Metabox**
   - Located in the right sidebar
   - Orange "Send to PostQuee" button

3. **Click Send to PostQuee**
   - Redirects to PostQuee Calendar
   - Post creator modal opens automatically
   - Content is pre-filled:
     - Post title becomes H2 heading
     - Post content loads into editor
     - Featured image added to media

4. **Complete Scheduling**
   - Select channels
   - Configure settings
   - Set date/time
   - Schedule post

### From Gutenberg (Block Editor)

1. **Create or Edit a Post**
   - Open any post or page in Gutenberg

2. **Open PostQuee Sidebar**
   - Click the three-dot menu (⋮) in top right
   - Select "PostQuee" from plugins list
   - Sidebar appears on the right

3. **Click "📅 Open in Calendar"**
   - Primary orange button
   - Redirects to calendar with content pre-filled

4. **Alternative: Quick Sync**
   - "Quick Sync" button is also available
   - Uses default channel from settings
   - Faster but less control

### What Gets Transferred

- ✅ Post Title (as H2 heading in content)
- ✅ Post Content (HTML formatting preserved)
- ✅ Featured Image (added to media array)
- ✅ Post URL (reference, not published)
- ✅ Post ID (for tracking)

### Best Practices

- **Save Draft First**: Save your WordPress post before sending
- **Check Content**: Review formatting in post creator
- **Select Channels**: Choose appropriate platforms
- **Add Platform Context**: Tailor content for each platform
- **Use Tags**: Tag WP-sourced posts for tracking

## Platform-Specific Settings

When posting to a single channel, you can configure platform-specific options.

### X (Twitter)

**Who Can Reply:**
- Everyone (default)
- Verified accounts only
- People you follow
- Only people you mention

**Community ID:**
- Optional field
- Post to a specific X community
- Enter the community ID from X

### Facebook

**Privacy:**
- Public (default)
- Friends
- Only Me

**Location:**
- Optional text field
- Add location name
- Example: "San Francisco, CA"

**Tags:**
- Comma-separated list
- Example: "marketing, business, tech"
- Helps with Facebook search

### LinkedIn

**Visibility:**
- Public (default) - Visible to all LinkedIn users
- Connections Only - Only your connections see it

**Carousel:**
- Checkbox option
- Converts multiple images into LinkedIn carousel
- Only works with 2+ images
- Creates swipeable post format

### Instagram

**Post Type:**
- Post (default) - Standard Instagram post
- Reel - Short-form video content
- Story - 24-hour temporary post

**Location:**
- Optional text field
- Add location tag
- Example: "Times Square, New York"

**Collaborators:**
- Comma-separated list of @ usernames
- Example: "@user1, @user2"
- Tagged users can share to their profile

### Multi-Channel Posting

When multiple channels are selected:
- Platform settings are hidden
- Default settings used for each platform
- To use custom settings, create separate posts

## Tips & Best Practices

### Content Strategy

1. **Plan Ahead**
   - Use Month view to see the big picture
   - Space out posts for consistent engagement
   - Consider timezone of your audience

2. **Tailor Content**
   - Different platforms have different audiences
   - Use platform settings appropriately
   - Adjust tone for each platform

3. **Use Tags**
   - Organize posts by campaign
   - Track content types
   - Filter and analyze later

### Workflow Tips

1. **Batch Creation**
   - Create multiple posts in one session
   - Use AI refine to vary content
   - Save drafts for review later

2. **WordPress Integration**
   - Write long-form in WordPress
   - Extract key points for social
   - Link back to full article

3. **Media Preparation**
   - Optimize images before upload
   - Use correct dimensions for each platform
   - Test video formats

### Calendar Management

1. **Regular Review**
   - Check calendar daily or weekly
   - Reschedule if needed with drag & drop
   - Delete outdated content

2. **Balance Your Schedule**
   - Don't over-post or under-post
   - Find your optimal frequency
   - Use Week view to see patterns

3. **Track Performance**
   - Note which posts perform well
   - Refine your strategy over time
   - Adjust posting times

### Common Pitfalls to Avoid

- ❌ Posting same content to all platforms
- ❌ Scheduling too far in advance
- ❌ Forgetting to add media
- ❌ Not reviewing content before scheduling
- ❌ Ignoring platform-specific settings
- ❌ Over-using AI without editing

### Getting Help

**If Something Goes Wrong:**

1. Check browser console (F12) for errors
2. Verify API key in Settings
3. Ensure channels are connected in PostQuee
4. Try refreshing the page
5. Check Requirements in README

**For Support:**
- GitHub Issues for plugin bugs
- PostQuee support for API/account issues
- WordPress forums for WordPress-specific questions

## Keyboard Shortcuts

- `T` - Jump to Today
- `←` / `→` - Navigate previous/next
- `Esc` - Close modal
- `Ctrl/Cmd + B` - Bold in editor
- `Ctrl/Cmd + I` - Italic in editor
- `Ctrl/Cmd + U` - Underline in editor

## Glossary

- **Integration**: A connected social media account in PostQuee
- **Channel**: Same as integration (used interchangeably)
- **Post Card**: Visual representation of scheduled post in calendar
- **Time Slot**: Clickable area in calendar for creating posts
- **Platform Settings**: Channel-specific configuration options
- **Draft**: Saved post not yet scheduled
- **Schedule**: Set post to publish at specific time

---

**Need More Help?**

- 📖 Full README: See README.md
- 🐛 Report Issues: GitHub Issues
- 💬 Support: support@postquee.com
- 📚 PostQuee Docs: docs.postquee.com

Happy Scheduling! 🎉
