#!/bin/bash

# PostQuee Connector - Release ZIP Creator
# Creates a clean distribution ZIP with only necessary files

VERSION="2.1.2"
PLUGIN_NAME="postquee-connector"
PLUGIN_DIR="WP_PostQuee"
OUTPUT_FILE="${PLUGIN_NAME}-${VERSION}.zip"

echo "========================================="
echo "PostQuee Connector v${VERSION}"
echo "Release ZIP Creator"
echo "========================================="
echo ""

# Navigate to parent directory
cd /root

# Remove old ZIP if exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "Removing old ZIP file..."
    rm "$OUTPUT_FILE"
fi

echo "Creating release ZIP..."
echo ""

# Create ZIP with only necessary files for WordPress plugin
zip -r "$OUTPUT_FILE" \
    "$PLUGIN_DIR/postquee-bridge.php" \
    "$PLUGIN_DIR/postquee-connector.php" \
    "$PLUGIN_DIR/readme.txt" \
    "$PLUGIN_DIR/README.md" \
    "$PLUGIN_DIR/USER_GUIDE.md" \
    "$PLUGIN_DIR/includes/" \
    "$PLUGIN_DIR/assets/dist/" \
    "$PLUGIN_DIR/assets/css/postquee-bridge.css" \
    "$PLUGIN_DIR/assets/css/postquee-admin.css" \
    "$PLUGIN_DIR/assets/js/gutenberg-sidebar.js" \
    "$PLUGIN_DIR/assets/js/postquee-admin.js" \
    "$PLUGIN_DIR/assets/js/postquee-bridge.js" \
    -x "*.git*" \
    -x "*.DS_Store" \
    -x "*.bak" \
    -x "*.log" \
    -x "*node_modules*" \
    -x "*.md~" \
    > /dev/null

echo "✅ Release ZIP created successfully!"
echo ""

# Show ZIP contents summary
echo "📦 ZIP Contents Summary:"
echo "----------------------------------------"
unzip -l "$OUTPUT_FILE" | grep -E "^Archive:|files,$" | head -2
echo ""

# Count files
FILE_COUNT=$(unzip -l "$OUTPUT_FILE" | grep -c "WP_PostQuee")
echo "Total files: $FILE_COUNT"
echo ""

# Show file size
SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
echo "📊 File size: $SIZE"
echo ""

# Show location
echo "📍 Location: /root/$OUTPUT_FILE"
echo ""
echo "========================================="
echo "✨ Ready for distribution!"
echo "========================================="
echo ""
echo "Installation instructions:"
echo "1. Download: /root/$OUTPUT_FILE"
echo "2. Go to WordPress Admin → Plugins → Add New"
echo "3. Click 'Upload Plugin'"
echo "4. Select the ZIP file"
echo "5. Click 'Install Now' then 'Activate'"
echo ""
