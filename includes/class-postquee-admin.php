<?php
/**
 * Admin functionality class
 *
 * @package PostQuee
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PostQuee_Admin {

	private $plugin_name;
	private $version;
	private $app_url;

	public function __construct( $plugin_name, $version ) {
		$this->plugin_name = $plugin_name;
		$this->version     = $version;
		// Hardcoded App URL as requested
		$this->app_url     = 'https://app.postquee.com';
	}

	public function add_plugin_admin_menu() {
		// Main Page only, no settings submenu
		add_menu_page(
			'PostQuee', 
			'PostQuee', 
			'manage_options', 
			'postquee', 
			array( $this, 'display_plugin_admin_page' ), 
			'dashicons-share', 
			25
		);
	}

	public function display_plugin_admin_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'postquee-bridge' ) );
		}
		?>
		<div class="postquee-wrapper">
			<iframe src="<?php echo esc_url( $this->app_url ); ?>" id="postquee-iframe" allow="clipboard-read; clipboard-write; camera; microphone;" frameborder="0"></iframe>
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
		if ( 'post' !== $post->post_type || ! current_user_can( 'edit_post', $post->ID ) ) {
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
			esc_html__( 'Send to PostQuee', 'postquee-bridge' )
		);

		return $actions;
	}

	// Add Meta Box to Editor
	public function add_meta_box() {
		$post_type = 'post';
		if ( ! current_user_can( 'edit_posts' ) ) {
			return;
		}

		add_meta_box(
			'postquee_meta_box',
			'PostQuee',
			array( $this, 'render_meta_box' ),
			$post_type,
			'side',
			'high'
		);
	}

	public function render_meta_box( $post ) {
		if ( ! current_user_can( 'edit_post', $post->ID ) ) {
			return;
		}

		$featured_image = get_the_post_thumbnail_url( $post->ID, 'full' );
		?>
		<button type="button" class="button button-primary send-to-postquee-editor"
			data-id="<?php echo esc_attr( $post->ID ); ?>"
			data-title="<?php echo esc_attr( get_the_title( $post->ID ) ); ?>"
			data-url="<?php echo esc_attr( get_permalink( $post->ID ) ); ?>"
			data-image="<?php echo esc_attr( $featured_image ); ?>"
			data-excerpt="<?php echo esc_attr( get_the_excerpt( $post->ID ) ); ?>"
		>
			<?php esc_html_e( 'Send to PostQuee', 'postquee-bridge' ); ?>
		</button>
		<p class="description"><?php esc_html_e( 'Push this post to PostQuee to schedule or publish.', 'postquee-bridge' ); ?></p>
		<?php
	}
}
