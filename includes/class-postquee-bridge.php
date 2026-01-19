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
		$this->init_rest_api();
		$this->init_send_metabox();
	}

	private function load_dependencies()
	{
		require_once POSTQUEE_BRIDGE_PATH . 'includes/class-postquee-admin.php';

		// Load REST API dependencies (for React calendar)
		require_once POSTQUEE_BRIDGE_PATH . 'includes/API/class-client.php';
		require_once POSTQUEE_BRIDGE_PATH . 'includes/API/class-endpoints.php';
		require_once POSTQUEE_BRIDGE_PATH . 'includes/Admin/class-settings.php';
		require_once POSTQUEE_BRIDGE_PATH . 'includes/Admin/class-send-metabox.php';
		require_once POSTQUEE_BRIDGE_PATH . 'includes/Core/class-mapper.php';
		require_once POSTQUEE_BRIDGE_PATH . 'includes/Rest/class-controller.php';
	}

	private function define_admin_hooks()
	{
		$plugin_admin = new PostQuee_Admin('postquee-connector', POSTQUEE_BRIDGE_VERSION);

		// Initialize all admin hooks (Tasks, Settings, Meta Boxes, etc.)
		$plugin_admin->init_hooks();
	}

	private function init_rest_api()
	{
		// Initialize REST API controller for React calendar
		$rest_controller = new \PostQuee\Connector\Rest\Controller();
		$rest_controller->init();
	}

	private function init_send_metabox()
	{
		// Initialize "Send to PostQuee" metabox for post editor
		$send_metabox = new \PostQuee\Connector\Admin\Send_Metabox();
		$send_metabox->init();
	}
}
