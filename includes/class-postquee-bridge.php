<?php
/**
 * Core plugin class
 *
 * @package PostQuee
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PostQuee_Bridge {

	public function run() {
		$this->load_dependencies();
		$this->define_admin_hooks();
	}

	private function load_dependencies() {
		require_once POSTQUEE_BRIDGE_PATH . 'includes/class-postquee-admin.php';
	}

	private function define_admin_hooks() {
		$plugin_admin = new PostQuee_Admin( 'postquee-connector', POSTQUEE_BRIDGE_VERSION );
		add_action( 'admin_menu', array( $plugin_admin, 'add_plugin_admin_menu' ) );
		// Removed settings registration as requested
		add_action( 'admin_enqueue_scripts', array( $plugin_admin, 'enqueue_styles' ) );
		add_action( 'admin_enqueue_scripts', array( $plugin_admin, 'enqueue_scripts' ) );
		
		// Hooks for "Send to PostQuee"
		add_filter( 'post_row_actions', array( $plugin_admin, 'add_post_row_action' ), 10, 2 );
		add_action( 'add_meta_boxes', array( $plugin_admin, 'add_meta_box' ) );
	}
}
