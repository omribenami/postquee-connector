<?php
namespace PostQuee\Connector\API;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Endpoints
 * Wrapper for all PostQuee API endpoints based on OpenAPI spec
 */
class Endpoints
{
    /**
     * API Client instance.
     *
     * @var Client
     */
    private $client;

    /**
     * Constructor.
     *
     * @param Client $client The API client.
     */
    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    /**
     * List all integrations (channels).
     *
     * @return array|\WP_Error Array of integrations or error.
     */
    public function list_integrations()
    {
        return $this->client->request('/integrations', 'GET');
    }

    /**
     * Legacy alias for list_integrations().
     *
     * @return array|\WP_Error Array of integrations or error.
     */
    public function get_integrations()
    {
        return $this->list_integrations();
    }

    /**
     * Check if API connection is valid.
     *
     * @return array|\WP_Error Connection status.
     */
    public function is_connected()
    {
        return $this->client->request('/is-connected', 'GET');
    }

    /**
     * Find next available time slot for an integration.
     *
     * @param string $integration_id Integration ID.
     * @return array|\WP_Error Slot data with 'date' field.
     */
    public function find_slot($integration_id)
    {
        return $this->client->request('/find-slot/' . $integration_id, 'GET');
    }

    /**
     * List posts within a date range.
     *
     * @param string $start_date Start date in UTC ISO format (e.g., '2024-12-01T00:00:00.000Z').
     * @param string $end_date End date in UTC ISO format.
     * @param string|null $customer Optional customer ID filter.
     * @return array|\WP_Error Posts response with 'posts' array.
     */
    public function list_posts($start_date, $end_date, $customer = null)
    {
        $query = [
            'startDate' => $start_date,
            'endDate' => $end_date,
        ];

        if ($customer) {
            $query['customer'] = $customer;
        }

        return $this->client->request('/posts', 'GET', null, $query);
    }

    /**
     * Create a new post.
     *
     * Payload structure:
     * [
     *   'type' => 'draft|schedule|now',
     *   'date' => '2024-12-14T10:00:00.000Z',
     *   'shortLink' => false,
     *   'tags' => [],
     *   'posts' => [
     *     [
     *       'integration' => ['id' => 'integration-id'],
     *       'value' => [
     *         [
     *           'content' => 'Post content',
     *           'image' => [['id' => 'img-id', 'path' => 'https://...']],
     *         ]
     *       ],
     *       'settings' => ['__type' => 'x', ...]
     *     ]
     *   ]
     * ]
     *
     * @param array $payload Post creation payload.
     * @return array|\WP_Error Created post IDs or error.
     */
    public function create_post($payload)
    {
        return $this->client->request('/posts', 'POST', $payload);
    }

    /**
     * Delete a post by ID.
     *
     * @param string $post_id Post ID.
     * @return array|\WP_Error Deletion response.
     */
    public function delete_post($post_id)
    {
        return $this->client->request('/posts/' . $post_id, 'DELETE');
    }

    /**
     * Upload a file.
     *
     * @param string $file_path Path to file.
     * @param string|null $original_filename Original filename with extension (optional).
     * @return array|\WP_Error Upload response with 'id', 'path', 'name'.
     */
    public function upload_file($file_path, $original_filename = null)
    {
        return $this->client->upload_file($file_path, $original_filename);
    }

    /**
     * Upload from URL.
     *
     * @param string $url File URL.
     * @return array|\WP_Error Upload response.
     */
    public function upload_from_url($url)
    {
        return $this->client->upload_from_url($url);
    }

    /**
     * Legacy alias for upload_from_url().
     *
     * @param string $file_url The public URL of the file to upload.
     * @return string|\WP_Error The internal file path on success, or error.
     */
    public function upload_media($file_url)
    {
        $response = $this->upload_from_url($file_url);

        if (is_wp_error($response)) {
            return $response;
        }

        if (empty($response['path'])) {
            return new \WP_Error('postquee_upload_error', 'No file path returned from upload endpoint.', $response);
        }

        return $response['path'];
    }

    /**
     * Generate a video using AI.
     *
     * @param string $type Video type ('image-text-slides', 'veo3').
     * @param string $output Orientation ('vertical', 'horizontal').
     * @param array $custom_params Custom parameters (voice, prompt, images, etc.).
     * @return array|\WP_Error Generated video data.
     */
    public function generate_video($type, $output, $custom_params = [])
    {
        $payload = [
            'type' => $type,
            'output' => $output,
            'customParams' => $custom_params,
        ];

        return $this->client->request('/generate-video', 'POST', $payload);
    }

    /**
     * Execute video-related functions.
     *
     * @param string $function_name Function name (e.g., 'loadVoices').
     * @param string $identifier Video type identifier.
     * @param array $params Additional parameters.
     * @return array|\WP_Error Function execution result.
     */
    public function video_function($function_name, $identifier, $params = [])
    {
        $payload = [
            'functionName' => $function_name,
            'identifier' => $identifier,
            'params' => $params,
        ];

        return $this->client->request('/video/function', 'POST', $payload);
    }

    /**
     * Generate content via AI (if available).
     * Note: This endpoint may not exist in public API but kept for compatibility.
     *
     * @param string $prompt The user prompt.
     * @return array|\WP_Error Response with generated text.
     */
    public function generate_content($prompt)
    {
        return $this->client->request('/generate', 'POST', array('prompt' => $prompt));
    }

    /**
     * Refine content using PostQuee's OpenAI-powered AI.
     *
     * @param string $content The content to refine.
     * @param string $prompt The refinement style (improve, shorten, expand, casual, professional, emojis).
     * @return array|\WP_Error Response with 'refined' field containing AI-refined content.
     */
    public function refine_content($content, $prompt)
    {
        $payload = [
            'content' => $content,
            'prompt' => $prompt ?: 'improve', // Default to 'improve' if empty
        ];

        $response = $this->client->request('/ai/refine', 'POST', $payload);

        if (is_wp_error($response)) {
            return $response;
        }

        // PostQuee API returns: { "success": true, "refined": "AI-refined content here" }
        return $response;
    }

    /**
     * Call integration function (e.g., fetch channels, boards, subreddits).
     * Maps to @Tool decorated methods on provider backends.
     *
     * @param string $integration_id Integration ID.
     * @param string $function_name Function name (e.g., 'channels', 'boards').
     * @param array $params Optional parameters for the function.
     * @return array|\WP_Error Function result.
     */
    public function call_integration_function($integration_id, $function_name, $params = [])
    {
        $payload = [
            'name' => $function_name,
            'id' => $integration_id,
            'data' => $params,
        ];

        return $this->client->request('/integrations/function', 'POST', $payload);
    }
}
