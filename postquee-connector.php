<?php
/**
 * Plugin Name: PostQuee Connector
 * Description: Full-featured PostQuee calendar integration with API-based post scheduling, media uploads, and AI assistance.
 * Version: 2.0.2
 * Author: PostQuee
 * Text Domain: postquee-connector
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

namespace PostQuee\Connector;

if (!defined('ABSPATH')) {
    exit;
}

// ========================================
// LEGACY FILE - DO NOT USE
// ========================================
// This file is kept for backwards compatibility only.
// The active plugin file is: postquee-bridge.php
//
// If postquee-bridge.php is loaded, exit early to prevent conflicts.
if (defined('POSTQUEE_BRIDGE_VERSION')) {
    return; // Bridge is active, don't load old connector
}

// If we get here, show admin notice that this file is deprecated
add_action('admin_notices', function() {
    ?>
    <div class="notice notice-warning is-dismissible">
        <p><strong>PostQuee Connector:</strong> You are using the legacy plugin file. Please deactivate this plugin and activate "PostQuee Connector" (postquee-bridge.php) instead.</p>
    </div>
    <?php
});

// Exit early - don't load any of the old code
return;

// Constants
define('POSTQUEE_CONNECTOR_VERSION', '2.0.3');
define('POSTQUEE_CONNECTOR_PATH', plugin_dir_path(__FILE__));
define('POSTQUEE_CONNECTOR_URL', plugin_dir_url(__FILE__));

// API URL constant (can be overridden in wp-config.php)
if (!defined('POSTQUEE_API_URL')) {
    define('POSTQUEE_API_URL', 'https://app.postquee.com/api/public/v1');
}

// Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'PostQuee\\Connector\\';
    $base_dir = POSTQUEE_CONNECTOR_PATH . 'includes/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);

    // Map namespace parts to directories
    $parts = explode('\\', $relative_class);
    $file_name = 'class-' . str_replace('_', '-', strtolower(array_pop($parts))) . '.php';
    $dir_path = implode('/', $parts);

    $file = $base_dir . $dir_path . '/' . $file_name;

    // Fix handling for empty dir_path (root namespace in includes?)
    // Our structure: PostQuee\Connector\API\Client -> includes/API/class-client.php
    // parts = ['API'], file_name = class-client.php

    $file = str_replace('//', '/', $file);

    if (file_exists($file)) {
        require $file;
    }
});

// Initialize
function init()
{
    // Utils (Static, no init needed)

    // Admin
    if (is_admin()) {
        $dashboard = new Admin\Dashboard();
        $dashboard->init();

        $settings = new Admin\Settings();
        $settings->init();

        $metabox = new Admin\Metabox();
        $metabox->init();

        // Post List Actions
        // (Optional based on user request "send to postquee button for posts")
        add_filter('post_row_actions', __NAMESPACE__ . '\\add_row_actions', 10, 2);
    }

    // Core Hooks
    $hooks = new Core\Hooks();
    $hooks->init();

    // REST API
    $rest = new Rest\Controller();
    $rest->init();

    // Block Editor Assets
    add_action('enqueue_block_editor_assets', __NAMESPACE__ . '\\enqueue_block_editor_assets');
}

/**
 * Enqueue Gutenberg Assets.
 */
function enqueue_block_editor_assets()
{
    wp_enqueue_script(
        'postquee-gutenberg-sidebar',
        POSTQUEE_CONNECTOR_URL . 'assets/js/gutenberg-sidebar.js',
        array('wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-data', 'wp-compose', 'wp-api-fetch'),
        time() // Bust cache
    );
}

/**
 * Add Row Actions.
 */
function add_row_actions($actions, $post)
{
    if ('post' !== $post->post_type) {
        return $actions;
    }

    // Check if already synced
    $is_synced = get_post_meta($post->ID, '_postquee_synced_id', true);
    $nonce = wp_create_nonce('postquee_sync_link');
    $url = admin_url('admin-post.php?action=postquee_trigger_sync&post_id=' . $post->ID . '&nonce=' . $nonce);

    if ($is_synced) {
        $actions['postquee_sync'] = '<a href="' . esc_url($url) . '" title="Sync again">Re-send to PostQuee</a>';
    } else {
        $actions['postquee_sync'] = '<a href="' . esc_url($url) . '" style="color: #ff6900; font-weight: bold;">Send to PostQuee</a>';
    }

    return $actions;
}

add_action('plugins_loaded', __NAMESPACE__ . '\\init');
