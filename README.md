# PostQuee Connector for WordPress

**PostQuee Connector** seamlessly integrates the [PostQuee](https://postquee.com) content scheduling platform directly into your WordPress dashboard.

## Features

*   **Embedded Dashboard**: Access your full PostQuee workspace (`app.postquee.com`) without leaving the WordPress admin area.
*   **"Send to PostQuee" Workflow**: Instantly push WordPress posts to PostQuee to schedule or publish them to your social networks.
    *   Works from the **Post List** ("Send to PostQuee" hover action).
    *   Works from the **Post Editor** (dedicated sidebar button).
*   **Smart Bridge Technology**:
    *   Uses secure `postMessage` communication to pre-fill the PostQuee composer with your post's Title, URL, Excerpt, and Featured Image.
    *   Automatically resizes the interface to prevent double scrollbars, ensuring a native WordPress feel.
*   **Performance Optimized**: Scripts and styles are only loaded on the PostQuee pages, keeping your site fast.

## Installation

1.  Download the plugin as a ZIP file (or clone this repository).
2.  Go to your WordPress Admin -> **Plugins** -> **Add New**.
3.  Click **Upload Plugin** and select the ZIP file.
4.  Activate the plugin.

## Configuration

1.  Navigate to **PostQuee** -> **Settings** in the WordPress admin menu.
2.  **App URL**: By default, this is set to `https://app.postquee.com`. If you are using a white-labeled version or a self-hosted instance, update this URL to point to your PostQuee application.

## How It Works

1.  **Dashboard**: Clicking the "PostQuee" menu item loads the app in a smart iframe. Authentication is handled via your browser session (if you are logged into PostQuee, you are auto-logged in here).
2.  **Pushing Content**: When you click "Send to PostQuee" on a post, the plugin opens a lightweight modal overlay, sends the post data to the PostQuee app, and launches the "Create Post" composer automatically.

## Requirements

*   WordPress 5.0 or higher.
*   A PostQuee account.

## License

GPLv2 or later.
