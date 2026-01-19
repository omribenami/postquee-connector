=== PostQuee Connector ===
Contributors: omribenami
Tags: social media, scheduler, postquee, automation, api
Requires at least: 5.8
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Seamlessly publish and schedule WordPress content to PostQuee using the official API.

== Description ==

The PostQuee Connector for WordPress allows you to automatically or manually sync your posts to the PostQuee social media management platform. 

**Key Features:**

* **Native API Integration**: Uses a secure API connection (no iframes).
* **Automatic Sync**: Option to automatically push posts when they are published.
* **Manual Control**: "Push Now" button to manually sync posts or retry failed pushes.
* **Media Support**: Automatically uploads your Featured Image to PostQuee.
* **Smart Content Mapping**: Converts your post content, cleans HTML, and appends the permalink.
* **Idempotency**: Prevents duplicate posts by tracking sync status.

== Installation ==

1. Upload the plugin folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Go to **Settings > PostQuee Connector**.
4. Enter your **API Key** (obtained from your PostQuee dashboard).
5. Save Settings.
6. Select your **Default Channel** from the dropdown list.

== Screenshots ==

1. Settings Page with API Key and Channel selection.
2. Post Editor Meta box showing "Synced" status.

== Changelog ==

= 1.0.0 =
* Initial release of the dedicated API Connector plugin.
