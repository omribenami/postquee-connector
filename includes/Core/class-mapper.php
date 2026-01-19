<?php
namespace PostQuee\Connector\Core;

use PostQuee\Connector\API\Endpoints;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Mapper
 * Transforms WP_Post objects into PostQuee API payloads.
 */
class Mapper
{

    /**
     * API Endpoints instance.
     *
     * @var Endpoints
     */
    private $api;

    /**
     * Constructor.
     *
     * @param Endpoints $api API Endpoints instance for media uploads.
     */
    public function __construct(Endpoints $api)
    {
        $this->api = $api;
    }

    /**
     * Map a WP_Post to the API payload structure.
     *
     * @param \WP_Post $post       The WordPress post object.
     * @param string   $integration_id The target integration (channel) ID.
     * @return array The payload array.
     */
    public function map($post, $integration_id)
    {
        // 1. Prepare Content
        $content = strip_tags($post->post_content);
        $content = html_entity_decode($content);

        // Append Permalink
        $permalink = get_permalink($post->ID);
        if ($permalink) {
            $content .= "\n\nRead more: " . $permalink;
        }

        // 2. Prepare Date (ISO 8601 UTC)
        // Using helper if available, or straight WP function
        $date_iso = get_gmt_from_date($post->post_date, 'Y-m-d\TH:i:s.000\Z');

        // 3. Handle Media (Synchronous Upload)
        $files = array();
        if (has_post_thumbnail($post->ID)) {
            $image_url = get_the_post_thumbnail_url($post->ID, 'full');
            if ($image_url) {
                // Call Endpoint B
                $upload_result = $this->api->upload_media($image_url);

                if (is_wp_error($upload_result)) {
                    // Fallback: Proceed with text-only but log warning
                    error_log('PostQuee Mapper: Image upload failed for Post ID ' . $post->ID . ': ' . $upload_result->get_error_message());
                } else {
                    // Success: $upload_result is the internal path string
                    $files[] = $upload_result;
                }
            }
        }

        // 4. Construct Payload
        // Fetch integration details to determine platform settings
        $integrations = $this->api->get_integrations();
        $provider = 'unknown';

        if (!is_wp_error($integrations)) {
            foreach ($integrations as $integ) {
                if ($integ['id'] === $integration_id) {
                    $provider = isset($integ['providerIdentifier']) ? $integ['providerIdentifier'] : 'unknown';
                    break;
                }
            }
        }

        $settings = $this->get_platform_settings($provider);

        // Value must be an array of objects
        $content_block = array(
            'content' => $content,
            'image' => $files, // Mandatory array
        );

        $payload = array(
            'type' => 'now', // "now", "schedule", or "draft"
            'date' => $date_iso,
            'shortLink' => false,
            'tags' => array(),
            'posts' => array(
                array(
                    'integration' => array(
                        'id' => $integration_id,
                    ),
                    'value' => array($content_block), // Array of objects 
                    'files' => $files,
                    'settings' => $settings,
                ),
            ),
        );

        return $payload;
    }

    /**
     * Get platform-specific settings based on PostQuee API requirements
     * Copied from Dashboard to ensure Mapper consistency
     * 
     * @param string $platform Platform identifier
     * @return array
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
                'autoAddMusic' => 'no',
                'brand_content_toggle' => false,
                'brand_organic_toggle' => false,
                'video_made_with_ai' => false,
                'content_posting_method' => 'DIRECT_POST',
            );
        }

        if (strpos($platform, 'pinterest') !== false) {
            return array(
                '__type' => 'pinterest',
                'board' => 'default',
                'title' => '',
                'link' => '',
            );
        }

        // ... (Include other key platforms if needed for Mapper flow)

        return array('__type' => $platform);
    }
}
