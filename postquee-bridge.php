<?php
/**
 * Plugin Name: PostQuee Smart Bridge
 * Plugin URI: https://postquee.com
 * Description: Integrates PostQuee directly into your WordPress dashboard, allowing seamless content pushing and scheduling.
 * Version: 1.0.1
 * Author: PostQuee
 * Author URI: https://postquee.com
 * Text Domain: postquee-bridge
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'POSTQUEE_BRIDGE_VERSION', '1.0.1' );
define( 'POSTQUEE_BRIDGE_PATH', plugin_dir_path( __FILE__ ) );
define( 'POSTQUEE_BRIDGE_URL', plugin_dir_url( __FILE__ ) );

require_once POSTQUEE_BRIDGE_PATH . 'includes/class-postquee-bridge.php';

function run_postquee_bridge() {
	$plugin = new PostQuee_Bridge();
	$plugin->run();
}

run_postquee_bridge();
