<?php
namespace PostQuee\Connector\Rest;

use PostQuee\Connector\API\Client;
use PostQuee\Connector\API\Endpoints;
use PostQuee\Connector\Admin\Settings;
use PostQuee\Connector\Core\Mapper;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Controller
 * Rest API endpoints for the Block Editor.
 */
class Controller
{

    /**
     * Init hooks.
     */
    public function init()
    {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    /**
     * Register routes.
     */
    public function register_routes()
    {
        $namespace = 'postquee/v1';

        // Get Status & Integrations (legacy - for block editor)
        register_rest_route($namespace, '/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_status'),
            'permission_callback' => array($this, 'check_permission'),
            'args' => array(
                'post_id' => array(
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return is_numeric($param);
                    }
                ),
            ),
        ));

        // Trigger Sync (legacy - for block editor)
        register_rest_route($namespace, '/sync', array(
            'methods' => 'POST',
            'callback' => array($this, 'trigger_sync'),
            'permission_callback' => array($this, 'check_permission'),
            'args' => array(
                'post_id' => array(
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return is_numeric($param);
                    }
                ),
            ),
        ));

        // Calendar API - Get Integrations
        register_rest_route($namespace, '/integrations', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_integrations'),
            'permission_callback' => array($this, 'check_permission'),
        ));

        // Calendar API - Get Posts
        register_rest_route($namespace, '/posts', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_posts'),
            'permission_callback' => array($this, 'check_permission'),
        ));

        // Calendar API - Create Post
        register_rest_route($namespace, '/posts', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_post'),
            'permission_callback' => array($this, 'check_permission'),
        ));

        // Calendar API - Delete Post
        register_rest_route($namespace, '/posts/(?P<id>[a-zA-Z0-9_-]+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_post'),
            'permission_callback' => array($this, 'check_permission'),
        ));

        // Calendar API - Update Post Date (for drag-and-drop)
        register_rest_route($namespace, '/posts/(?P<id>[a-zA-Z0-9_-]+)/date', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_post_date'),
            'permission_callback' => array($this, 'check_permission'),
        ));

        // Media Upload
        register_rest_route($namespace, '/upload', array(
            'methods' => 'POST',
            'callback' => array($this, 'upload_file'),
            'permission_callback' => array($this, 'check_permission'),
        ));

        // Upload from URL
        register_rest_route($namespace, '/upload-from-url', array(
            'methods' => 'POST',
            'callback' => array($this, 'upload_from_url'),
            'permission_callback' => array($this, 'check_permission'),
        ));

        // Check Connection
        register_rest_route($namespace, '/is-connected', array(
            'methods' => 'GET',
            'callback' => array($this, 'check_connection'),
            'permission_callback' => array($this, 'check_permission'),
        ));

        // AI Refine Content (Phase 6)
        register_rest_route($namespace, '/ai-refine', array(
            'methods' => 'POST',
            'callback' => array($this, 'ai_refine'),
            'permission_callback' => array($this, 'check_permission'),
            'args' => array(
                'content' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_textarea_field',
                ),
                'prompt' => array(
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
            ),
        ));

        // Call Integration Function (for dynamic provider settings like Discord channels, Pinterest boards, etc.)
        register_rest_route($namespace, '/integrations/(?P<id>[a-zA-Z0-9_-]+)/function', array(
            'methods' => 'POST',
            'callback' => array($this, 'call_integration_function'),
            'permission_callback' => array($this, 'check_permission'),
        ));
    }

    /**
     * Check permissions.
     */
    public function check_permission()
    {
        return current_user_can('edit_posts');
    }

    /**
     * Get Status Callback.
     */
    public function get_status($request)
    {
        $post_id = $request->get_param('post_id');

        // 1. Get Sync Status
        $synced_id = get_post_meta($post_id, '_postquee_synced_id', true);
        $last_error = get_post_meta($post_id, '_postquee_error_log', true);

        // 2. Get Account Info (Integrations)
        $api_key = get_option(Settings::OPTION_API_KEY);
        $integrations = array();
        $api_status = 'ok';

        if ($api_key) {
            $client = new Client($api_key);
            $endpoints = new Endpoints($client);
            $result = $endpoints->get_integrations();

            if (is_wp_error($result)) {
                $api_status = 'error';
                $error_msg = $result->get_error_message(); // Optional: pass to front
            } else {
                $integrations = $result;
            }
        } else {
            $api_status = 'no_key';
        }

        return rest_ensure_response(array(
            'synced' => !empty($synced_id),
            'synced_id' => $synced_id,
            'last_error' => $last_error,
            'api_status' => $api_status,
            'api_error' => $error_msg, // Pass error to front
            'integrations' => $integrations,
            'current_channel' => get_option(Settings::OPTION_DEFAULT_CHANNEL),
        ));
    }

    /**
     * Trigger Sync Callback.
     */
    public function trigger_sync($request)
    {
        $post_id = $request->get_param('post_id');
        $post = get_post($post_id);

        if (!$post) {
            return new \WP_Error('invalid_post', 'Post not found', array('status' => 404));
        }

        // Re-use logic from Hooks class or duplicate?
        // Better to instantiate the flow directly to ensure response capture.

        $api_key = get_option(Settings::OPTION_API_KEY);
        $channel_id = get_option(Settings::OPTION_DEFAULT_CHANNEL);

        if (!$api_key) {
            return new \WP_Error('postquee_no_key', 'API Key missing', array('status' => 400));
        }
        if (!$channel_id) {
            return new \WP_Error('postquee_no_channel', 'Default Channel not set', array('status' => 400));
        }

        $client = new Client($api_key);
        $endpoints = new Endpoints($client);
        $mapper = new Mapper($endpoints);

        $payload = $mapper->map($post, $channel_id);
        $result = $endpoints->create_post($payload);

        if (is_wp_error($result)) {
            update_post_meta($post_id, '_postquee_error_log', $result->get_error_message());
            return $result;
        }

        $synced_id = isset($result['id']) ? $result['id'] : 'synced-' . time();
        update_post_meta($post_id, '_postquee_synced_id', $synced_id);
        delete_post_meta($post_id, '_postquee_error_log');

        // Invalidate posts cache
        update_option('postquee_posts_cache_version', time());

        return rest_ensure_response(array(
            'success' => true,
            'id' => $synced_id,
        ));
    }

    /**
     * Get integrations (channels).
     */
    public function get_integrations($request)
    {
        $api_key = get_option(Settings::OPTION_API_KEY);
        if (!$api_key) {
            return new \WP_Error('no_api_key', 'API key not configured', array('status' => 400));
        }

        $client = new Client($api_key);
        $endpoints = new Endpoints($client);
        $result = $endpoints->list_integrations();

        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response($result);
    }

    /**
     * Get posts for calendar.
     */
    public function get_posts($request)
    {
        $api_key = get_option(Settings::OPTION_API_KEY);
        if (!$api_key) {
            return new \WP_Error('no_api_key', 'API key not configured', array('status' => 400));
        }

        $start_date = $request->get_param('startDate');
        $end_date = $request->get_param('endDate');
        $customer = $request->get_param('customer');

        if (!$start_date || !$end_date) {
            return new \WP_Error('missing_params', 'startDate and endDate required', array('status' => 400));
        }

        // Check Cache
        $cache_version = get_option('postquee_posts_cache_version', '1');
        $cache_key = 'pq_posts_' . md5($cache_version . $api_key . $start_date . $end_date . ($customer ?: ''));
        $cached = get_transient($cache_key);

        if ($cached !== false) {
            return rest_ensure_response($cached);
        }

        $client = new Client($api_key);
        $endpoints = new Endpoints($client);
        $result = $endpoints->list_posts($start_date, $end_date, $customer);

        if (is_wp_error($result)) {
            return $result;
        }

        // Cache for 5 minutes
        set_transient($cache_key, $result, 5 * MINUTE_IN_SECONDS);

        return rest_ensure_response($result);
    }

    /**
     * Create a new post.
     */
    public function create_post($request)
    {
        $api_key = get_option(Settings::OPTION_API_KEY);
        if (!$api_key) {
            return new \WP_Error('no_api_key', 'API key not configured', array('status' => 400));
        }

        $payload = $request->get_json_params();
        if (empty($payload)) {
            return new \WP_Error('empty_payload', 'Post payload required', array('status' => 400));
        }

        $client = new Client($api_key);
        $endpoints = new Endpoints($client);
        $result = $endpoints->create_post($payload);

        if (is_wp_error($result)) {
            return $result;
        }

        // Invalidate posts cache
        update_option('postquee_posts_cache_version', time());

        return rest_ensure_response($result);
    }

    /**
     * Delete a post.
     */
    public function delete_post($request)
    {
        $api_key = get_option(Settings::OPTION_API_KEY);
        if (!$api_key) {
            return new \WP_Error('no_api_key', 'API key not configured', array('status' => 400));
        }

        $post_id = $request->get_param('id');
        if (!$post_id) {
            return new \WP_Error('missing_id', 'Post ID required', array('status' => 400));
        }

        $client = new Client($api_key);
        $endpoints = new Endpoints($client);
        $result = $endpoints->delete_post($post_id);

        if (is_wp_error($result)) {
            return $result;
        }

        // Invalidate posts cache
        update_option('postquee_posts_cache_version', time());

        return rest_ensure_response(array('success' => true, 'id' => $post_id));
    }

    /**
     * Update post date (for drag-and-drop rescheduling).
     */
    public function update_post_date($request)
    {
        $api_key = get_option(Settings::OPTION_API_KEY);
        if (!$api_key) {
            return new \WP_Error('no_api_key', 'API key not configured', array('status' => 400));
        }

        $post_id = $request->get_param('id');
        $new_date = $request->get_param('date');

        if (!$post_id || !$new_date) {
            return new \WP_Error('missing_params', 'Post ID and date required', array('status' => 400));
        }

        // Note: PostQuee API doesn't have a direct update endpoint
        // This would require delete + recreate or use internal API
        // For now, return error
        return new \WP_Error('not_implemented', 'Date update not available via public API', array('status' => 501));
    }

    /**
     * Upload a file.
     */
    public function upload_file($request)
    {
        $api_key = get_option(Settings::OPTION_API_KEY);
        if (!$api_key) {
            return new \WP_Error('no_api_key', 'API key not configured', array('status' => 400));
        }

        $files = $request->get_file_params();
        if (empty($files['file'])) {
            return new \WP_Error('no_file', 'No file provided', array('status' => 400));
        }

        $file = $files['file'];
        $file_path = $file['tmp_name'];
        $original_filename = $file['name']; // Preserve original filename with extension

        $client = new Client($api_key);
        $endpoints = new Endpoints($client);
        $result = $endpoints->upload_file($file_path, $original_filename);

        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response($result);
    }

    /**
     * Upload from URL.
     */
    public function upload_from_url($request)
    {
        $api_key = get_option(Settings::OPTION_API_KEY);
        if (!$api_key) {
            return new \WP_Error('no_api_key', 'API key not configured', array('status' => 400));
        }

        $payload = $request->get_json_params();
        $url = isset($payload['url']) ? $payload['url'] : '';

        if (!$url) {
            return new \WP_Error('no_url', 'URL required', array('status' => 400));
        }

        $client = new Client($api_key);
        $endpoints = new Endpoints($client);
        $result = $endpoints->upload_from_url($url);

        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response($result);
    }

    /**
     * Check connection status.
     */
    public function check_connection($request)
    {
        $api_key = get_option(Settings::OPTION_API_KEY);
        if (!$api_key) {
            return rest_ensure_response(array('connected' => false, 'error' => 'No API key'));
        }

        $client = new Client($api_key);
        $endpoints = new Endpoints($client);
        $result = $endpoints->is_connected();

        if (is_wp_error($result)) {
            return rest_ensure_response(array('connected' => false, 'error' => $result->get_error_message()));
        }

        return rest_ensure_response($result);
    }

    /**
     * AI Refine Content.
     * Proxies to PostQuee's OpenAI-powered content refinement API.
     */
    public function ai_refine($request)
    {
        $content = $request->get_param('content');
        $prompt = $request->get_param('prompt');

        if (empty($content)) {
            return new \WP_Error('missing_params', 'Content is required', array('status' => 400));
        }

        $api_key = get_option(Settings::OPTION_API_KEY);
        if (!$api_key) {
            return new \WP_Error('no_api_key', 'API key not configured', array('status' => 400));
        }

        $client = new Client($api_key);
        $endpoints = new Endpoints($client);

        // Call the real API (which maps to /generate)
        $result = $endpoints->refine_content($content, $prompt);

        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response($result);
    }

    /**
     * Call Integration Function.
     * Calls @Tool decorated methods on provider backends (e.g., channels, boards, subreddits).
     */
    public function call_integration_function($request)
    {
        $api_key = get_option(Settings::OPTION_API_KEY);
        if (!$api_key) {
            return new \WP_Error('no_api_key', 'API key not configured', array('status' => 400));
        }

        $integration_id = $request->get_param('id');
        $payload = $request->get_json_params();

        if (empty($payload['name'])) {
            return new \WP_Error('missing_function_name', 'Function name required', array('status' => 400));
        }

        $function_name = sanitize_text_field($payload['name']);
        $params = isset($payload['params']) ? $payload['params'] : array();

        $client = new Client($api_key);
        $endpoints = new Endpoints($client);

        $result = $endpoints->call_integration_function($integration_id, $function_name, $params);

        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response($result);
    }
}
