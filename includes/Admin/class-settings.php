<?php
namespace PostQuee\Connector\Admin;

use PostQuee\Connector\API\Client;
use PostQuee\Connector\API\Endpoints;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Settings
 * Handles the plugin settings page.
 */
class Settings
{

    /**
     * Option name for API Key.
     */
    const OPTION_API_KEY = 'postquee_api_key';

    /**
     * Option name for Default Channel ID.
     */
    const OPTION_DEFAULT_CHANNEL = 'postquee_default_channel';

    /**
     * Initialize the settings.
     */
    public function init()
    {
        add_action('admin_menu', array($this, 'add_menu_page'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Register settings.
     */
    public function register_settings()
    {
        register_setting('postquee_options_group', self::OPTION_API_KEY);
        register_setting('postquee_options_group', self::OPTION_DEFAULT_CHANNEL);
    }

    /**
     * Add the menu page.
     */
    public function add_menu_page()
    {
        add_submenu_page(
            'postquee-dashboard',   // Parent slug
            'Settings',             // Page title
            'Settings',             // Menu title
            'manage_options',       // Capability
            'postquee-settings',    // Menu slug
            array($this, 'render_page')
        );
    }

    /**
     * Render the settings page.
     */
    public function render_page()
    {
        $api_key = get_option(self::OPTION_API_KEY);
        $integrations = array();
        $api_error = null;

        // Fetch integrations if API key is present
        if ($api_key) {
            $client = new Client($api_key);
            $endpoints = new Endpoints($client);
            $result = $endpoints->get_integrations();

            if (is_wp_error($result)) {
                $api_error = $result->get_error_message();
            } else {
                $integrations = $result;
            }
        }
        ?>
        <div class="wrap">
            <h1>PostQuee Connector Settings</h1>
            <form method="post" action="options.php">
                <?php settings_fields('postquee_options_group'); ?>
                <?php do_settings_sections('postquee_options_group'); ?>

                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">API Key</th>
                        <td>
                            <input type="password" name="<?php echo esc_attr(self::OPTION_API_KEY); ?>"
                                value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                            <p class="description">Enter your PostQuee API Key.</p>
                        </td>
                    </tr>

                    <?php if ($api_key): ?>
                        <tr valign="top">
                            <th scope="row">Default Integration (Channel)</th>
                            <td>
                                <?php if ($api_error): ?>
                                    <div class="notice notice-error inline">
                                        <p>
                                            <?php echo esc_html('Error fetching integrations: ' . $api_error); ?>
                                        </p>
                                    </div>
                                <?php elseif (empty($integrations)): ?>
                                    <p>No integrations found. Please connect channels in PostQuee.</p>
                                <?php else: ?>
                                    <select name="<?php echo esc_attr(self::OPTION_DEFAULT_CHANNEL); ?>">
                                        <option value="">-- Select Default Channel --</option>
                                        <?php $selected = get_option(self::OPTION_DEFAULT_CHANNEL); ?>
                                        <?php foreach ($integrations as $integration): ?>
                                            <?php
                                            // Handle cases where providerIdentifier might be missing
                                            $provider = !empty($integration['providerIdentifier']) ? $integration['providerIdentifier'] : 'App';
                                            $label = $integration['name'] . ' (' . $provider . ')';
                                            ?>
                                            <option value="<?php echo esc_attr($integration['id']); ?>" <?php selected($selected, $integration['id']); ?>>
                                                <?php echo esc_html($label); ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                    <p class="description">Select the channel where posts will be published by default.</p>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endif; ?>
                </table>

                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}
