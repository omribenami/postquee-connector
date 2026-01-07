=== PostQuee for WordPress ===
Contributors: postquee
Tags: social media, scheduling, content management, automation, marketing
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Seamlessly integrate PostQuee into your WordPress dashboard for effortless social media content scheduling and publishing.

== Description ==

PostQuee for WordPress embeds the powerful PostQuee social media scheduling platform directly into your WordPress admin dashboard. Push your WordPress posts to PostQuee with a single click, making content distribution across social media platforms faster and more efficient.

**Key Features:**

* **One-Click Integration** - Access PostQuee directly from your WordPress dashboard without leaving your admin area
* **Quick Post Sharing** - Send WordPress posts to PostQuee instantly from the post list or editor
* **Seamless Communication** - Secure iframe-based integration with postMessage bridge for reliable data transfer
* **Featured Image Support** - Automatically includes your post's featured image when sharing to PostQuee
* **Excerpt Support** - Shares post excerpts along with title and permalink
* **Clean Interface** - Modal overlay for focused content scheduling without page reloads

**How It Works:**

1. Install and activate the plugin
2. Click "PostQuee" in your WordPress admin menu to access the full PostQuee dashboard
3. When editing or viewing posts, click "Send to PostQuee" to instantly push content to PostQuee for scheduling
4. The plugin automatically sends your post title, URL, featured image, and excerpt to PostQuee

**Requirements:**

* A PostQuee account (sign up at [postquee.com](https://postquee.com))
* WordPress 5.8 or higher
* PHP 7.4 or higher

**About PostQuee:**

PostQuee is an open-source social media scheduling tool that helps you plan, create, and publish content across multiple social platforms. With this WordPress plugin, you can streamline your workflow by pushing content directly from WordPress to PostQuee.

== Installation ==

**From WordPress Admin:**

1. Navigate to Plugins > Add New
2. Search for "PostQuee for WordPress"
3. Click "Install Now" and then "Activate"
4. Click on "PostQuee" in the admin menu to start using the plugin

**Manual Installation:**

1. Download the plugin zip file
2. Navigate to Plugins > Add New > Upload Plugin
3. Choose the downloaded zip file and click "Install Now"
4. Activate the plugin through the 'Plugins' menu in WordPress

**After Activation:**

1. Look for the "PostQuee" menu item in your WordPress admin sidebar
2. Click it to access the PostQuee dashboard (requires a PostQuee account)
3. When editing posts, use the "Send to PostQuee" button in the post editor sidebar or post list

== Frequently Asked Questions ==

= Do I need a PostQuee account to use this plugin? =

Yes, you need an active PostQuee account. You can sign up at [postquee.com](https://postquee.com).

= What data is sent to PostQuee when I click "Send to PostQuee"? =

The plugin sends your post's title, permalink URL, featured image (if set), and excerpt. No sensitive data or user information is transmitted.

= Does this plugin work with custom post types? =

Currently, the plugin is designed to work with standard WordPress posts. Support for custom post types may be added in future versions.

= Is my data secure? =

Yes. The plugin uses secure iframe embedding and postMessage communication with origin validation. All data is transmitted to the official PostQuee application at app.postquee.com.

= Can I customize which data is sent to PostQuee? =

The current version sends standard post metadata (title, URL, featured image, excerpt). Customization options may be added in future releases based on user feedback.

= Does this work with the Classic Editor? =

Yes! The plugin works with both the Gutenberg block editor and the Classic Editor.

== Screenshots ==

1. PostQuee dashboard embedded in WordPress admin
2. "Send to PostQuee" button in post editor sidebar
3. "Send to PostQuee" action in post list view
4. Modal overlay showing PostQuee composer with pre-filled WordPress post data

== Changelog ==

= 1.0.3 =
* Enhanced security: Added ABSPATH checks to all PHP files
* Enhanced security: Added explicit capability checks (current_user_can) for all admin operations
* Enhanced security: Improved data sanitization and output escaping using WordPress best practices
* Improved code: Prefixed global functions with wppq_ to prevent naming collisions
* Improved code: Updated translation functions to secure versions (esc_html_e, esc_html__)
* Improved compliance: Renamed plugin from "PostQuee Smart Bridge" to "PostQuee for WordPress"
* Added: GPL v2 license declaration in plugin header
* Added: Comprehensive readme.txt for WordPress.org submission

= 1.0.2 =
* Improved message delivery reliability with extended retry mechanism
* Added debug logging for WordPress-PostQuee integration
* Enhanced retry intervals (1.5s, 3s, 5s, 8s) to handle slow app loading/hydration

= 1.0.1 =
* Restored WordPress admin sidebar visibility
* Fixed CSS layout issues in modal overlay

= 1.0.0 =
* Initial release
* Iframe integration with PostQuee dashboard
* One-click "Send to PostQuee" from post list and editor
* Featured image and excerpt support
* Secure postMessage communication bridge

== Upgrade Notice ==

= 1.0.3 =
Important security and compliance update. Adds explicit capability checks, improves data sanitization, and meets WordPress.org Plugin Directory requirements. Recommended for all users.

= 1.0.2 =
Improves reliability of message delivery between WordPress and PostQuee. Recommended update for all users.

= 1.0.1 =
Fixes UI layout issues. Update recommended for better user experience.

== Privacy Policy ==

PostQuee for WordPress integrates with the PostQuee service (app.postquee.com). When you use the "Send to PostQuee" feature, the following data is transmitted to PostQuee:

* Post title
* Post permalink URL
* Featured image URL (if set)
* Post excerpt

This data is sent via secure postMessage communication to enable content scheduling functionality. No personal user data, passwords, or sensitive information is transmitted by this plugin.

For information about how PostQuee handles your data, please review the PostQuee Privacy Policy at [postquee.com/privacy](https://postquee.com/privacy).

== Support ==

For support, feature requests, or bug reports, please visit:

* Plugin Support Forum: [wordpress.org/support/plugin/postquee-for-wordpress](https://wordpress.org/support/plugin/postquee-for-wordpress)
* PostQuee Website: [postquee.com](https://postquee.com)
* GitHub Repository: [github.com/omribenami/WP_PostQuee](https://github.com/omribenami/WP_PostQuee)
