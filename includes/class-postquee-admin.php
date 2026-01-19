<?php
/**
 * Admin functionality class
 *
 * @package PostQuee
 */

if (!defined('ABSPATH')) {
	exit;
}

class PostQuee_Admin
{
	private $plugin_name;
	private $version;
	private $api_url_default = 'https://app.postquee.com/api/public/v1'; // Default per instructions

	public function __construct($plugin_name, $version)
	{
		$this->plugin_name = $plugin_name;
		$this->version = $version;
	}

	/**
	 * Main entry point for registering hooks
	 */
	public function init_hooks()
	{
		// menus
		add_action('admin_menu', array($this, 'add_plugin_admin_menu'));
		add_action('admin_bar_menu', array($this, 'add_admin_bar_menu'), 999);

		// settings
		add_action('admin_init', array($this, 'register_settings'));
		add_action('admin_init', array($this, 'add_privacy_policy_content'));

		// assets
		add_action('admin_enqueue_scripts', array($this, 'enqueue_styles'));
		add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
		add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts')); // Frontend for admin bar

		// Post handling
		add_action('add_meta_boxes', array($this, 'add_meta_box'));
		add_action('save_post', array($this, 'handle_save_post'));

		// AJAX
		add_action('wp_ajax_postquee_delete_post', array($this, 'ajax_delete_post'));
		add_action('wp_ajax_postquee_send_post', array($this, 'ajax_send_post_manual'));
	}

	public function add_plugin_admin_menu()
	{
		add_menu_page(
			'PostQuee Hub',
			'PostQuee Hub',
			'manage_options',
			'postquee',
			array($this, 'display_plugin_admin_page'),
			'dashicons-share',
			25
		);
	}

	public function register_settings()
	{
		register_setting('postquee_options', 'postquee_api_key');
		register_setting('postquee_options', 'postquee_base_url', array('default' => $this->api_url_default));
	}

	public function enqueue_styles($hook)
	{
		// Enqueue on all admin pages or restrict? Keeping broad for now as per previous logic
		wp_enqueue_style($this->plugin_name, POSTQUEE_BRIDGE_URL . 'assets/css/postquee-bridge.css', array(), $this->version, 'all');
	}

	public function enqueue_scripts($hook)
	{
		// Only load React calendar on our admin page
		if ($hook === 'toplevel_page_postquee') {
			// Enqueue React calendar bundle
			wp_enqueue_script(
				'postquee-calendar',
				POSTQUEE_BRIDGE_URL . 'assets/dist/calendar.bundle.js',
				array(), // React is bundled, no dependencies
				$this->version,
				true
			);

			// Get initial data for React
			$channels = $this->get_channels_cached();
			if (is_wp_error($channels)) {
				$channels = [];
			}

			// Pass data to React via window.postqueeWP
			wp_localize_script(
				'postquee-calendar',
				'postqueeWP',
				array(
					'restUrl' => rest_url('postquee-connector/v1/'),
					'nonce' => wp_create_nonce('wp_rest'),
					'apiKey' => get_option('postquee_api_key'),
					'integrations' => $channels,
					'ajaxUrl' => admin_url('admin-ajax.php'),
					'user' => wp_get_current_user()->display_name,
				)
			);
		}

		// Legacy JS for metaboxes and other pages
		if ($hook === 'post.php' || $hook === 'post-new.php') {
			wp_enqueue_script(
				$this->plugin_name . '-metabox',
				POSTQUEE_BRIDGE_URL . 'assets/js/postquee-bridge.js',
				array('jquery'),
				$this->version,
				true
			);

			wp_localize_script(
				$this->plugin_name . '-metabox',
				'postqueeObj',
				array(
					'ajaxUrl' => admin_url('admin-ajax.php'),
					'nonce' => wp_create_nonce('postquee_nonce'),
				)
			);
		}
	}

	// --------------------------------------------------------------------------
	// API Helper
	// --------------------------------------------------------------------------
	private function request($endpoint, $method = 'GET', $body = null)
	{
		$api_key = get_option('postquee_api_key');
		$base_url = get_option('postquee_base_url', $this->api_url_default);

		// Ensure no double slashes
		$url = untrailingslashit($base_url) . $endpoint;

		$args = array(
			'method' => $method,
			'headers' => array(
				'Authorization' => $api_key,
				'Content-Type' => 'application/json',
				'Accept' => 'application/json'
			),
			'timeout' => 20
		);

		if ($body && $method !== 'GET') {
			$args['body'] = json_encode($body);
		}

		$response = wp_remote_request($url, $args);

		if (is_wp_error($response)) {
			return $response;
		}

		$code = wp_remote_retrieve_response_code($response);
		$body_content = wp_remote_retrieve_body($response);
		$data = json_decode($body_content, true);

		if ($code >= 300) {
			return new WP_Error('api_error', isset($data['message']) ? $data['message'] : 'API Error ' . $code);
		}

		return $data;
	}

	public function display_plugin_admin_page()
	{
		if (!current_user_can('manage_options')) {
			wp_die(esc_html__('Permission denied.', 'postquee-connector'));
		}

		$channels = $this->get_channels_cached();
		$tab = isset($_GET['tab']) ? $_GET['tab'] : 'calendar';
		?>
		<div class="postquee-app-wrapper">
			<!-- Sidebar -->
			<div class="pq-sidebar">
				<div class="pq-sidebar-header">
					<span>Channels</span>
					<!-- Back to WP Dashboard if needed -->
					<a href="<?php echo admin_url(); ?>" class="pq-nav-btn"><span
							class="dashicons dashicons-arrow-left-alt2"></span></a>
				</div>

				<!-- Add Channel removed as per request -->

				<a href="<?php echo esc_url(admin_url('admin.php?page=postquee')); ?>" class="pq-btn-create-post"
					id="pq-create-post-btn">
					+ <?php esc_html_e('Create Post', 'postquee-connector'); ?>
				</a>

				<div class="pq-channel-list">
					<?php if (!empty($channels) && !is_wp_error($channels)): ?>
						<?php foreach ($channels as $ch):
							$icon = substr(isset($ch['provider']) ? $ch['provider'] : 'G', 0, 1);
							?>
							<div class="pq-channel-item">
								<div class="pq-channel-icon"><?php echo esc_html(strtoupper($icon)); ?></div>
								<div class="pq-channel-name"><?php echo esc_html($ch['name']); ?></div>
								<div style="margin-left:auto;"><span class="dashicons dashicons-ellipsis"></span></div>
							</div>
						<?php endforeach; ?>
					<?php else: ?>
						<div style="padding:10px; opacity:0.6; font-size:13px;">No channels connected.</div>
					<?php endif; ?>
				</div>

				<div class="pq-sidebar-footer"
					style="margin-top:auto; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
					<div class="pq-user-card"
						style="display:flex; align-items:center; gap:12px; padding:10px; border-radius:8px; color:var(--new-textColor);">
						<div class="pq-user-avatar-wrap"
							style="width:32px; height:32px; border-radius:50%; overflow:hidden; border:1px solid #555; flex-shrink:0;">
							<img src="<?php echo esc_url(get_avatar_url(get_current_user_id(), ['size' => 64])); ?>"
								style="width:100%; height:100%; object-fit:cover; display:block;">
						</div>
						<div class="pq-user-name"
							style="font-size:14px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
							<?php echo esc_html(wp_get_current_user()->display_name); ?>
						</div>
						<a href="<?php echo esc_url(admin_url('admin.php?page=postquee&tab=settings')); ?>"
							style="margin-left:auto; color:#999; text-decoration:none;"><span
								class="dashicons dashicons-admin-generic"></span></a>
					</div>
				</div>
			</div>

			<!-- Main Content Area -->
			<div class="pq-main-content">
				<?php
				if ($tab === 'settings' || $tab === 'connect') {
					$this->render_settings_view();
				} else {
					$this->render_calendar_view();
				}
				?>
			</div>
		</div>

		<!-- Modal Overlay -->
		<div id="pq-modal-overlay" style="display:none;">
			<div id="pq-modal-content"></div>
		</div>
		<?php
	}

	private function render_calendar_view()
	{
		?>
		<!-- React Calendar Mount Point -->
		<div id="postquee-calendar-root" style="width: 100%; height: 100%;"></div>
		<?php
	}

	private function render_settings_view()
	{
		?>
		<div style="padding:40px; max-width:800px; color:var(--new-textColor);">
			<h1 style="margin-bottom:30px; border-bottom:1px solid var(--new-border); padding-bottom:20px;">Settings & Connect
			</h1>

			<form method="post" action="options.php" class="card"
				style="background:var(--new-settings); padding:30px; border:1px solid var(--new-border); border-radius:12px;">
				<?php
				settings_fields('postquee_options');
				do_settings_sections('postquee_options');
				?>
				<table class="form-table">
					<tr valign="top">
						<th scope="row" style="color:var(--new-textColor);">
							<?php esc_html_e('API Key', 'postquee-connector'); ?>
						</th>
						<td>
							<input type="password" name="postquee_api_key"
								value="<?php echo esc_attr(get_option('postquee_api_key')); ?>" class="regular-text"
								style="width:100%; background:var(--new-input-bg); color:var(--new-textColor); border:1px solid var(--new-border); padding:10px;" />
						</td>
					</tr>
					<tr valign="top">
						<th scope="row" style="color:var(--new-textColor);">
							<?php esc_html_e('Base URL', 'postquee-connector'); ?>
						</th>
						<td>
							<input type="url" name="postquee_base_url"
								value="<?php echo esc_attr(get_option('postquee_base_url', $this->api_url_default)); ?>"
								class="regular-text"
								style="width:100%; background:var(--new-input-bg); color:var(--new-textColor); border:1px solid var(--new-border); padding:10px;" />
							<p class="description" style="color:var(--color-gray); margin-top:5px;">
								<?php esc_html_e('Default: https://app.postquee.com/api/public/v1', 'postquee-connector'); ?>
							</p>
						</td>
					</tr>
				</table>
				<div style="margin-top:20px; text-align:right;">
					<?php submit_button('Save Settings', 'primary', 'submit', false, ['style' => 'background:var(--new-btn-primary); border:none; padding:10px 20px; color:white; border-radius:8px; cursor:pointer;']); ?>
				</div>
			</form>
		</div>
		<?php
	}


	// --------------------------------------------------------------------------
	// Meta Box & Post Integration
	// --------------------------------------------------------------------------
	public function add_meta_box()
	{
		add_meta_box('postquee_mb', 'PostQuee', array($this, 'render_meta_box'), 'post', 'side', 'high');
	}

	public function render_meta_box($post)
	{
		// Nonce for verification
		wp_nonce_field('postquee_save_action', 'postquee_meta_nonce');

		$channels = $this->get_channels_cached();
		?>
		<p>
			<label>
				<input type="checkbox" name="postquee_schedule" value="1" />
				<strong><?php esc_html_e('Schedule for PostQuee', 'postquee-connector'); ?></strong>
			</label>
		</p>

		<?php if (!empty($channels) && !is_wp_error($channels)): ?>
			<p><strong><?php esc_html_e('Select Channels:', 'postquee-connector'); ?></strong></p>
			<ul style="margin: 5px 0 15px 10px; max-height: 150px; overflow-y:auto;">
				<?php foreach ($channels as $ch):
					$id = $ch['id'];
					$name = $ch['name'];
					$provider = isset($ch['provider']) ? $ch['provider'] : '';
					?>
					<li>
						<label>
							<input type="checkbox" name="postquee_channels[]" value="<?php echo esc_attr($id); ?>" checked />
							<?php echo esc_html("$name ($provider)"); ?>
						</label>
					</li>
				<?php endforeach; ?>
			</ul>
		<?php else: ?>
			<p class="description"><?php esc_html_e('No channels found. Check settings or API key.', 'postquee-connector'); ?></p>
		<?php endif; ?>

		<hr>
		<p>
			<a
				href="<?php echo esc_url(admin_url('admin.php?page=postquee')); ?>"><?php esc_html_e('Configure Settings', 'postquee-connector'); ?></a>
		</p>
		<?php
	}

	public function handle_save_post($post_id)
	{
		// Checks
		if (!isset($_POST['postquee_meta_nonce']) || !wp_verify_nonce($_POST['postquee_meta_nonce'], 'postquee_save_action')) {
			return;
		}
		if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
			return;
		if (!current_user_can('edit_post', $post_id))
			return;

		// Check if "Schedule" is checked
		if (!isset($_POST['postquee_schedule'])) {
			return;
		}

		$post = get_post($post_id);
		$title = $post->post_title;
		$permalink = get_permalink($post_id);
		$selected_channels = isset($_POST['postquee_channels']) ? $_POST['postquee_channels'] : array();

		// Construct content
		$content = $title . "\n\n" . $permalink;

		// Get featured image if available
		$media = array();
		$featured_image = get_the_post_thumbnail_url($post_id, 'full');
		if ($featured_image) {
			$media[] = $featured_image;
		}

		// Build integrations array per PostQuee API spec
		$integrations = array();
		foreach ($selected_channels as $ch_id) {
			$integrations[] = array('id' => $ch_id);
		}

		// Construct payload per PostQuee API documentation
		$payload = array(
			'content' => $content,
			'media' => $media,
			'integrations' => $integrations,
			'date' => current_time('c') // ISO 8601 format
		);

		// Fire request
		$this->request('/posts', 'POST', $payload);
	}

	// --------------------------------------------------------------------------
	// Utilities / AJAX
	// --------------------------------------------------------------------------
	private function get_channels_cached()
	{
		$cached = get_transient('postquee_channels');
		if ($cached !== false) {
			return $cached;
		}

		$response = $this->request('/integrations'); // GET /integrations

		if (is_wp_error($response)) {
			return $response; // Return error to caller
		}

		// Ensure array
		$channels = isset($response['data']) ? $response['data'] : $response;

		if (is_array($channels)) {
			set_transient('postquee_channels', $channels, 1 * HOUR_IN_SECONDS);
		}

		return $channels;
	}

	public function ajax_delete_post()
	{
		check_ajax_referer('postquee_nonce', 'nonce');
		if (!current_user_can('manage_options'))
			wp_send_json_error('Permission denied');

		$id = isset($_POST['id']) ? sanitize_text_field($_POST['id']) : '';
		if (!$id)
			wp_send_json_error('Missing ID');

		$res = $this->request('/posts/' . $id, 'DELETE');

		if (is_wp_error($res)) {
			wp_send_json_error($res->get_error_message());
		}

		wp_send_json_success('Deleted');
	}

	// AJAX Handler for creating posts (both Admin Bar and Calendar Modal)
	public function ajax_send_post_manual()
	{
		check_ajax_referer('postquee_nonce', 'nonce');
		if (!current_user_can('edit_posts'))
			wp_send_json_error('Denied');

		$title = isset($_POST['title']) ? sanitize_text_field(wp_unslash($_POST['title'])) : '';
		$url = isset($_POST['url']) ? esc_url_raw(wp_unslash($_POST['url'])) : '';
		$raw_content = isset($_POST['content']) ? sanitize_textarea_field(wp_unslash($_POST['content'])) : '';

		$providers = isset($_POST['providers']) ? array_map('sanitize_text_field', $_POST['providers']) : [];

		// Build content
		if ($raw_content) {
			$content = $raw_content;
		} else {
			$content = $title;
			if ($url)
				$content .= "\n\n" . $url;
		}

		// Build integrations array
		$integrations = array();
		foreach ($providers as $provider_id) {
			$integrations[] = array('id' => $provider_id);
		}

		// Construct payload per PostQuee API documentation
		$payload = array(
			'content' => $content,
			'media' => array(),
			'integrations' => $integrations,
			'date' => current_time('c') // ISO 8601 format
		);

		$res = $this->request('/posts', 'POST', $payload);

		if (is_wp_error($res)) {
			wp_send_json_error($res->get_error_message());
		}

		wp_send_json_success(array('message' => 'Sent to Drafts'));
	}

	// Admin Bar Logic (Keeping this as requested)
	public function add_admin_bar_menu($wp_admin_bar)
	{
		if (!current_user_can('edit_posts') || !is_singular() || !isset($GLOBALS['post']))
			return;

		$post = $GLOBALS['post'];
		$title = get_the_title($post->ID);
		$permalink = get_permalink($post->ID);
		$excerpt = get_the_excerpt($post->ID);
		$featured_image = get_the_post_thumbnail_url($post->ID, 'full');

		$button_html = sprintf(
			'<span class="ab-icon dashicons-share-alt2"></span><span class="ab-label send-to-postquee-api" style="cursor:pointer;" data-title="%s" data-url="%s" data-image="%s" data-excerpt="%s">%s</span>',
			esc_attr($title),
			esc_attr($permalink),
			esc_attr($featured_image),
			esc_attr($excerpt),
			esc_html__('PostQuee', 'postquee-connector')
		);

		$wp_admin_bar->add_node(array(
			'id' => 'postquee-admin-bar',
			'title' => $button_html,
			'href' => '#',
			'meta' => array('class' => 'postquee-admin-bar-item', 'onclick' => 'return false;')
		));
	}

	public function add_privacy_policy_content()
	{
		if (function_exists('wp_add_privacy_policy_content')) {
			wp_add_privacy_policy_content(
				'PostQuee Connector',
				wp_kses_post('<p>' . __('This plugin sends post data to PostQuee/Postiz via API.', 'postquee-connector') . '</p>')
			);
		}
	}
}

