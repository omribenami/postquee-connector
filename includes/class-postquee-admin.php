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
		add_action('admin_init', array($this, 'redirect_legacy_pages'));

		// assets
		add_action('admin_enqueue_scripts', array($this, 'enqueue_styles'));
		add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
		add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts')); // Frontend for admin bar

		// Post handling
		add_action('add_meta_boxes', array($this, 'add_meta_box'));
		add_action('save_post', array($this, 'handle_save_post'));

		// AJAX
		add_action('wp_ajax_postquee_delete_post', array($this, 'ajax_delete_post'));
		add_action('wp_ajax_postquee_display_privacy_policy', array($this, 'display_privacy_policy'));
		add_action('wp_ajax_postquee_integration_function', array($this, 'handle_integration_function'));
		add_action('wp_ajax_postquee_ai_assist', array($this, 'handle_ai_assist'));
	}

	/**
	 * Redirect legacy page URLs to new pages
	 */
	public function redirect_legacy_pages()
	{
		// Redirect old postquee-dashboard to new postquee page
		if (isset($_GET['page']) && $_GET['page'] === 'postquee-dashboard') {
			wp_safe_redirect(admin_url('admin.php?page=postquee'));
			exit;
		}

		// Redirect old postquee-settings to new settings tab
		if (isset($_GET['page']) && $_GET['page'] === 'postquee-settings') {
			wp_safe_redirect(admin_url('admin.php?page=postquee&tab=settings'));
			exit;
		}
	}

	public function add_plugin_admin_menu()
	{
		// Main menu page
		add_menu_page(
			'PostQuee Hub',
			'PostQuee Hub',
			'manage_options',
			'postquee',
			array($this, 'display_plugin_admin_page'),
			'dashicons-share',
			25
		);

		// Add submenu items
		add_submenu_page(
			'postquee',
			'Calendar',
			'Calendar',
			'manage_options',
			'postquee',
			array($this, 'display_plugin_admin_page')
		);

		add_submenu_page(
			'postquee',
			'Settings',
			'Settings',
			'manage_options',
			'admin.php?page=postquee&tab=settings'
		);
	}

	public function register_settings()
	{
		register_setting('postquee_options', 'postquee_api_key');
	}

	public function enqueue_styles($hook)
	{
		// Only load styles on our admin page
		if ($hook === 'toplevel_page_postquee') {
			wp_enqueue_style($this->plugin_name, POSTQUEE_BRIDGE_URL . 'assets/css/postquee-bridge.css', array(), $this->version, 'all');
		}
	}

	public function enqueue_scripts($hook)
	{
		// Only load React calendar on our admin page
		if ($hook === 'toplevel_page_postquee') {
			// Use file modification time for aggressive cache busting
			$bundle_path = POSTQUEE_BRIDGE_PATH . 'assets/dist/calendar.bundle.js';
			$css_path = POSTQUEE_BRIDGE_PATH . 'assets/dist/calendar.css';
			$bundle_version = file_exists($bundle_path) ? filemtime($bundle_path) : '2.2.0';
			$css_version = file_exists($css_path) ? filemtime($css_path) : '2.2.0';

			// Enqueue React calendar CSS
			wp_enqueue_style(
				'postquee-calendar',
				POSTQUEE_BRIDGE_URL . 'assets/dist/calendar.css',
				array(),
				$css_version
			);

			// Enqueue React calendar bundle
			wp_enqueue_script(
				'postquee-calendar-js',
				POSTQUEE_BRIDGE_URL . 'assets/dist/calendar.bundle.js',
				array(), // React is bundled, no dependencies
				$bundle_version,
				true
			);

			// Prepare data for React
			$channels = $this->get_channels_cached();
			if (is_wp_error($channels)) {
				$channels = [];
			}

			$admin_vars = array(
				'ajaxurl' => admin_url('admin-ajax.php'),
				'nonce' => wp_create_nonce('postquee_ai_nonce'),
			);

			$postquee_wp_data = array(
				'restUrl' => rest_url('postquee/v1/'),
				'nonce' => wp_create_nonce('wp_rest'),
				'apiKey' => get_option('postquee_api_key'),
				'integrations' => $channels,
				'ajaxUrl' => admin_url('admin-ajax.php'),
				'user' => wp_get_current_user()->display_name,
				'aiNonce' => wp_create_nonce('postquee_ai_nonce'),
			);

			// Pass data to React via inline script 'before' to ensure availability
			$inline_script = '
				window.postqueeWP = ' . wp_json_encode($postquee_wp_data) . ';
				window.postquee_admin_vars = ' . wp_json_encode($admin_vars) . ';
			';
			wp_add_inline_script('postquee-calendar-js', $inline_script, 'before');
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
		$base_url = $this->api_url_default;

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

		// Check which tab is requested
		$tab = isset($_GET['tab']) ? $_GET['tab'] : 'calendar';

		// Check if API key is set
		$api_key = get_option('postquee_api_key');

		// Show onboarding if no API key and not on settings page
		if (empty($api_key) && $tab !== 'settings') {
			$this->render_onboarding_page();
			return;
		}

		$channels = $this->get_channels_cached();
		?>
		<div class="postquee-app-wrapper">
			<!-- Sidebar -->
			<div class="pq-sidebar" id="pq-sidebar">
				<div class="pq-sidebar-header">
					<span>Channels</span>
					<!-- Collapse Sidebar Button -->
					<button type="button" class="pq-nav-btn" id="pq-collapse-sidebar-btn" onclick="toggleSidebar()"><span
							class="dashicons dashicons-arrow-left-alt2"></span></button>
				</div>

				<!-- Add Channel removed as per request -->

				<?php if ($tab === 'settings' || $tab === 'connect'): ?>
					<a href="<?php echo esc_url(admin_url('admin.php?page=postquee')); ?>" class="pq-btn-create-post"
						id="pq-create-post-btn" style="text-decoration:none;">
						← <?php esc_html_e('Return to Calendar', 'postquee-connector'); ?>
					</a>
				<?php else: ?>
					<button type="button" class="pq-btn-create-post" id="pq-create-post-btn" onclick="openCreatePostModal()">
						+ <?php esc_html_e('Create Post', 'postquee-connector'); ?>
					</button>
				<?php endif; ?>

				<div class="pq-channel-list">
					<?php if (!empty($channels) && !is_wp_error($channels)): ?>
						<?php foreach ($channels as $ch):
							$channel_id = isset($ch['id']) ? $ch['id'] : '';
							$identifier = isset($ch['identifier']) ? $ch['identifier'] : 'unknown';
							$picture = isset($ch['picture']) && !empty($ch['picture']) ? $ch['picture'] : '';
							$name = isset($ch['name']) ? $ch['name'] : 'Unknown Channel';
							?>
							<div class="pq-channel-item" style="position: relative;">
								<?php if ($picture): ?>
									<img src="<?php echo esc_url($picture); ?>" alt="<?php echo esc_attr($name); ?>" class="pq-channel-icon"
										style="width:32px; height:32px; border-radius:50%; object-fit:cover;" />
								<?php else: ?>
									<div class="pq-channel-icon pq-channel-icon-fallback"
										data-identifier="<?php echo esc_attr($identifier); ?>"
										style="width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#555; color:#fff; font-weight:bold; font-size:14px;">
										<?php echo esc_html(strtoupper(substr($name, 0, 1))); ?>
									</div>
								<?php endif; ?>

								<!-- Platform Badge Overlay -->
								<div class="pq-platform-badge" data-identifier="<?php echo esc_attr($identifier); ?>"
									style="position:absolute; bottom:-2px; right:8px; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.2); background:#000;">
									<!-- Icon will be injected by JS or CSS based on identifier -->
								</div>

								<div class="pq-channel-name"><?php echo esc_html($name); ?></div>
								<button type="button" class="pq-channel-menu-btn"
									onclick="toggleChannelMenu(event, '<?php echo esc_js($channel_id); ?>')"
									style="margin-left:auto; background:none; border:none; cursor:pointer; color:inherit; padding:4px; display:flex; align-items:center;">
									<span class="dashicons dashicons-ellipsis"></span>
								</button>
								<!-- Dropdown menu (hidden by default) -->
								<div class="pq-channel-dropdown" id="pq-channel-dropdown-<?php echo esc_attr($channel_id); ?>"
									style="display:none;">
									<a href="<?php echo esc_url('https://app.postquee.com/launches'); ?>" target="_blank"
										class="pq-dropdown-item">
										<span class="dashicons dashicons-admin-settings"></span> Manage in PostQuee App
									</a>
									<button type="button" onclick="filterByChannel('<?php echo esc_js($channel_id); ?>')"
										class="pq-dropdown-item">
										<span class="dashicons dashicons-filter"></span> Show Only This Channel
									</button>
									<button type="button" onclick="clearChannelFilter()" class="pq-dropdown-item">
										<span class="dashicons dashicons-visibility"></span> Show All Channels
									</button>
								</div>
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

		<!-- Floating Discord Support Button -->
		<a href="https://discord.gg/B9BH9DjX" target="_blank" class="postquee-discord-button"
			title="<?php esc_attr_e('Join Discord for Support', 'postquee-connector'); ?>">
			<svg width="24" height="24" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"
					fill="currentColor" />
			</svg>
			<span><?php esc_html_e('Support', 'postquee-connector'); ?></span>
		</a>

		<style>
			.postquee-discord-button {
				position: fixed;
				bottom: 30px;
				right: 30px;
				display: flex;
				align-items: center;
				gap: 10px;
				padding: 12px 20px;
				background: #5865F2;
				/* Discord brand color */
				color: white;
				text-decoration: none;
				border-radius: 50px;
				box-shadow: 0 8px 16px rgba(88, 101, 242, 0.4);
				font-weight: 600;
				font-size: 14px;
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				z-index: 9999;
				animation: discord-float 3s ease-in-out infinite;
			}

			.postquee-discord-button:hover {
				background: #4752C4;
				transform: translateY(-3px) scale(1.05);
				box-shadow: 0 12px 24px rgba(88, 101, 242, 0.6);
			}

			.postquee-discord-button:active {
				transform: translateY(-1px) scale(1.02);
			}

			.postquee-discord-button svg {
				width: 24px;
				height: 24px;
				flex-shrink: 0;
			}

			@keyframes discord-float {

				0%,
				100% {
					transform: translateY(0px);
				}

				50% {
					transform: translateY(-8px);
				}
			}

			/* Mobile responsive */
			@media (max-width: 768px) {
				.postquee-discord-button {
					bottom: 20px;
					right: 20px;
					padding: 10px 16px;
					font-size: 13px;
				}

				.postquee-discord-button span {
					display: none;
					/* Only show icon on mobile */
				}

				.postquee-discord-button {
					width: 50px;
					height: 50px;
					padding: 0;
					justify-content: center;
					border-radius: 50%;
				}
			}

			/* Sidebar collapsed state */
			.pq-sidebar.collapsed {
				width: 60px;
			}

			.pq-sidebar.collapsed .pq-sidebar-header span,
			.pq-sidebar.collapsed .pq-btn-create-post span,
			.pq-sidebar.collapsed .pq-channel-name,
			.pq-sidebar.collapsed .pq-sidebar-footer {
				display: none;
			}

			.pq-sidebar.collapsed #pq-collapse-sidebar-btn .dashicons {
				transform: rotate(180deg);
			}

			/* Channel dropdown menu */
			.pq-channel-dropdown {
				position: absolute;
				top: 100%;
				right: 0;
				margin-top: 4px;
				background: #2a2a2a;
				border: 1px solid rgba(255, 255, 255, 0.1);
				border-radius: 8px;
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
				min-width: 160px;
				z-index: 1000;
				overflow: hidden;
			}

			.pq-dropdown-item {
				display: flex;
				align-items: center;
				gap: 8px;
				width: 100%;
				padding: 10px 14px;
				background: none;
				border: none;
				color: #e0e0e0;
				text-decoration: none;
				font-size: 13px;
				cursor: pointer;
				transition: background 0.2s;
				text-align: left;
			}

			.pq-dropdown-item:hover {
				background: rgba(255, 255, 255, 0.05);
			}

			.pq-dropdown-item .dashicons {
				font-size: 16px;
				width: 16px;
				height: 16px;
			}

			.pq-dropdown-danger {
				color: #ff6b6b;
			}

			.pq-dropdown-danger:hover {
				background: rgba(255, 107, 107, 0.1);
			}

			/* Hide dropdown in collapsed sidebar */
			.pq-sidebar.collapsed .pq-channel-menu-btn {
				display: none;
			}
		</style>

		<script>
			// Toggle sidebar collapse
			function toggleSidebar() {
				const sidebar = document.getElementById('pq-sidebar');
				if (sidebar) {
					sidebar.classList.toggle('collapsed');
				}
			}

			// Open Create Post Modal (trigger same as calendar cell click)
			function openCreatePostModal() {
				// Trigger the same logic as clicking a calendar cell
				// The calendar is rendered by React, so we need to dispatch a custom event
				const event = new CustomEvent('pq-open-create-modal', {
					detail: { date: new Date() }
				});
				window.dispatchEvent(event);
			}

			// Channel menu dropdown
			function toggleChannelMenu(event, channelId) {
				event.stopPropagation();

				// Close all other dropdowns first
				document.querySelectorAll('.pq-channel-dropdown').forEach(dropdown => {
					if (dropdown.id !== 'pq-channel-dropdown-' + channelId) {
						dropdown.style.display = 'none';
					}
				});

				// Toggle this dropdown
				const dropdown = document.getElementById('pq-channel-dropdown-' + channelId);
				if (dropdown) {
					dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
				}
			}

			// Filter calendar by channel
			function filterByChannel(channelId) {
				// Dispatch custom event to React calendar
				const event = new CustomEvent('pq-filter-channel', {
					detail: { channelId }
				});
				window.dispatchEvent(event);

				// Close dropdown
				document.querySelectorAll('.pq-channel-dropdown').forEach(dropdown => {
					dropdown.style.display = 'none';
				});
			}

			// Clear channel filter
			function clearChannelFilter() {
				// Dispatch custom event to React calendar
				const event = new CustomEvent('pq-clear-filter');
				window.dispatchEvent(event);

				// Close dropdown
				document.querySelectorAll('.pq-channel-dropdown').forEach(dropdown => {
					dropdown.style.display = 'none';
				});
			}

			// Close dropdowns when clicking outside
			document.addEventListener('click', function (event) {
				if (!event.target.closest('.pq-channel-menu-btn') && !event.target.closest('.pq-channel-dropdown')) {
					document.querySelectorAll('.pq-channel-dropdown').forEach(dropdown => {
						dropdown.style.display = 'none';
					});
				}
			});

			// Platform colors and icons mapping
			const platformColors = {
				discord: '#5865F2',
				facebook: '#1877F2',
				instagram: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
				linkedin: '#0A66C2',
				pinterest: '#BD081C',
				slack: '#4A154B',
				tiktok: '#000000',
				twitter: '#1DA1F2',
				x: '#000000',
				youtube: '#FF0000',
				threads: '#000000',
			};

			const platformIcons = {
				x: '<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>',
				facebook: '<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>',
				linkedin: '<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>',
				instagram: '<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>',
				pinterest: '<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" /></svg>',
				tiktok: '<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>',
				youtube: '<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>',
				discord: '<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.772-.6083 1.1588a18.3246 18.3246 0 00-5.4876 0C8.91 5.3787 8.6534 6.7588 8.86 8.356c-1.36.43-2.61 1.7-2.61 3.25 0 2.06 1.83 3.73 4.09 3.73 1.96 0 3.58-1.29 4.02-3.08.15.02.3.03.45.03 2.26 0 4.09-1.67 4.09-3.73 0-1.55-1.25-2.82-2.61-3.25.206-1.597.462-2.977 1.127-4.008zM9.25 10.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm5.5 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z" /></svg>',
				slack: '<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.166 0a2.528 2.528 0 0 1 2.522 2.522v6.312zM15.166 18.956a2.528 2.528 0 0 1 2.522 2.521A2.528 2.528 0 0 1 15.166 24a2.527 2.527 0 0 1-2.522-2.521v-2.522h2.522zM15.166 17.688a2.527 2.527 0 0 1-2.522-2.521 2.527 2.527 0 0 1 2.522-2.522h6.312A2.527 2.527 0 0 1 24 15.167a2.528 2.528 0 0 1-2.522 2.521h-6.312z" /></svg>',
				threads: '<svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.295a13.526 13.526 0 0 1 3.02.142l.126.02.002-1.126c0-.926-.08-1.65-.237-2.152-.18-.577-.49-1.033-.92-1.353-.495-.37-1.184-.567-2.046-.586-.75-.015-1.438.155-2.046.505-.581.336-1.016.8-1.293 1.382l-1.828-.803c.434-.965 1.138-1.74 2.095-2.303.965-.566 2.084-.85 3.33-.846 1.346.024 2.448.336 3.27.93.854.616 1.445 1.485 1.755 2.582.157.56.235 1.42.235 2.554v6.464c.002.476.091.846.264 1.096.173.25.408.375.699.375.408 0 .776-.202 1.096-.604.32-.402.569-.967.745-1.687l1.633.546c-.268 1.012-.677 1.88-1.217 2.583-.54.703-1.25 1.054-2.115 1.054-.764 0-1.414-.27-1.936-.806-.522-.537-.784-1.253-.784-2.138v-.354c-1.784 2.13-4.117 3.127-6.947 2.965zm-.191-7.5c-1.065.05-1.933.335-2.583.845-.65.51-.975 1.165-.975 1.96 0 .86.355 1.555.975 2.085.62.53 1.455.795 2.505.795 1.065 0 1.978-.275 2.74-.825.761-.55 1.293-1.335 1.595-2.355.138-.47.207-1.015.207-1.635v-.885c-1.213-.142-2.493-.242-3.83-.242l-.634-.002zm8.304 3.635c-.002 0-.004-.002-.006-.004.002.002.004.004.006.004z" /></svg>',
			};

			// Apply platform badges
			document.addEventListener('DOMContentLoaded', function () {
				document.querySelectorAll('.pq-platform-badge').forEach(badge => {
					const identifier = badge.dataset.identifier.toLowerCase();
					const color = platformColors[identifier] || '#000000';
					const icon = platformIcons[identifier] || '';

					if (icon) {
						badge.style.background = color;
						badge.innerHTML = icon;
					} else {
						badge.style.display = 'none';
					}
				});
			});
		</script>
		<?php
	}

	private function render_onboarding_page()
	{
		?>
		<div class="postquee-onboarding-wrapper">
			<div class="postquee-onboarding-container">
				<!-- Logo/Header Section -->
				<div class="pq-onboard-header">
					<svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="50" cy="50" r="45" fill="#FF6900" opacity="0.1" />
						<path d="M50 20L65 35L50 50L35 35L50 20Z" fill="#FF6900" />
						<path d="M35 50L50 65L65 50L50 35L35 50Z" fill="#FF6900" opacity="0.7" />
						<path d="M50 65L35 80L20 65L35 50L50 65Z" fill="#FF6900" opacity="0.5" />
					</svg>
					<h1><?php esc_html_e('Welcome to PostQuee!', 'postquee-connector'); ?></h1>
					<p class="pq-subtitle">
						<?php esc_html_e('Your AI-powered social media scheduling companion for WordPress', 'postquee-connector'); ?>
					</p>
				</div>

				<!-- Main Message -->
				<div class="pq-onboard-content">
					<div class="pq-info-box">
						<div class="pq-info-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="16" x2="12" y2="12"></line>
								<line x1="12" y1="8" x2="12.01" y2="8"></line>
							</svg>
						</div>
						<div class="pq-info-text">
							<h3><?php esc_html_e('API Key Required', 'postquee-connector'); ?></h3>
							<p><?php esc_html_e('To use PostQuee Calendar, you need an API key from your PostQuee account.', 'postquee-connector'); ?>
							</p>
						</div>
					</div>

					<div class="pq-steps">
						<h2><?php esc_html_e('Get Started in 3 Easy Steps:', 'postquee-connector'); ?></h2>

						<div class="pq-step">
							<div class="pq-step-number">1</div>
							<div class="pq-step-content">
								<h4><?php esc_html_e('Choose Your Plan', 'postquee-connector'); ?></h4>
								<p><?php esc_html_e('Visit PostQuee to select the perfect plan for your needs. Plans start from just $29/month with features like AI copilots, unlimited posts, and advanced analytics.', 'postquee-connector'); ?>
								</p>
								<a href="https://postquee.com/#pricing" target="_blank" class="pq-btn-primary">
									<?php esc_html_e('View Pricing & Plans', 'postquee-connector'); ?> →
								</a>
							</div>
						</div>

						<div class="pq-step">
							<div class="pq-step-number">2</div>
							<div class="pq-step-content">
								<h4><?php esc_html_e('Get Your API Key', 'postquee-connector'); ?></h4>
								<p><?php esc_html_e('After signing up, generate your API key from the PostQuee settings page.', 'postquee-connector'); ?>
								</p>
								<a href="https://app.postquee.com/settings" target="_blank" class="pq-btn-secondary">
									<?php esc_html_e('Open PostQuee Settings', 'postquee-connector'); ?> ↗
								</a>
							</div>
						</div>

						<div class="pq-step">
							<div class="pq-step-number">3</div>
							<div class="pq-step-content">
								<h4><?php esc_html_e('Enter API Key', 'postquee-connector'); ?></h4>
								<p><?php esc_html_e('Enter your API key in the plugin settings to unlock the full power of PostQuee Calendar.', 'postquee-connector'); ?>
								</p>
								<a href="<?php echo esc_url(admin_url('admin.php?page=postquee&tab=settings')); ?>"
									class="pq-btn-secondary">
									<?php esc_html_e('Go to Settings', 'postquee-connector'); ?> →
								</a>
							</div>
						</div>
					</div>

					<!-- Features Preview -->
					<div class="pq-features-preview">
						<h3><?php esc_html_e('What You Get with PostQuee:', 'postquee-connector'); ?></h3>
						<div class="pq-features-grid">
							<div class="pq-feature">
								<span class="pq-feature-icon">🤖</span>
								<strong><?php esc_html_e('AI Copilot', 'postquee-connector'); ?></strong>
								<span><?php esc_html_e('Auto-generate engaging content', 'postquee-connector'); ?></span>
							</div>
							<div class="pq-feature">
								<span class="pq-feature-icon">📅</span>
								<strong><?php esc_html_e('Smart Scheduling', 'postquee-connector'); ?></strong>
								<span><?php esc_html_e('Plan posts across all platforms', 'postquee-connector'); ?></span>
							</div>
							<div class="pq-feature">
								<span class="pq-feature-icon">📊</span>
								<strong><?php esc_html_e('Analytics', 'postquee-connector'); ?></strong>
								<span><?php esc_html_e('Track performance & insights', 'postquee-connector'); ?></span>
							</div>
							<div class="pq-feature">
								<span class="pq-feature-icon">🔗</span>
								<strong><?php esc_html_e('Multi-Platform', 'postquee-connector'); ?></strong>
								<span><?php esc_html_e('Connect all social accounts', 'postquee-connector'); ?></span>
							</div>
						</div>
					</div>
				</div>

				<!-- Footer -->
				<div class="pq-onboard-footer">
					<p>
						<?php esc_html_e('Need help?', 'postquee-connector'); ?>
						<a href="https://discord.gg/B9BH9DjX"
							target="_blank"><?php esc_html_e('Join our Discord', 'postquee-connector'); ?></a>
					</p>
				</div>
			</div>
		</div>

		<style>
			.postquee-onboarding-wrapper {
				min-height: 100vh;
				background: linear-gradient(135deg, #030304 0%, #14171E 100%);
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 40px 20px;
			}

			.postquee-onboarding-container {
				max-width: 900px;
				width: 100%;
				background: rgba(255, 255, 255, 0.03);
				border: 1px solid rgba(255, 255, 255, 0.1);
				border-radius: 16px;
				padding: 60px;
				box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
			}

			.pq-onboard-header {
				text-align: center;
				margin-bottom: 50px;
			}

			.pq-onboard-header svg {
				margin-bottom: 20px;
			}

			.pq-onboard-header h1 {
				font-size: 42px;
				font-weight: 700;
				color: #F9FAFB;
				margin: 0 0 15px 0;
				line-height: 1.2;
			}

			.pq-subtitle {
				font-size: 18px;
				color: #9CA3AF;
				margin: 0;
			}

			.pq-onboard-content {
				margin-bottom: 40px;
			}

			.pq-info-box {
				display: flex;
				gap: 20px;
				padding: 24px;
				background: rgba(255, 105, 0, 0.1);
				border: 1px solid rgba(255, 105, 0, 0.3);
				border-radius: 12px;
				margin-bottom: 50px;
			}

			.pq-info-icon {
				flex-shrink: 0;
				width: 48px;
				height: 48px;
				background: rgba(255, 105, 0, 0.2);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #FF6900;
			}

			.pq-info-text h3 {
				margin: 0 0 8px 0;
				color: #FF6900;
				font-size: 18px;
				font-weight: 600;
			}

			.pq-info-text p {
				margin: 0;
				color: #F9FAFB;
				font-size: 15px;
				line-height: 1.6;
			}

			.pq-steps h2 {
				font-size: 24px;
				color: #F9FAFB;
				margin: 0 0 30px 0;
				font-weight: 600;
			}

			.pq-step {
				display: flex;
				gap: 24px;
				margin-bottom: 35px;
				padding-bottom: 35px;
				border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			}

			.pq-step:last-child {
				border-bottom: none;
				margin-bottom: 50px;
			}

			.pq-step-number {
				flex-shrink: 0;
				width: 50px;
				height: 50px;
				background: linear-gradient(135deg, #FF6900, #FF8533);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: white;
				font-size: 24px;
				font-weight: 700;
				box-shadow: 0 4px 12px rgba(255, 105, 0, 0.4);
			}

			.pq-step-content {
				flex: 1;
			}

			.pq-step-content h4 {
				margin: 0 0 10px 0;
				color: #F9FAFB;
				font-size: 20px;
				font-weight: 600;
			}

			.pq-step-content p {
				margin: 0 0 15px 0;
				color: #9CA3AF;
				font-size: 15px;
				line-height: 1.6;
			}

			.pq-btn-primary,
			.pq-btn-secondary {
				display: inline-block;
				padding: 12px 24px;
				border-radius: 8px;
				font-weight: 600;
				font-size: 15px;
				text-decoration: none;
				transition: all 0.3s;
				border: none;
				cursor: pointer;
			}

			.pq-btn-primary {
				background: linear-gradient(135deg, #FF6900, #FF8533);
				color: white;
				box-shadow: 0 4px 12px rgba(255, 105, 0, 0.3);
			}

			.pq-btn-primary:hover {
				transform: translateY(-2px);
				box-shadow: 0 8px 20px rgba(255, 105, 0, 0.4);
			}

			.pq-btn-secondary {
				background: rgba(255, 255, 255, 0.05);
				color: #F9FAFB;
				border: 1px solid rgba(255, 255, 255, 0.15);
			}

			.pq-btn-secondary:hover {
				background: rgba(255, 255, 255, 0.1);
				border-color: rgba(255, 255, 255, 0.3);
			}

			.pq-features-preview {
				background: rgba(255, 255, 255, 0.02);
				border: 1px solid rgba(255, 255, 255, 0.08);
				border-radius: 12px;
				padding: 30px;
			}

			.pq-features-preview h3 {
				margin: 0 0 25px 0;
				color: #F9FAFB;
				font-size: 20px;
				font-weight: 600;
			}

			.pq-features-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
				gap: 20px;
			}

			.pq-feature {
				display: flex;
				flex-direction: column;
				gap: 8px;
				padding: 20px;
				background: rgba(255, 255, 255, 0.03);
				border-radius: 8px;
				border: 1px solid rgba(255, 255, 255, 0.05);
			}

			.pq-feature-icon {
				font-size: 32px;
				margin-bottom: 5px;
			}

			.pq-feature strong {
				color: #F9FAFB;
				font-size: 15px;
			}

			.pq-feature span {
				color: #9CA3AF;
				font-size: 13px;
				line-height: 1.5;
			}

			.pq-onboard-footer {
				text-align: center;
				padding-top: 30px;
				border-top: 1px solid rgba(255, 255, 255, 0.1);
			}

			.pq-onboard-footer p {
				margin: 0;
				color: #9CA3AF;
				font-size: 14px;
			}

			.pq-onboard-footer a {
				color: #FF6900;
				text-decoration: none;
				font-weight: 500;
			}

			.pq-onboard-footer a:hover {
				text-decoration: underline;
			}

			/* Mobile responsive */
			@media (max-width: 768px) {
				.postquee-onboarding-container {
					padding: 40px 30px;
				}

				.pq-onboard-header h1 {
					font-size: 32px;
				}

				.pq-subtitle {
					font-size: 16px;
				}

				.pq-step {
					flex-direction: column;
					gap: 15px;
				}

				.pq-features-grid {
					grid-template-columns: 1fr;
				}
			}
		</style>
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
							<p class="description" style="color:var(--color-gray); margin-top:5px;">
								<?php esc_html_e('Get your API key from', 'postquee-connector'); ?>
								<a href="https://app.postquee.com/settings" target="_blank"
									style="color:var(--new-btn-primary); text-decoration:none;">
									<?php esc_html_e('PostQuee Settings', 'postquee-connector'); ?> ↗
								</a>
							</p>
						</td>
					</tr>
				</table>

				<div
					style="margin-top:30px; padding:20px; background:rgba(255,105,0,0.05); border:1px solid rgba(255,105,0,0.2); border-radius:8px;">
					<h3 style="margin:0 0 10px 0; color:var(--new-textColor); font-size:16px;">
						<?php esc_html_e('Need the Full PostQuee App?', 'postquee-connector'); ?>
					</h3>
					<p style="margin:0 0 15px 0; color:var(--color-gray); font-size:14px;">
						<?php esc_html_e('Access all advanced features, analytics, and team collaboration tools.', 'postquee-connector'); ?>
					</p>
					<a href="https://app.postquee.com" target="_blank"
						style="display:inline-block; padding:10px 20px; background:var(--new-btn-primary); color:white; text-decoration:none; border-radius:6px; font-weight:500; transition:all 0.2s;">
						<?php esc_html_e('Open Full App', 'postquee-connector'); ?> →
					</a>
				</div>
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

	/**
	 * Handle AJAX Integration Function
	 */
	public function handle_integration_function()
	{
		check_ajax_referer('postquee_ai_nonce', 'nonce');

		$integration_id = isset($_POST['id']) ? sanitize_text_field($_POST['id']) : '';
		$function_name = isset($_POST['function']) ? sanitize_text_field($_POST['function']) : '';
		$data = isset($_POST['data']) ? json_decode(stripslashes($_POST['data']), true) : [];

		if (!$integration_id || !$function_name) {
			wp_send_json_error('Missing parameters');
		}

		// Use the internal request helper which already handles authentication and base URL
		$payload = array(
			'id' => $integration_id,
			'name' => $function_name,
			'data' => $data
		);

		$response = $this->request('/integration/function', 'POST', $payload);

		if (is_wp_error($response)) {
			wp_send_json_error($response->get_error_message());
		}

		wp_send_json_success($response);
	}

	/**
	 * Handle AJAX AI Assist
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

