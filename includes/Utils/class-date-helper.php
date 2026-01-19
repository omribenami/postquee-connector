<?php
namespace PostQuee\Connector\Utils;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class DateHelper
 * Handles date and timezone conversions.
 */
class DateHelper
{

    /**
     * Convert WP local post date to API-compatible UTC ISO string.
     *
     * @param string $post_date Local post date (Y-m-d H:i:s).
     * @return string ISO 8601 UTC string (e.g., 2026-01-18T15:30:00.000Z).
     */
    public static function to_iso_utc($post_date)
    {
        return get_gmt_from_date($post_date, 'Y-m-d\TH:i:s.000\Z');
    }
}
