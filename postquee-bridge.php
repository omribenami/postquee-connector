<?php
/**
 * Plugin Name:       PostQuee Connector
 * Plugin URI:        https://postquee.com/
 * Description:       Full-featured PostQuee calendar integration with React UI, AI assistance, drag-and-drop scheduling, and seamless WordPress editor integration.
 * Version:           2.0.0
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

define('POSTQUEE_BRIDGE_VERSION', '1.0.7');
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
