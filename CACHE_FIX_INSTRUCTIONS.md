# Fix for "wpApiSettings is not defined" Error

## Problem
You're seeing this error in the browser console:
```
Uncaught ReferenceError: wpApiSettings is not defined
```

The error shows `postquee-calendar.js?ver=1.3.0` which means you're loading an **old cached version** of the JavaScript file.

## Solution - Follow These Steps in Order

### Step 1: Upload the Updated Plugin

The ZIP file has been recreated with the fix. You need to replace the plugin:

1. **Download the new ZIP**:
   - File: `/root/WP_PostQuee/postquee-connector.zip`

2. **Deactivate the current plugin**:
   - Go to WordPress Admin → Plugins
   - Find "PostQuee Connector"
   - Click "Deactivate"

3. **Delete the old plugin**:
   - Click "Delete" (this won't remove your settings)

4. **Upload the new plugin**:
   - Click "Add New" → "Upload Plugin"
   - Choose the new `postquee-connector.zip`
   - Click "Install Now"
   - Activate the plugin

### Step 2: Clear All Caches

#### Clear WordPress Cache
If you're using a caching plugin:
- **WP Super Cache**: Go to Settings → WP Super Cache → Delete Cache
- **W3 Total Cache**: Go to Performance → Dashboard → Empty All Caches
- **WP Rocket**: Go to Settings → WP Rocket → Clear Cache
- **Any other cache**: Find and clear it

#### Clear Object Cache
Run this in WordPress admin or via WP-CLI:
```php
wp_cache_flush();
```

Or deactivate/reactivate the plugin.

### Step 3: Clear Browser Cache

#### Method A: Hard Reload (Recommended)
- **Windows/Linux**: Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: Press `Cmd + Shift + R`

#### Method B: Clear Browser Cache Manually
- **Chrome**: Settings → Privacy and Security → Clear browsing data → Cached images and files
- **Firefox**: Settings → Privacy & Security → Cookies and Site Data → Clear Data
- **Safari**: Develop → Empty Caches (or Cmd+Option+E)

#### Method C: Incognito/Private Window
Open WordPress admin in an incognito/private window to bypass cache.

### Step 4: Verify the Fix

1. Open WordPress Admin → PostQuee
2. Open Browser Console (F12)
3. Reload the page (Ctrl+Shift+R)
4. Check the JavaScript file version - it should now show:
   ```
   postquee-calendar.js?ver=2.0.1-1234567890
   ```
   (The number will be a timestamp, making it unique)

5. The error should be gone
6. The calendar should load properly

## What Was Fixed

The plugin now properly provides these global JavaScript variables:

```javascript
// WordPress REST API settings
wpApiSettings = {
    root: "https://yoursite.com/wp-json/",
    nonce: "abc123..."
}

// Admin AJAX settings
postquee_admin_vars = {
    ajaxurl: "https://yoursite.com/wp-admin/admin-ajax.php",
    nonce: "xyz789..."
}

// Global AJAX URL
ajaxurl = "https://yoursite.com/wp-admin/admin-ajax.php"
```

## Alternative: Quick Fix Without Re-uploading

If you can access the server files directly:

1. **Edit the file**:
   ```
   /wp-content/plugins/postquee-connector/includes/Admin/class-dashboard.php
   ```

2. **Find the `enqueue_assets` method** (around line 36)

3. **Replace the localization section** with:
   ```php
   // Localize script with WordPress REST API settings
   wp_localize_script('postquee-calendar-js', 'wpApiSettings', array(
       'root' => esc_url_raw(rest_url()),
       'nonce' => wp_create_nonce('wp_rest'),
   ));

   // Also localize for admin vars
   wp_localize_script('postquee-calendar-js', 'postquee_admin_vars', array(
       'ajaxurl' => admin_url('admin-ajax.php'),
       'nonce' => wp_create_nonce('postquee_ai_nonce'),
   ));

   // Add global ajaxurl
   wp_add_inline_script('postquee-calendar-js',
       'var ajaxurl = "' . admin_url('admin-ajax.php') . '";',
       'before'
   );
   ```

4. **Save the file**

5. **Clear caches** (Steps 2-4 above)

## Still Having Issues?

### Check WordPress Version
- Requires WordPress 5.8+
- Check: WordPress Admin → Dashboard → At a Glance

### Check PHP Version
- Requires PHP 7.4+
- Check: WordPress Admin → Tools → Site Health → Info → Server

### Check Browser Console
After following all steps, if you still see errors:

1. Open Browser Console (F12)
2. Copy the full error message
3. Check if `wpApiSettings` exists by typing in console:
   ```javascript
   console.log(wpApiSettings);
   ```
   Should output: `{root: "...", nonce: "..."}`

### Enable WordPress Debug Mode
Add to `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('SCRIPT_DEBUG', true);
```

Check `/wp-content/debug.log` for any PHP errors.

## Expected Behavior After Fix

✅ No JavaScript errors in console
✅ Calendar grid renders properly
✅ Channels load in sidebar
✅ "Create Post" button works
✅ Calendar navigation works (prev/next/today)
✅ View switcher works (Week/Month/Day)

## Version Information

- **Plugin Version**: 2.0.1
- **Fix Applied**: wpApiSettings localization
- **Asset Version**: Dynamic (includes timestamp)
- **Cache Busting**: Enabled

The version string will look like: `2.0.1-1737228000` (the number is a Unix timestamp that changes every time the page loads, ensuring fresh assets).
