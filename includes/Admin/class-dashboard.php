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
    }

    /**
     * Enqueue Assets.
     */
    public function enqueue_assets($hook)
    {
        if ('toplevel_page_postquee-dashboard' !== $hook) {
            return;
        }

        // Version 2.0.1 to break cache - matches plugin version
        $version = POSTQUEE_CONNECTOR_VERSION . '-' . time(); // Add timestamp to force reload
        wp_enqueue_style('postquee-admin-css', POSTQUEE_CONNECTOR_URL . 'assets/css/postquee-admin.css', array(), $version);

        wp_enqueue_script('postquee-calendar-js', POSTQUEE_CONNECTOR_URL . 'assets/js/postquee-calendar.js', array('jquery'), $version, true);

        // Localize script with WordPress REST API settings
        wp_localize_script('postquee-calendar-js', 'wpApiSettings', array(
            'root' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest'),
        ));

        // Also localize for admin vars (AI assistant + AJAX URL)
        wp_localize_script('postquee-calendar-js', 'postquee_admin_vars', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('postquee_ai_nonce'),
        ));

        // Add global ajaxurl for WordPress admin compatibility
        wp_add_inline_script(
            'postquee-calendar-js',
            'var ajaxurl = "' . admin_url('admin-ajax.php') . '";',
            'before'
        );
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
        $integrations_result = $endpoints->get_integrations();
        $integrations = is_wp_error($integrations_result) ? array() : $integrations_result;
        $error_msg = is_wp_error($integrations_result) ? $integrations_result->get_error_message() : '';

        $this->render_messages();
        ?>
        <div class="postquee-app-container">

            <div class="postquee-layout-main">
                <!-- Sidebar -->
                <div class="postquee-sidebar">
                    <div class="postquee-sidebar-header">
                        <h2>Channels</h2>
                        <button class="postquee-btn-icon"><span class="dashicons dashicons-arrow-left-alt2"></span></button>
                    </div>

                    <a href="https://app.postquee.com/settings/channels" target="_blank" class="postquee-btn-outline"
                        style="width: 100%; text-align: center; margin-bottom: 15px;">
                        <span class="dashicons dashicons-rss"></span> Add Channel
                    </a>

                    <button id="postquee_open_create" class="postquee-btn-primary"
                        style="width: 100%; justify-content: center; margin-bottom: 25px;">
                        <span class="dashicons dashicons-plus"></span> Create Post
                    </button>

                    <div class="postquee-channels-list">
                        <?php if ($error_msg): ?>
                            <p style="color: #e53e3e; font-size: 12px;"><?php echo esc_html($error_msg); ?></p>
                        <?php elseif (empty($integrations)): ?>
                            <p style="color: #718096; font-size: 12px;">No connected channels.</p>
                        <?php else: ?>
                            <?php foreach ($integrations as $integ):
                                $provider = !empty($integ['providerIdentifier']) ? $integ['providerIdentifier'] : 'App';
                                $avatar_url = isset($integ['picture']) ? $integ['picture'] : '';
                                ?>
                                <div class="postquee-channel-item">
                                    <div class="postquee-channel-avatar">
                                        <?php if ($avatar_url): ?>
                                            <img src="<?php echo esc_url($avatar_url); ?>" alt="Channel">
                                        <?php else: ?>
                                            <span class="dashicons dashicons-admin-site"></span>
                                        <?php endif; ?>

                                        <?php
                                        // Map provider to dashicon
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
                                        ?>
                                        <div class="postquee-provider-icon provider-<?php echo esc_attr($prov_lower); ?>"
                                            style="position: absolute; bottom: -4px; right: -4px; width: 16px; height: 16px; background: #1F2937; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #030304; color: white; z-index: 99; box-shadow: 0 1px 2px rgba(0,0,0,0.5);">
                                            <span class="dashicons <?php echo esc_attr($icon_class); ?>"
                                                style="font-size: 10px; width: 10px; height: 10px;"></span>
                                        </div>
                                    </div>
                                    <div class="postquee-channel-info">
                                        <span class="postquee-channel-name"><?php echo esc_html($integ['name']); ?></span>
                                    </div>
                                    <div class="postquee-channel-menu"><span class="dashicons dashicons-ellipsis"></span></div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>

                    <!-- DEBUG SECTION -->
                    <div style="margin-top: 20px; padding: 10px; background: rgba(255,0,0,0.1); border: 1px solid red; font-size: 10px; color: white; display: none;"
                        id="pq-debug-area">
                        <strong>Debug Info:</strong><br>
                        Integrations (PHP): <?php echo count($integrations); ?><br>
                        API Key: <?php echo $api_key ? 'Set' : 'Missing'; ?><br>
                        JS Loaded Posts: <span id="pq-debug-posts">...</span><br>
                        First Post Date: <span id="pq-debug-date">...</span>
                        <div id="pq-debug-raw" style="white-space: pre; overflow: hidden; height: 50px;"></div>
                    </div>
                    <script>
                        // Force show debug if 'debug' param is in URL
                        if (window.location.search.indexOf('debug') > -1) {
                            document.getElementById('pq-debug-area').style.display = 'block';
                        }
                    </script>


                    <a href="https://discord.gg/hrxAGpV5cP" target="_blank" class="postquee-discord-float">
                        <span class="dashicons dashicons-groups" style="margin-right: 8px;"></span> Discord Support
                    </a>
                </div>

                <!-- Main Calendar Area -->
                <div class="postquee-main-content">
                    <div class="postquee-calendar-header">
                        <div class="postquee-calendar-nav">
                            <button class="postquee-btn-icon"><span class="dashicons dashicons-arrow-left-alt2"></span></button>
                            <span class="postquee-date-range">01/19/2026 - 01/25/2026</span>
                            <button class="postquee-btn-icon"><span
                                    class="dashicons dashicons-arrow-right-alt2"></span></button>
                            <button class="postquee-btn-outline" style="padding: 4px 12px; margin-left: 10px;">Today</button>
                        </div>
                        <div class="postquee-calendar-views">
                            <div class="postquee-btn-group">
                                <button class="active">Day</button>
                                <button>Week</button>
                                <button>Month</button>
                            </div>
                        </div>
                    </div>

                    <div class="postquee-calendar-grid">
                        <!-- Calendar will be rendered here by JavaScript -->
                        <div
                            style="display: flex; align-items: center; justify-content: center; min-height: 500px; color: #718096;">
                            <div class="postquee-spinner" style="width: 40px; height: 40px;"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Create Post Modal -->
        <div id="postquee_create_modal" class="postquee-modal" style="display: none;">
            <div class="postquee-modal-content">
                <div class="postquee-modal-header">
                    <h2>Create Post</h2>
                    <span class="postquee-close-modal">&times;</span>
                </div>
                <div class="postquee-modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 340px; gap: 30px;">

                        <!-- Form side -->
                        <div class="postquee-card" style="border: none; background: transparent; padding: 0;">
                            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>"
                                enctype="multipart/form-data">
                                <input type="hidden" name="action" value="postquee_create_post">
                                <?php wp_nonce_field('postquee_create_post_nonce', 'postquee_nonce'); ?>

                                <div class="postquee-form-group">
                                    <div
                                        style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                        <label for="postque_content" style="margin:0;">Post Content</label>
                                        <button type="button" id="postquee_ai_btn" class="postquee-ai-btn">
                                            <span class="dashicons dashicons-superhero"></span>
                                            <span class="text">AI Assistant</span>
                                            <div class="postquee-spinner"
                                                style="border-color: #fff; border-top-color: transparent; width: 12px; height: 12px; margin-left: 5px;">
                                            </div>
                                        </button>
                                    </div>
                                    <textarea name="content" id="postque_content" class="postquee-textarea" required
                                        placeholder="Write something amazing..."></textarea>
                                </div>

                                <div class="postquee-form-group">
                                    <label>Attach Media</label>
                                    <div class="postquee-file-input-wrapper">
                                        <input type="file" name="postque_image" accept="image/*" class="postquee-input"
                                            style="padding: 10px;">
                                    </div>
                                </div>

                                <div class="postquee-form-group">
                                    <label>Select Channels</label>
                                    <?php if (empty($integrations)): ?>
                                        <p style="color: #718096; font-style: italic;">No channels available.</p>
                                    <?php else: ?>
                                        <div class="postquee-channel-grid">
                                            <?php foreach ($integrations as $integ):
                                                $avatar_url = isset($integ['picture']) ? $integ['picture'] : '';
                                                $provider = !empty($integ['providerIdentifier']) ? $integ['providerIdentifier'] : 'App';
                                                ?>
                                                <label class="postquee-channel-option">
                                                    <input type="checkbox" name="channels[]"
                                                        value="<?php echo esc_attr($integ['id']); ?>">
                                                    <div class="postquee-channel-select-card" style="height: auto; padding: 12px;">
                                                        <?php if ($avatar_url): ?>
                                                            <img src="<?php echo esc_url($avatar_url); ?>" alt="Channel">
                                                        <?php else: ?>
                                                            <span class="dashicons dashicons-share channel-icon"></span>
                                                        <?php endif; ?>

                                                        <?php
                                                        // Map provider to dashicon for modal
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
                                                        ?>
                                                        <div class="postquee-provider-icon provider-<?php echo esc_attr($prov_lower); ?>"
                                                            style="width:14px; height:14px; bottom: 0; right: 0;">
                                                            <span class="dashicons <?php echo esc_attr($icon_class); ?>"
                                                                style="font-size: 8px; width: 8px; height: 8px;"></span>
                                                        </div>
                                                        <span class="channel-name"
                                                            style="font-weight: 600; margin-bottom: 4px;"><?php echo esc_html($integ['name']); ?></span>
                                                        <span class="channel-name"
                                                            style="font-size: 11px; color: #718096; text-transform: uppercase;"><?php echo esc_html($provider); ?></span>
                                                    </div>
                                                </label>
                                            <?php endforeach; ?>
                                        </div>
                                    <?php endif; ?>
                                </div>

                                <div class="postquee-form-group">
                                    <label>Scheduling</label>
                                    <div class="postquee-schedule-box">
                                        <div class="postquee-radio-group">
                                            <label class="postquee-radio-label">
                                                <input type="radio" name="post_type_selector" value="now" checked
                                                    id="postquee_now_radio">
                                                Post Now
                                            </label>
                                            <label class="postquee-radio-label">
                                                <input type="radio" name="post_type_selector" value="schedule"
                                                    id="postquee_schedule_radio">
                                                Schedule for Later
                                            </label>
                                        </div>

                                        <div id="postquee_schedule_input" style="display: none; margin-top: 15px;">
                                            <input type="datetime-local" name="schedule_date" class="postquee-input"
                                                style="max-width: 300px;">
                                        </div>
                                    </div>
                                </div>

                                <div class="postquee-actions">
                                    <button type="submit" name="submit_post" class="postquee-btn-primary">
                                        <span class="dashicons dashicons-paperplane"></span> Publish Post
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Preview Side -->
                        <div>
                            <span class="postquee-panel-title">Post Preview</span>
                            <div class="postquee-preview-card">
                                <div class="postquee-preview-header">
                                    <div class="postquee-preview-avatar"></div>
                                    <div class="postquee-preview-meta">
                                        <span class="postquee-preview-name">Your Account</span>
                                        <span class="postquee-preview-time">Just now</span>
                                    </div>
                                </div>
                                <div class="postquee-preview-content" id="postquee_preview_content">Your post caption will
                                    appear here...</div>
                                <div class="postquee-preview-image empty" id="postquee_preview_image">
                                    No image selected
                                </div>
                            </div>
                            <p style="color: #718096; font-size: 12px; margin-top: 10px; text-align: center;">Preview is an
                                approximation.</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Helper to render messages.
     */
    private function render_messages()
    {
        if (isset($_GET['postquee_msg'])) {
            if ('success' === $_GET['postquee_msg']) {
                echo '<div class="notice notice-success is-dismissible" style="margin-top: 20px;"><p><strong>Success!</strong> Your post has been created.</p></div>';
            } elseif ('error' === $_GET['postquee_msg']) {
                $err = isset($_GET['err']) ? urldecode($_GET['err']) : 'Unknown error';
                echo '<div class="notice notice-error is-dismissible" style="margin-top: 20px;"><p><strong>Error:</strong> ' . esc_html($err) . '</p></div>';
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

        // 1. Inputs
        $content = isset($_POST['content']) ? trim($_POST['content']) : '';
        $channels = isset($_POST['channels']) ? (array) $_POST['channels'] : array();
        $post_type_sel = isset($_POST['post_type_selector']) ? $_POST['post_type_selector'] : 'now';
        $schedule_date = isset($_POST['schedule_date']) ? $_POST['schedule_date'] : '';

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
}
