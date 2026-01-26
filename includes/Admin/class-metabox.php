<?php
namespace PostQuee\Connector\Admin;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Metabox
 * Handles per-post settings and status display.
 */
class Metabox
{

    /**
     * Init hooks.
     */
    public function init()
    {
        add_action('add_meta_boxes', array($this, 'add_meta_box'));
        add_action('save_post', array($this, 'save_metabox'));
    }

    /**
     * Add Meta Box.
     */
    public function add_meta_box()
    {
        add_meta_box(
            'postquee_connector_metabox',
            'PostQuee Connector',
            array($this, 'render_metabox'),
            array('post', 'page'),
            'side',
            'default'
        );
    }

    /**
     * Render the Meta Box.
     *
     * @param \WP_Post $post Post object.
     */
    public function render_metabox($post)
    {
        // Nonce field
        wp_nonce_field('postquee_save_metabox', 'postquee_metabox_nonce');

        $enabled = get_post_meta($post->ID, '_postquee_enabled', true);
        // Default to enabled if not set and global setting? (Simple logic: default checked for new posts?)
        // Spec: "Checked by default if set in global settings". I haven't implemented global 'auto-sync' setting yet, only default channel.
        // Assuming 'enabled' means "Send this specific post".

        $synced_id = get_post_meta($post->ID, '_postquee_synced_id', true);
        $error_log = get_post_meta($post->ID, '_postquee_error_log', true);

        ?>
        <p>
            <label for="postquee_conn_enabled">
                <input type="checkbox" id="postquee_conn_enabled" name="_postquee_enabled" value="1" <?php checked($enabled, '1'); ?>>
                Sync to PostQuee
            </label>
        </p>

        <hr>

        <?php if ($synced_id): ?>
            <div style="color: green; margin-bottom: 10px;">
                <strong>✅ Synced</strong><br>
                <small>ID:
                    <?php echo esc_html(substr($synced_id, 0, 8) . '...'); ?>
                </small>
            </div>
        <?php else: ?>
            <div style="color: #666; margin-bottom: 10px;">Not synced</div>
        <?php endif; ?>

        <?php if ($error_log): ?>
            <div style="color: red; margin-bottom: 10px; font-size: 11px;">
                <strong>Last Error:</strong><br>
                <?php echo esc_html(substr($error_log, 0, 100)); ?>...
            </div>
        <?php endif; ?>

        <button type="button" id="postquee-push-now" class="button button-small"
            data-post-id="<?php echo esc_attr($post->ID); ?>"
            data-nonce="<?php echo esc_attr(wp_create_nonce('postquee_push_now')); ?>">
            Push Now
        </button>
        <?php

        // Enqueue inline script for metabox button (WordPress.org compliant)
        wp_add_inline_script('jquery', "
            jQuery(document).ready(function($) {
                $('#postquee-push-now').on('click', function(e) {
                    e.preventDefault();
                    var btn = $(this);
                    btn.prop('disabled', true).text('Pushing...');

                    $.post(ajaxurl, {
                        action: 'postquee_push_now',
                        post_id: btn.data('post-id'),
                        nonce: btn.data('nonce')
                    }, function(response) {
                        if (response.success) {
                            btn.text('Success!');
                            location.reload();
                        } else {
                            btn.text('Failed').prop('disabled', false);
                            alert('Error: ' + (response.data || 'Unknown error'));
                        }
                    });
                });
            });
        ");
        ?>
    }

    /**
     * Save Meta Box data.
     *
     * @param int $post_id Post ID.
     */
    public function save_metabox($post_id)
    {
        if (!isset($_POST['postquee_metabox_nonce']) || !wp_verify_nonce($_POST['postquee_metabox_nonce'], 'postquee_save_metabox')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        if (isset($_POST['_postquee_enabled'])) {
            update_post_meta($post_id, '_postquee_enabled', '1');
        } else {
            delete_post_meta($post_id, '_postquee_enabled');
        }
    }
}
