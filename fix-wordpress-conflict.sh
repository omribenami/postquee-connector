#!/bin/bash

# PostQuee Plugin Conflict Resolver
# Fixes the dual-plugin issue and cleans WordPress completely

echo "================================================"
echo "PostQuee Plugin Conflict Resolver"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if WordPress path is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: $0 /path/to/wordpress${NC}"
    echo ""
    echo "Example:"
    echo "  $0 /opt/postiz"
    echo ""
    exit 1
fi

WP_PATH="$1"
PLUGIN_NAME="postquee-connector"
PLUGIN_PATH="$WP_PATH/wp-content/plugins/$PLUGIN_NAME"

echo "WordPress Path: $WP_PATH"
echo "Plugin Path: $PLUGIN_PATH"
echo ""

# Step 1: Stop WordPress (if using systemd/service)
echo -e "${YELLOW}Step 1: Stopping services (if any)...${NC}"
# Add service stop commands if needed
echo "  ✓ Skipped (manual stop if needed)"
echo ""

# Step 2: Backup current plugin
echo -e "${YELLOW}Step 2: Creating backup...${NC}"
if [ -d "$PLUGIN_PATH" ]; then
    BACKUP_PATH="$WP_PATH/wp-content/plugins/${PLUGIN_NAME}_backup_$(date +%Y%m%d_%H%M%S)"
    cp -r "$PLUGIN_PATH" "$BACKUP_PATH"
    echo "  ✓ Backup created: $BACKUP_PATH"
else
    echo "  ℹ No existing plugin found (clean install)"
fi
echo ""

# Step 3: Remove old plugin completely
echo -e "${YELLOW}Step 3: Removing old plugin files...${NC}"
if [ -d "$PLUGIN_PATH" ]; then
    rm -rf "$PLUGIN_PATH"
    echo "  ✓ Old plugin removed"
else
    echo "  ℹ No plugin to remove"
fi
echo ""

# Step 4: Clear WordPress caches
echo -e "${YELLOW}Step 4: Clearing WordPress caches...${NC}"

# Clear object cache if exists
if [ -f "$WP_PATH/wp-content/object-cache.php" ]; then
    rm "$WP_PATH/wp-content/object-cache.php"
    echo "  ✓ Object cache cleared"
fi

# Clear transients from database using WP-CLI if available
if command -v wp &> /dev/null; then
    cd "$WP_PATH"
    wp transient delete --all --path="$WP_PATH" 2>/dev/null && echo "  ✓ Transients cleared" || echo "  ℹ Transients: manual cleanup needed"
    wp cache flush --path="$WP_PATH" 2>/dev/null && echo "  ✓ Cache flushed" || echo "  ℹ Cache: manual flush needed"
else
    echo "  ℹ WP-CLI not found - manual cache clear recommended"
fi
echo ""

# Step 5: Clean plugin options from database
echo -e "${YELLOW}Step 5: Cleaning database entries...${NC}"
if command -v wp &> /dev/null; then
    cd "$WP_PATH"

    # Delete plugin options
    wp option delete postquee_api_key --path="$WP_PATH" 2>/dev/null
    wp option delete postquee_base_url --path="$WP_PATH" 2>/dev/null
    wp option delete postquee_default_channel --path="$WP_PATH" 2>/dev/null

    # Delete transients
    wp transient delete postquee_channels --path="$WP_PATH" 2>/dev/null

    echo "  ✓ Database entries cleaned"
else
    echo "  ℹ Manual database cleanup needed (see instructions below)"
fi
echo ""

# Step 6: Install fresh plugin
echo -e "${YELLOW}Step 6: Installing fresh plugin...${NC}"
mkdir -p "$PLUGIN_PATH"
cp -r /root/WP_PostQuee/* "$PLUGIN_PATH/"
echo "  ✓ Fresh plugin copied"
echo ""

# Step 7: Set correct permissions
echo -e "${YELLOW}Step 7: Setting permissions...${NC}"
chown -R www-data:www-data "$PLUGIN_PATH" 2>/dev/null || chown -R nginx:nginx "$PLUGIN_PATH" 2>/dev/null || echo "  ℹ Could not set ownership (may need manual adjustment)"
find "$PLUGIN_PATH" -type f -exec chmod 644 {} \;
find "$PLUGIN_PATH" -type d -exec chmod 755 {} \;
echo "  ✓ Permissions set"
echo ""

# Step 8: Verify installation
echo -e "${YELLOW}Step 8: Verifying installation...${NC}"

if [ -f "$PLUGIN_PATH/postquee-bridge.php" ]; then
    echo "  ✓ Main plugin file exists"
else
    echo -e "  ${RED}✗ Main plugin file missing!${NC}"
fi

if [ -d "$PLUGIN_PATH/assets/dist" ]; then
    echo "  ✓ React bundle directory exists"
else
    echo -e "  ${RED}✗ React bundle missing!${NC}"
fi

if [ -d "$PLUGIN_PATH/includes" ]; then
    echo "  ✓ PHP includes directory exists"
else
    echo -e "  ${RED}✗ PHP includes missing!${NC}"
fi
echo ""

echo "================================================"
echo -e "${GREEN}✓ Plugin reinstallation complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Go to WordPress Admin → Plugins"
echo "2. You should see ONLY ONE 'PostQuee Connector' plugin"
echo "3. Click 'Activate' if not already active"
echo "4. Go to PostQuee → Settings to reconfigure API key"
echo "5. Go to PostQuee → Calendar to test"
echo ""
echo "If you still see two plugins:"
echo "1. Deactivate both"
echo "2. Delete both through WordPress admin"
echo "3. Run this script again"
echo ""

# Manual cleanup instructions if WP-CLI not available
if ! command -v wp &> /dev/null; then
    echo -e "${YELLOW}Manual Database Cleanup (if needed):${NC}"
    echo ""
    echo "Run these SQL queries in phpMyAdmin or MySQL:"
    echo ""
    echo "  DELETE FROM wp_options WHERE option_name LIKE 'postquee%';"
    echo "  DELETE FROM wp_options WHERE option_name LIKE '%transient%postquee%';"
    echo ""
fi
