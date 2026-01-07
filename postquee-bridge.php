<?php
/**
 * Plugin Name: PostQuee for WordPress
 * Plugin URI: https://postquee.com
 * Description: Integrates PostQuee directly into your WordPress dashboard, allowing seamless content pushing and scheduling.
 * Version: 1.0.3
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: PostQuee
 * Author URI: https://postquee.com
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: postquee-bridge
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'POSTQUEE_BRIDGE_VERSION', '1.0.3' );
define( 'POSTQUEE_BRIDGE_PATH', plugin_dir_path( __FILE__ ) );
define( 'POSTQUEE_BRIDGE_URL', plugin_dir_url( __FILE__ ) );

require_once POSTQUEE_BRIDGE_PATH . 'includes/class-postquee-bridge.php';

/**
 * Initialize and run the plugin.
 *
 * @since 1.0.0
 */
function wppq_run_postquee_bridge() {
	$plugin = new PostQuee_Bridge();
	$plugin->run();
}

wppq_run_postquee_bridge();
