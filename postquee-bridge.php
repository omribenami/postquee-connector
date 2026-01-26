<?php
/**
 * Plugin Name:       PostQuee Connector
 * Plugin URI:        https://postquee.com/
 * Description:       Integrates the PostQuee social media dashboard directly into your WordPress admin. Connects to PostQuee API (https://app.postquee.com) to publish content to social media platforms. By using this plugin, you agree to PostQuee's Terms of Service (https://postquee.com/terms-of-service) and Privacy Policy (https://postquee.com/privacy-policy).
 * Version:           2.3.2
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Omri Ben Ami
 * Author URI:        https://github.com/omribenami
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       postquee-connector
 */

// Critical Security: Exit if accessed directly
if (!defined('ABSPATH')) {
	exit;
}

define('POSTQUEE_BRIDGE_VERSION', '2.3.2');
define('POSTQUEE_BRIDGE_PATH', plugin_dir_path(__FILE__));
define('POSTQUEE_BRIDGE_URL', plugin_dir_url(__FILE__));

require_once POSTQUEE_BRIDGE_PATH . 'includes/class-postquee-bridge.php';

/**
 * Initialize and run the plugin.
 *
 * @since 1.0.0
 */
function postquee_run_bridge()
{
	$plugin = new PostQuee_Bridge();
	$plugin->run();
}

postquee_run_bridge();
