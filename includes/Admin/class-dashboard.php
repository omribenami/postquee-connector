<?php
namespace PostQuee\Connector\Admin;

use PostQuee\Connector\API\Client;
use PostQuee\Connector\API\Endpoints;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Dashboard
 * Handles the main PostQuee dashboard page with enhanced UI and features.
 */
class Dashboard
{

    /**
     * Init.
     */
    public function init()
    {
        add_action('admin_menu', array($this, 'register_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_assets'));

        // Form Submissions
        add_action('admin_post_postquee_create_post', array($this, 'handle_post_creation'));

        // AJAX
        add_action('wp_ajax_postquee_ai_assist', array($this, 'handle_ai_assist'));
        add_action('wp_ajax_postquee_integration_function', array($this, 'handle_integration_function'));
    }

    /**
     * Enqueue Assets.
     */
    public function enqueue_assets($hook)
    {
        if ('toplevel_page_postquee-dashboard' !== $hook) {
            return;
        }

        // Version for cache busting
        $version = POSTQUEE_CONNECTOR_VERSION . '-' . time();

        // Enqueue React App styles
        wp_enqueue_style('postquee-admin-css', POSTQUEE_CONNECTOR_URL . 'assets/css/postquee-admin.css', array(), $version);
        if (file_exists(POSTQUEE_CONNECTOR_PATH . 'assets/dist/calendar.css')) {
            wp_enqueue_style('postquee-react-css', POSTQUEE_CONNECTOR_URL . 'assets/dist/calendar.css', array(), $version);
        }

        // Enqueue React App script
        // We use assets/dist/calendar.bundle.js which is built from src/calendar/index.tsx
        wp_enqueue_script('postquee-calendar-js', POSTQUEE_CONNECTOR_URL . 'assets/dist/calendar.bundle.js', array('jquery'), $version, true);

        // Localize script with WordPress REST API settings and Admin Vars
        wp_localize_script('postquee-calendar-js', 'wpApiSettings', array(
            'root' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest'),
        ));

        $admin_vars = array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('postquee_ai_nonce'),
        );

        wp_localize_script('postquee-calendar-js', 'postquee_admin_vars', $admin_vars);

        // Fallback: Manually define access to ensure it's available
        $inline_script = 'window.postquee_admin_vars = ' . json_encode($admin_vars) . ';';
        wp_add_inline_script('postquee-calendar-js', $inline_script, 'before');
    }

    /**
     * Register the top-level menu.
     */
    public function register_menu()
    {
        add_menu_page(
            'PostQuee Dashboard',
            'PostQuee',
            'manage_options',
            'postquee-dashboard',
            array($this, 'render_page'),
            'dashicons-share',
            56
        );
    }

    /**
     * Render the Dashboard page.
     */
    public function render_page()
    {
        $api_key = get_option(Settings::OPTION_API_KEY);

        if (!$api_key) {
            echo '<div class="wrap"><div class="notice notice-warning"><p>Please configure your API Key in the <a href="' . admin_url('admin.php?page=postquee-settings') . '">Settings</a> page.</p></div></div>';
            return;
        }

        $client = new Client($api_key);
        $endpoints = new Endpoints($client);
        $integrations = $endpoints->get_integrations();

        ?>
        <div class="postquee-app-container">
            <div class="postquee-app-wrapper">
                <!-- Sidebar -->
                <div class="pq-sidebar">
                    <div class="pq-sidebar-header">
                        PostQuee
                    </div>

                    <button class="pq-btn-create-post" id="postquee_react_open_create">
                        <span class="dashicons dashicons-plus"></span> Create Post
                    </button>

                    <div class="pq-channel-list">
                        <?php if (is_wp_error($integrations)): ?>
                            <div class="notice notice-error inline">
                                <p><?php echo esc_html($integrations->get_error_message()); ?></p>
                            </div>
                        <?php else: ?>
                            <?php foreach ($integrations as $integ):
                                $provider = isset($integ['providerIdentifier']) ? $integ['providerIdentifier'] : 'unknown';
                                $name = isset($integ['name']) ? $integ['name'] : ucfirst($provider);
                                $picture = isset($integ['picture']) ? $integ['picture'] : '';

                                // Map provider to icon
                                $icon_class = 'dashicons-share';
                                $prov_lower = strtolower($provider);
                                if (strpos($prov_lower, 'twitter') !== false || strpos($prov_lower, 'x') !== false)
                                    $icon_class = 'dashicons-twitter';
                                elseif (strpos($prov_lower, 'facebook') !== false)
                                    $icon_class = 'dashicons-facebook';
                                elseif (strpos($prov_lower, 'instagram') !== false)
                                    $icon_class = 'dashicons-camera';
                                elseif (strpos($prov_lower, 'linkedin') !== false)
                                    $icon_class = 'dashicons-businessman';
                                elseif (strpos($prov_lower, 'youtube') !== false)
                                    $icon_class = 'dashicons-video-alt3';
                                elseif (strpos($prov_lower, 'tiktok') !== false)
                                    $icon_class = 'dashicons-format-video';
                                elseif (strpos($prov_lower, 'pinterest') !== false)
                                    $icon_class = 'dashicons-format-image';
                                elseif (strpos($prov_lower, 'discord') !== false)
                                    $icon_class = 'dashicons-groups';
                                elseif (strpos($prov_lower, 'slack') !== false)
                                    $icon_class = 'dashicons-format-chat';
                                ?>
                                <div class="pq-channel-item">
                                    <div class="postquee-channel-avatar">
                                        <?php if ($picture): ?>
                                            <img src="<?php echo esc_url($picture); ?>" alt="<?php echo esc_attr($name); ?>">
                                        <?php else: ?>
                                            <span class="dashicons <?php echo esc_attr($icon_class); ?>"></span>
                                        <?php endif; ?>

                                        <div class="postquee-provider-icon provider-<?php echo esc_attr($prov_lower); ?>">
                                            <span class="dashicons <?php echo esc_attr($icon_class); ?>"></span>
                                        </div>
                                    </div>
                                    <span class="channel-name"><?php echo esc_html($name); ?></span>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>

                    <a href="<?php echo admin_url('admin.php?page=postquee-settings'); ?>" class="pq-btn-add-channel">
                        <span class="dashicons dashicons-plus-alt"></span> Connect Channel
                    </a>
                </div>

                <!-- React Application Root for Main Content -->
                <div class="pq-main-content">
                    <div id="postquee-calendar-root" style="height: 100%;"></div>
                </div>
            </div>

            <noscript>
                <div class="notice notice-error">
                    <p>JavaScript is required to use the PostQuee Dashboard.</p>
                </div>
            </noscript>

            <script>
                jQuery(document).ready(function ($) {
                    $('#postquee_react_open_create').on('click', function (e) {
                        e.preventDefault();
                        // Dispatch event for React to listen to
                        window.dispatchEvent(new CustomEvent('pq-open-create-modal', { detail: { date: new Date() } }));
                    });
                });
            </script>
        </div>
        <?php
    }



    /**
     * Helper to render messages.
     */
    private function render_messages()
    {
        if (isset($_GET['postquee_msg'])) {
            $msg_type = sanitize_key($_GET['postquee_msg']);
            if ('success' === $msg_type) {
                echo '<div class="notice notice-success is-dismissible" style="margin-top: 20px;"><p><strong>Success!</strong> Your post has been created.</p></div>';
            } elseif ('error' === $msg_type) {
                $err = isset($_GET['err']) ? esc_html(urldecode(sanitize_text_field($_GET['err']))) : 'Unknown error';
                echo '<div class="notice notice-error is-dismissible" style="margin-top: 20px;"><p><strong>Error:</strong> ' . $err . '</p></div>';
            }
        }
    }

    /**
     * Handle Post Creation Form logic.
     */
    public function handle_post_creation()
    {
        check_admin_referer('postquee_create_post_nonce', 'postquee_nonce');
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        $url_redirect = admin_url('admin.php?page=postquee-dashboard');

        // 1. Inputs - Sanitized
        $content = isset($_POST['content']) ? sanitize_textarea_field(wp_unslash($_POST['content'])) : '';
        $channels = isset($_POST['channels']) ? array_map('sanitize_text_field', (array) $_POST['channels']) : array();
        $post_type_sel = isset($_POST['post_type_selector']) ? sanitize_key($_POST['post_type_selector']) : 'now';
        $schedule_date = isset($_POST['schedule_date']) ? sanitize_text_field($_POST['schedule_date']) : '';

        if (empty($content)) {
            wp_safe_redirect(add_query_arg(array('postquee_msg' => 'error', 'err' => urlencode('Content is required')), $url_redirect));
            exit;
        }
        if (empty($channels)) {
            wp_safe_redirect(add_query_arg(array('postquee_msg' => 'error', 'err' => urlencode('Please select at least one channel')), $url_redirect));
            exit;
        }

        // 2. Schedule Logic
        $final_type = 'now';
        $final_date = gmdate('Y-m-d\TH:i:s.000\Z'); // Default NOW

        if ('schedule' === $post_type_sel) {
            if (empty($schedule_date)) {
                wp_safe_redirect(add_query_arg(array('postquee_msg' => 'error', 'err' => urlencode('Schedule date is required')), $url_redirect));
                exit;
            }
            $final_type = 'schedule';
            // Convert local input to UTC ISO
            $timestamp = strtotime($schedule_date);
            $final_date = gmdate('Y-m-d\TH:i:s.000\Z', $timestamp);
        }

        // 3. Init API
        $api_key = get_option(Settings::OPTION_API_KEY);
        $client = new Client($api_key);
        $endpoints = new Endpoints($client);

        // 4. Handle Image
        $uploaded_file_path = null;
        $internal_file_path = null;

        if (!empty($_FILES['postque_image']['name'])) {
            if (!function_exists('wp_handle_upload')) {
                require_once(ABSPATH . 'wp-admin/includes/file.php');
            }
            $uploadedfile = $_FILES['postque_image'];
            $upload_overrides = array('test_form' => false);
            $movefile = wp_handle_upload($uploadedfile, $upload_overrides);

            if ($movefile && !isset($movefile['error'])) {
                $res = $endpoints->upload_media($movefile['url']);
                if (is_wp_error($res)) {
                    wp_safe_redirect(add_query_arg(array('postquee_msg' => 'error', 'err' => urlencode('Image Upload Failed: ' . $res->get_error_message())), $url_redirect));
                    exit;
                }
                $internal_file_path = $res;
            } else {
                $err = isset($movefile['error']) ? $movefile['error'] : 'Upload error';
                wp_safe_redirect(add_query_arg(array('postquee_msg' => 'error', 'err' => urlencode($err)), $url_redirect));
                exit;
            }
        }

        // 5. Get integrations to determine platform types
        $integrations_result = $endpoints->get_integrations();
        $integrations = is_wp_error($integrations_result) ? array() : $integrations_result;

        // Create integration ID to platform map
        $integration_map = array();
        foreach ($integrations as $integ) {
            $integration_map[$integ['id']] = isset($integ['providerIdentifier']) ? $integ['providerIdentifier'] : 'unknown';
        }

        // 6. Construct Payload with proper image format
        // Images must be array of objects: [{id: 'x', path: 'url'}]
        $image_array = array();
        if ($internal_file_path) {
            $image_array[] = array(
                'id' => 'img-' . time(),
                'path' => $internal_file_path
            );
        }

        $posts_payload = array();
        foreach ($channels as $channel_id) {
            $platform = isset($integration_map[$channel_id]) ? $integration_map[$channel_id] : 'unknown';

            // Get platform-specific settings
            $settings = $this->get_platform_settings($platform);

            $posts_payload[] = array(
                'integration' => array('id' => $channel_id),
                'value' => array(
                    array(
                        'content' => $content,
                        'image' => $image_array,
                    )
                ),
                'settings' => $settings,
            );
        }

        $payload = array(
            'type' => $final_type,
            'date' => $final_date,
            'shortLink' => false,
            'tags' => array(),
            'posts' => $posts_payload
        );

        $result = $endpoints->create_post($payload);

        if (is_wp_error($result)) {
            wp_safe_redirect(add_query_arg(array('postquee_msg' => 'error', 'err' => urlencode($result->get_error_message())), $url_redirect));
        } else {
            wp_safe_redirect(add_query_arg(array('postquee_msg' => 'success'), $url_redirect));
        }
        exit;
    }

    /**
     * Get platform-specific settings based on PostQuee API requirements
     *
     * @param string $platform Platform identifier (x, linkedin, tiktok, etc.)
     * @return array Platform-specific settings
     */
    private function get_platform_settings($platform)
    {
        $platform = strtolower($platform);

        if (strpos($platform, 'tiktok') !== false) {
            return array(
                '__type' => 'tiktok',
                'title' => '',
                'privacy_level' => 'PUBLIC_TO_EVERYONE',
                'duet' => true,
                'stitch' => true,
                'comment' => true,
                'autoAddMusic' => 'no', // Must be 'yes' or 'no'
                'brand_content_toggle' => false,
                'brand_organic_toggle' => false,
                'video_made_with_ai' => false,
                'content_posting_method' => 'DIRECT_POST',
            );
        }

        if (strpos($platform, 'pinterest') !== false) {
            return array(
                '__type' => 'pinterest',
                'board' => 'default', // Placeholder to pass "Required" validation if user UI doesn't supply it
                'title' => '',
                'link' => '',
            );
        }

        if (strpos($platform, 'linkedin') !== false) {
            return array(
                '__type' => 'linkedin',
                'post_as_images_carousel' => false,
            );
        }

        if (strpos($platform, 'instagram') !== false) {
            return array(
                '__type' => 'instagram',
                'post_type' => 'post',
                'collaborators' => array(),
            );
        }

        if (strpos($platform, 'youtube') !== false) {
            return array(
                '__type' => 'youtube',
                'title' => 'Video from WordPress',
                'type' => 'public',
                'selfDeclaredMadeForKids' => 'no',
                'tags' => array(),
            );
        }

        // Generic fallback for simple platforms
        switch ($platform) {
            case 'x':
            case 'twitter':
                return array(
                    '__type' => 'x',
                    'who_can_reply_post' => 'everyone',
                    'community' => '',
                );

            case 'discord':
                return array('__type' => 'discord', 'channel' => '');
            case 'slack':
                return array('__type' => 'slack', 'channel' => '');
            case 'reddit':
                return array('__type' => 'reddit', 'subreddit' => array());
            case 'medium':
                return array('__type' => 'medium', 'title' => 'Post', 'tags' => array());

            default:
                return array(
                    '__type' => $platform,
                );
        }
    }

    /**
     * Handle AJAX AI Assist
     * Note: The /generate endpoint is not available in PostQuee Public API v1
     * This provides a helpful message instead
     */
    public function handle_ai_assist()
    {
        check_ajax_referer('postquee_ai_nonce', 'nonce');

        $prompt = isset($_POST['user_prompt']) ? sanitize_text_field($_POST['user_prompt']) : '';

        if (empty($prompt)) {
            wp_send_json_error('Prompt is required');
        }

        // The /generate endpoint is not available in the public API
        // Return a helpful message instead of making a failing API call
        wp_send_json_error('AI content generation is not available in the PostQuee Public API. Please use the full PostQuee app at app.postquee.com for AI features.');
    }

    /**
     * Handle AJAX Integration Function
     */
    public function handle_integration_function()
    {
        check_ajax_referer('postquee_ai_nonce', 'nonce');

        $integration_id = isset($_POST['id']) ? sanitize_text_field($_POST['id']) : '';
        $function_name = isset($_POST['function']) ? sanitize_text_field($_POST['function']) : '';
        // Decode JSON data from frontend (wp_unslash for WordPress standards)
        $data = isset($_POST['data']) ? json_decode(wp_unslash($_POST['data']), true) : [];
        if (!is_array($data)) {
            $data = [];
        }

        if (empty($integration_id) || empty($function_name)) {
            wp_send_json_error('Missing required parameters');
        }

        $api_key = get_option(Settings::OPTION_API_KEY);
        $client = new Client($api_key);
        $endpoints = new Endpoints($client);

        $result = $endpoints->call_integration_function($integration_id, $function_name, $data);

        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }

        wp_send_json_success($result);
    }
}
