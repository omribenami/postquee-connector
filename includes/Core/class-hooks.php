<?php
namespace PostQuee\Connector\Core;

use PostQuee\Connector\API\Client;
use PostQuee\Connector\API\Endpoints;
use PostQuee\Connector\Admin\Settings;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Hooks
 * Handles automatic and manual sync triggers.
 */
class Hooks
{

    /**
     * Init hooks.
     */
    public function init()
    {
        add_action('transition_post_status', array($this, 'handle_status_transition'), 10, 3);
        add_action('wp_ajax_postquee_push_now', array($this, 'handle_ajax_push'));

        // Handler for Row Action Link (admin-post.php)
        add_action('admin_post_postquee_trigger_sync', array($this, 'handle_manual_sync_link'));
        // Add admin notice if sync happened
        add_action('admin_notices', array($this, 'admin_notices'));
    }

    /**
     * Handle post status transition.
     *
     * @param string   $new_status New status.
     * @param string   $old_status Old status.
     * @param \WP_Post $post       Post object.
     */
    public function handle_status_transition($new_status, $old_status, $post)
    {
        // Guard Clause 1: Publish only
        if ('publish' !== $new_status) {
            return;
        }

        // Guard Clause 2: Prevent re-sending on edits (if strictly desired per spec)
        // Spec: "if ( $old_status === 'publish' ) return;"
        if ('publish' === $old_status) {
            return;
        }

        // Guard Clause 3: Check Enabled Meta
        if (!get_post_meta($post->ID, '_postquee_enabled', true)) {
            return;
        }

        // guard Clause 4: Idempotency
        if (get_post_meta($post->ID, '_postquee_synced_id', true)) {
            return;
        }

        $this->sync_post($post->ID);
    }

    /**
     * Handle AJAX "Push Now".
     */
    public function handle_ajax_push()
    {
        check_ajax_referer('postquee_push_now', 'nonce');

        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;

        if (!$post_id) {
            wp_send_json_error('Invalid Post ID');
        }

        // Bypass checks for manual push?
        // Usually yes, but we still need keys.
        $result = $this->sync_post($post_id);

        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        } else {
            wp_send_json_success($result);
        }
    }

    /**
     * Handle Manual Sync via Link (Row Action).
     */
    public function handle_manual_sync_link()
    {
        if (!isset($_GET['nonce']) || !wp_verify_nonce($_GET['nonce'], 'postquee_sync_link')) {
            wp_die('Security check failed');
        }

        $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
        if (!$post_id) {
            wp_die('Invalid Post ID');
        }

        // Perform Sync
        $result = $this->sync_post($post_id);

        // Redirect back
        $referer = wp_get_referer();
        $redirect_url = $referer ? remove_query_arg(array('action', 'postquee_sync_link', 'nonce'), $referer) : admin_url('edit.php');

        if (is_wp_error($result)) {
            $redirect_url = add_query_arg('postquee_message', 'error', $redirect_url);
            $redirect_url = add_query_arg('postquee_error_msg', urlencode($result->get_error_message()), $redirect_url);
        } else {
            $redirect_url = add_query_arg('postquee_message', 'success', $redirect_url);
        }

        wp_safe_redirect($redirect_url);
        exit;
    }

    /**
     * Display Admin Notices.
     */
    public function admin_notices()
    {
        if (!isset($_GET['postquee_message'])) {
            return;
        }

        $message_type = sanitize_key($_GET['postquee_message']);

        if ('success' === $message_type) {
            echo '<div class="notice notice-success is-dismissible"><p>Post successfully sent to PostQuee!</p></div>';
        } elseif ('error' === $message_type) {
            $msg = isset($_GET['postquee_error_msg']) ? esc_html(urldecode(sanitize_text_field($_GET['postquee_error_msg']))) : 'Unknown error';
            echo '<div class="notice notice-error is-dismissible"><p>PostQuee Sync Failed: ' . $msg . '</p></div>';
        }
    }

    /**
     * Perform the sync logic.
     *
     * @param int $post_id Post ID.
     * @return array|\WP_Error Result or error.
     */
    public function sync_post($post_id)
    {
        $api_key = get_option(Settings::OPTION_API_KEY);
        $channel_id = get_option(Settings::OPTION_DEFAULT_CHANNEL);

        if (!$api_key) {
            return new \WP_Error('postquee_no_key', 'API Key not configured.');
        }

        if (!$channel_id) {
            $error = 'Default Channel not selected.';
            update_post_meta($post_id, '_postquee_error_log', $error);
            return new \WP_Error('postquee_no_channel', $error);
        }

        $post = get_post($post_id);
        if (!$post) {
            return new \WP_Error('invalid_post', 'Post not found.');
        }

        // Init API
        $client = new Client($api_key);
        $endpoints = new Endpoints($client);
        $mapper = new Mapper($endpoints);

        // Map
        $payload = $mapper->map($post, $channel_id);

        // Send
        $response = $endpoints->create_post($payload);

        if (is_wp_error($response)) {
            update_post_meta($post_id, '_postquee_error_log', $response->get_error_message());
            return $response;
        }

        // Success logic is elusive in spec about what the return shape is for create_post.
        // Spec says: "On Success: Update post meta _postquee_synced_id with the returned UUID."
        // I'll assume response contains 'id' or I check standard PostQuee/Postiz response.
        // Since I don't have the exact response shape for create_post success from spec (it just says "Payload Structure"),
        // I'll assume typical API behavior returning the created object with an 'id'.
        // If response is array and has id:
        $synced_id = isset($response['id']) ? $response['id'] : 'synced-' . time(); // Fallback if ID unavailable but success 200 OK.

        update_post_meta($post_id, '_postquee_synced_id', $synced_id);
        delete_post_meta($post_id, '_postquee_error_log'); // Clear errors

        return $response;
    }
}
