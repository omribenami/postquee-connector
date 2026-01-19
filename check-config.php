<?php
require_once('../../../wp-load.php');

header('Content-Type: text/plain');

echo "WordPress Configuration Check\n";
echo "==============================\n\n";

echo "Site URL: " . get_site_url() . "\n";
echo "Home URL: " . home_url() . "\n";
echo "REST URL: " . rest_url() . "\n";
echo "REST URL (postquee-connector/v1/): " . rest_url('postquee-connector/v1/') . "\n\n";

echo "Plugin Constants:\n";
echo "POSTQUEE_BRIDGE_URL: " . (defined('POSTQUEE_BRIDGE_URL') ? POSTQUEE_BRIDGE_URL : 'NOT DEFINED') . "\n";
echo "POSTQUEE_BRIDGE_PATH: " . (defined('POSTQUEE_BRIDGE_PATH') ? POSTQUEE_BRIDGE_PATH : 'NOT DEFINED') . "\n\n";

echo "Options:\n";
echo "API Key: " . (get_option('postquee_api_key') ? 'SET (hidden)' : 'NOT SET') . "\n";
echo "Default Channel: " . get_option('postquee_default_channel') . "\n";
