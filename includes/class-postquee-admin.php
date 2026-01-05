<?php

class PostQuee_Admin {

	private $plugin_name;
	private $version;
	private $app_url;

	public function __construct( $plugin_name, $version ) {
		$this->plugin_name = $plugin_name;
		$this->version     = $version;
		$this->app_url     = get_option( 'postquee_app_url', 'https://app.postquee.com' );
	}

	public function add_plugin_admin_menu() {
		// Main Page
		add_menu_page(
			'PostQuee', 
			'PostQuee', 
			'manage_options', 
			'postquee', 
			array( $this, 'display_plugin_admin_page' ), 
			'dashicons-share', 
			25
		);

		// Settings Submenu
		add_submenu_page(
			'postquee', 
			'Settings', 
			'Settings', 
			'manage_options', 
			'postquee-settings', 
			array( $this, 'display_settings_page' )
		);
	}

	public function register_settings() {
		register_setting( 'postquee_options', 'postquee_app_url', array(
			'sanitize_callback' => 'esc_url_raw',
			'default'           => 'https://app.postquee.com'
		) );
	}

	public function display_plugin_admin_page() {
		?>
		<div class="postquee-wrapper">
			<iframe src="<?php echo esc_url( $this->app_url ); ?>" id="postquee-iframe" allow="clipboard-read; clipboard-write; camera; microphone;" frameborder="0"></iframe>
		</div>
		<?php
	}

	public function display_settings_page() {
		?>
		<div class="wrap">
			<h1>PostQuee Settings</h1>
			<form method="post" action="options.php">
				<?php
				settings_fields( 'postquee_options' );
				do_settings_sections( 'postquee_options' );
				?>
				<table class="form-table">
					<tr valign="top">
						<th scope="row">App URL</th>
						<td>
							<input type="text" name="postquee_app_url" value="<?php echo esc_attr( get_option( 'postquee_app_url', 'https://app.postquee.com' ) ); ?>" class="regular-text" />
							<p class="description">The URL of your PostQuee application (e.g., https://app.postquee.com).</p>
						</td>
					</tr>
				</table>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}

	public function enqueue_scripts( $hook ) {
		$valid_hooks = array( 'toplevel_page_postquee', 'post.php', 'post-new.php', 'edit.php' ); // Hooks where we need the logic

		if ( ! in_array( $hook, $valid_hooks ) ) {
			return;
		}

		wp_enqueue_script( $this->plugin_name, POSTQUEE_BRIDGE_URL . 'assets/js/postquee-bridge.js', array( 'jquery' ), $this->version, true );

		// Localize script to pass PHP data to JS
		wp_localize_script( $this->plugin_name, 'postqueeObj', array(
			'appUrl' => $this->app_url,
			'origin' => parse_url( $this->app_url, PHP_URL_SCHEME ) . '://' . parse_url( $this->app_url, PHP_URL_HOST )
		) );
	}

	public function enqueue_styles( $hook ) {
		$valid_hooks = array( 'toplevel_page_postquee', 'post.php', 'post-new.php', 'edit.php' );

		if ( in_array( $hook, $valid_hooks ) ) {
			wp_enqueue_style( $this->plugin_name, POSTQUEE_BRIDGE_URL . 'assets/css/postquee-bridge.css', array(), $this->version, 'all' );
		}
	}

	// Add link to Post List
	public function add_post_row_action( $actions, $post ) {
		if ( 'post' !== $post->post_type ) {
			return $actions;
		}

		// We need to fetch the data to send. We'll store it in data attributes.
		$featured_image = get_the_post_thumbnail_url( $post->ID, 'full' );
		$excerpt        = get_the_excerpt( $post->ID );
		
		$data_attrs = sprintf(
			' data-id="%d" data-title="%s" data-url="%s" data-image="%s" data-excerpt="%s"',
			esc_attr( $post->ID ),
			esc_attr( get_the_title( $post->ID ) ),
			esc_attr( get_permalink( $post->ID ) ),
			esc_attr( $featured_image ),
			esc_attr( $excerpt )
		);

		$actions['send_to_postquee'] = sprintf(
			'<a href="#" class="send-to-postquee" %s>%s</a>',
			$data_attrs,
			__( 'Send to PostQuee', 'postquee-bridge' )
		);

		return $actions;
	}

	// Add Meta Box to Editor
	public function add_meta_box() {
		add_meta_box(
			'postquee_meta_box',
			'PostQuee',
			array( $this, 'render_meta_box' ),
			'post',
			'side',
			'high'
		);
	}

	public function render_meta_box( $post ) {
		$featured_image = get_the_post_thumbnail_url( $post->ID, 'full' );
		// For the editor (current state), we might want to grab values via JS from the editor fields if they are dirty, 
		// but using saved values is safer for PHP rendering.
		// However, the user wants "Send to PostQuee" which implies sending current content?
		// "The Bridge Mechanism: When clicked... send... post_title, post_url..."
		// If I use PHP values here, I'm sending the SAVED version.
		// To send the "current" edited version (especially in Gutenberg), I'd need complex JS to read the store.
		// For simplicity/v1, I'll rely on the PHP values (Saved Post) and maybe try to grab simple fields via JS if possible, 
		// but for now, let's assume sending the SAVED post state is acceptable or I'll use JS to grab standard fields.
		
		?>
		<button type="button" class="button button-primary send-to-postquee-editor"
			data-id="<?php echo esc_attr( $post->ID ); ?>"
			data-title="<?php echo esc_attr( get_the_title( $post->ID ) ); ?>"
			data-url="<?php echo esc_attr( get_permalink( $post->ID ) ); ?>"
			data-image="<?php echo esc_attr( $featured_image ); ?>"
			data-excerpt="<?php echo esc_attr( get_the_excerpt( $post->ID ) ); ?>"
		>
			Send to PostQuee
		</button>
		<p class="description">Push this post to PostQuee to schedule/publish.</p>
		<?php
	}
}
