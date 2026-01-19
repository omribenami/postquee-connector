<?php
/**
 * Core plugin class
 *
 * @package PostQuee
 */

if (!defined('ABSPATH')) {
	exit;
}

class PostQuee_Bridge
{

	public function run()
	{
		$this->load_dependencies();
		$this->define_admin_hooks();
	}

	private function load_dependencies()
	{
		require_once POSTQUEE_BRIDGE_PATH . 'includes/class-postquee-admin.php';
	}

	private function define_admin_hooks()
	{
		$plugin_admin = new PostQuee_Admin('postquee-connector', POSTQUEE_BRIDGE_VERSION);

		// Initialize all admin hooks (Tasks, Settings, Meta Boxes, etc.)
		$plugin_admin->init_hooks();
	}
}
