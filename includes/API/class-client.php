<?php
namespace PostQuee\Connector\API;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Client
 * Enhanced HTTP client for PostQuee API with full endpoint support
 */
class Client
{
    /**
     * API Key.
     *
     * @var string
     */
    private $api_key;

    /**
     * Constructor.
     *
     * @param string $api_key The API key for authentication.
     */
    public function __construct($api_key)
    {
        $this->api_key = $api_key;
    }

    /**
     * Get the Base URL.
     *
     * @return string
     */
    private function get_base_url()
    {
        // Use app.postquee.com API
        $url = defined('POSTQUEE_API_URL') ? POSTQUEE_API_URL : 'https://app.postquee.com/api/public/v1';
        return untrailingslashit(apply_filters('postquee_api_base', $url));
    }

    /**
     * Send a request to the API.
     *
     * @param string $endpoint The endpoint path (e.g., '/integrations').
     * @param string $method   HTTP method (GET, POST, DELETE, etc.).
     * @param array  $body     Optional body data.
     * @param array  $query    Optional query parameters.
     * @return array|\WP_Error Decoded JSON response or WP_Error.
     */
    public function request($endpoint, $method = 'GET', $body = null, $query = [])
    {
        if (strpos($endpoint, 'http') === 0) {
            $url = $endpoint;
        } else {
            $url = $this->get_base_url() . $endpoint;
        }

        // Add query parameters
        if (!empty($query)) {
            $url = add_query_arg($query, $url);
        }

        $args = array(
            'method' => $method,
            'headers' => array(
                // CRITICAL: Send raw key, no Bearer prefix
                'Authorization' => $this->api_key,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ),
            'timeout' => 45,
        );

        if (!empty($body)) {
            $args['body'] = wp_json_encode($body);
        }

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $data = json_decode($response_body, true);

        if ($code < 200 || $code >= 300) {
            // Enhanced Error Reporting
            if (isset($data['message'])) {
                $msg = is_array($data['message']) || is_object($data['message'])
                    ? wp_json_encode($data['message'])
                    : $data['message'];
            } elseif (is_array($data)) {
                $msg = wp_json_encode($data);
            } elseif (is_string($response_body) && !empty($response_body)) {
                $msg = substr(strip_tags($response_body), 0, 200);
            } else {
                $msg = 'Unknown API Error';
            }

            $full_msg = sprintf('API Error [%s]: %s (Request: %s)', $code, $msg, $url);

            return new \WP_Error('postquee_api_error', $full_msg, array(
                'status' => $code,
                'code' => $code,
                'body' => $response_body,
                'url' => $url
            ));
        }

        return $data;
    }

    /**
     * Upload a file to PostQuee.
     *
     * @param string $file_path Path to the file.
     * @return array|\WP_Error Upload response.
     */
    public function upload_file($file_path)
    {
        if (!file_exists($file_path)) {
            return new \WP_Error('file_not_found', 'File does not exist: ' . $file_path);
        }

        $url = $this->get_base_url() . '/upload';
        $boundary = wp_generate_password(24);
        $file_contents = file_get_contents($file_path);
        $filename = basename($file_path);

        $body = '';
        $body .= '--' . $boundary . "\r\n";
        $body .= 'Content-Disposition: form-data; name="file"; filename="' . $filename . '"' . "\r\n";
        $body .= 'Content-Type: ' . mime_content_type($file_path) . "\r\n\r\n";
        $body .= $file_contents . "\r\n";
        $body .= '--' . $boundary . '--';

        $args = array(
            'method' => 'POST',
            'headers' => array(
                'Authorization' => $this->api_key,
                'Content-Type' => 'multipart/form-data; boundary=' . $boundary,
            ),
            'body' => $body,
            'timeout' => 60,
        );

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $data = json_decode($response_body, true);

        if ($code < 200 || $code >= 300) {
            $msg = isset($data['message']) ? $data['message'] : 'Upload failed';
            return new \WP_Error('upload_error', $msg);
        }

        return $data;
    }

    /**
     * Upload from URL.
     *
     * @param string $url URL of the file.
     * @return array|\WP_Error Upload response.
     */
    public function upload_from_url($url)
    {
        return $this->request('/upload-from-url', 'POST', ['url' => $url]);
    }
}
