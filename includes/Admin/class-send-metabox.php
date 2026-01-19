<?php
namespace PostQuee\Connector\Admin;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Send_Metabox
 * Adds "Send to PostQuee" button to post editor
 */
class Send_Metabox
{
    /**
     * Initialize metabox.
     */
    public function init()
    {
        add_action('add_meta_boxes', array($this, 'add_metabox'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    /**
     * Add metabox to post editor.
     */
    public function add_metabox()
    {
        $post_types = array('post', 'page');

        foreach ($post_types as $post_type) {
            add_meta_box(
                'postquee_send_metabox',
                'PostQuee Connector',
                array($this, 'render_metabox'),
                $post_type,
                'side',
                'high'
            );
        }
    }

    /**
     * Render metabox content.
     */
    public function render_metabox($post)
    {
        ?>
        <div class="postquee-send-metabox">
            <p class="description" style="margin-bottom: 12px;">
                Send this post to PostQuee to schedule it on your social media channels.
            </p>

            <button
                type="button"
                id="postquee-send-button"
                class="button button-primary button-large"
                style="width: 100%; height: 40px; font-size: 14px;"
            >
                <span class="dashicons dashicons-share" style="margin-top: 4px;"></span>
                Send to PostQuee
            </button>

            <p class="description" style="margin-top: 12px; font-size: 12px; color: #666;">
                This will open the PostQuee calendar with your post content pre-filled.
            </p>
        </div>

        <script>
        (function() {
            const button = document.getElementById('postquee-send-button');
            if (!button) return;

            button.addEventListener('click', function(e) {
                e.preventDefault();

                // Get post content
                let content = '';
                let title = '';

                // Try to get content from different editors
                if (typeof tinymce !== 'undefined' && tinymce.activeEditor && !tinymce.activeEditor.isHidden()) {
                    // Classic Editor (TinyMCE)
                    content = tinymce.activeEditor.getContent();
                } else if (document.getElementById('content')) {
                    // Text mode
                    content = document.getElementById('content').value;
                }

                // Get title
                const titleField = document.getElementById('title');
                if (titleField) {
                    title = titleField.value;
                }

                // Get featured image
                let featuredImage = '';
                const featuredImageEl = document.querySelector('#postimagediv img');
                if (featuredImageEl) {
                    featuredImage = featuredImageEl.src;
                }

                // Send message to PostQuee calendar
                const calendarFrame = document.querySelector('iframe[src*="postquee"]');
                if (calendarFrame) {
                    calendarFrame.contentWindow.postMessage({
                        type: 'POSTQUEE_OPEN_CREATOR',
                        payload: {
                            title: title,
                            content: content,
                            featuredImage: featuredImage,
                            postId: <?php echo (int) $post->ID; ?>,
                            postUrl: '<?php echo esc_js(get_permalink($post->ID)); ?>',
                        }
                    }, '*');
                } else {
                    // If not in iframe context, broadcast to window
                    window.postMessage({
                        type: 'POSTQUEE_OPEN_CREATOR',
                        payload: {
                            title: title,
                            content: content,
                            featuredImage: featuredImage,
                            postId: <?php echo (int) $post->ID; ?>,
                            postUrl: '<?php echo esc_js(get_permalink($post->ID)); ?>',
                        }
                    }, '*');

                    // Also try to navigate to PostQuee calendar page if we're not already there
                    const calendarUrl = '<?php echo esc_js(admin_url('admin.php?page=postquee-calendar')); ?>';
                    if (!window.location.href.includes('page=postquee-calendar')) {
                        // Store message for retrieval after page load
                        sessionStorage.setItem('postquee_pending_message', JSON.stringify({
                            title: title,
                            content: content,
                            featuredImage: featuredImage,
                            postId: <?php echo (int) $post->ID; ?>,
                            postUrl: '<?php echo esc_js(get_permalink($post->ID)); ?>',
                        }));
                        window.location.href = calendarUrl;
                    }
                }
            });
        })();
        </script>
        <?php
    }

    /**
     * Enqueue scripts for metabox.
     */
    public function enqueue_scripts($hook)
    {
        // Only load on post edit screens
        if (!in_array($hook, array('post.php', 'post-new.php'))) {
            return;
        }

        // Add inline styles
        wp_add_inline_style('wp-admin', '
            .postquee-send-metabox .button-primary {
                background: linear-gradient(135deg, #FF6900 0%, #FF8C00 100%);
                border: none;
                text-shadow: none;
                box-shadow: 0 2px 4px rgba(255, 105, 0, 0.3);
            }
            .postquee-send-metabox .button-primary:hover {
                background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%);
                box-shadow: 0 4px 8px rgba(255, 105, 0, 0.4);
            }
            .postquee-send-metabox .button-primary .dashicons {
                margin-right: 4px;
            }
        ');
    }
}
