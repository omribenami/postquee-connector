<?php
/**
 * Uninstall script for PostQuee Connector
 *
 * This file is called when the plugin is deleted from WordPress.
 * It removes all plugin data from the database.
 *
 * @package PostQuee_Connector
 * @since 2.3.2
 */

// If uninstall not called from WordPress, exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
	exit;
}

/**
 * Remove all plugin options
 */
function postquee_connector_uninstall_options() {
	// Delete main plugin options
	delete_option('postquee_api_key');
	delete_option('postquee_default_channel');
	delete_option('postquee_auto_sync');
	delete_option('postquee_connector_version');

	// Delete any transients (cached data)
	delete_transient('postquee_integrations_cache');
	delete_transient('postquee_posts_cache');
	delete_transient('postquee_api_connection_check');
}

/**
 * Remove all post meta created by the plugin
 */
function postquee_connector_uninstall_post_meta() {
	global $wpdb;

	// Delete all post meta with postquee prefix
	$wpdb->query(
		"DELETE FROM {$wpdb->postmeta}
		WHERE meta_key LIKE '_postquee_%'"
	);
}

/**
 * Remove all user meta created by the plugin
 */
function postquee_connector_uninstall_user_meta() {
	global $wpdb;

	// Delete all user meta with postquee prefix
	$wpdb->query(
		"DELETE FROM {$wpdb->usermeta}
		WHERE meta_key LIKE 'postquee_%'"
	);
}

/**
 * Remove any custom database tables (if any exist)
 */
function postquee_connector_uninstall_tables() {
	global $wpdb;

	// Currently no custom tables, but prepared for future use
	// Example:
	// $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}postquee_logs");
}

/**
 * Clear any scheduled cron jobs
 */
function postquee_connector_uninstall_cron() {
	// Remove any scheduled events
	$timestamp = wp_next_scheduled('postquee_sync_scheduled_posts');
	if ($timestamp) {
		wp_unschedule_event($timestamp, 'postquee_sync_scheduled_posts');
	}

	// Clear cron hook
	wp_clear_scheduled_hook('postquee_sync_scheduled_posts');
}

// Execute cleanup functions
postquee_connector_uninstall_options();
postquee_connector_uninstall_post_meta();
postquee_connector_uninstall_user_meta();
postquee_connector_uninstall_tables();
postquee_connector_uninstall_cron();

// Optional: Log the uninstall for debugging (only if WP_DEBUG is enabled)
if (defined('WP_DEBUG') && WP_DEBUG) {
	error_log('PostQuee Connector: Plugin uninstalled and all data removed');
}
