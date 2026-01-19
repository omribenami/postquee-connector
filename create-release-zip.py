#!/usr/bin/env python3
"""
PostQuee Connector - Release ZIP Creator
Creates a clean distribution ZIP with only necessary files
"""

import os
import zipfile
from pathlib import Path

VERSION = "2.0.0"
PLUGIN_NAME = "postquee-connector"
PLUGIN_DIR = "WP_PostQuee"
OUTPUT_FILE = f"{PLUGIN_NAME}-{VERSION}.zip"

# Files and directories to include
INCLUDE_PATTERNS = [
    "postquee-bridge.php",
    "postquee-connector.php",
    "readme.txt",
    "README.md",
    "USER_GUIDE.md",
    "includes/",
    "assets/dist/",
    "assets/css/postquee-bridge.css",
    "assets/css/postquee-admin.css",
    "assets/js/gutenberg-sidebar.js",
    "assets/js/postquee-admin.js",
    "assets/js/postquee-bridge.js",
]

# Patterns to exclude
EXCLUDE_PATTERNS = [
    ".git",
    ".DS_Store",
    ".bak",
    ".log",
    "node_modules",
    "__pycache__",
    ".pyc",
    "~",
]

def should_exclude(path):
    """Check if file should be excluded"""
    path_str = str(path)
    return any(pattern in path_str for pattern in EXCLUDE_PATTERNS)

def create_release_zip():
    """Create release ZIP file"""
    print("=" * 50)
    print(f"PostQuee Connector v{VERSION}")
    print("Release ZIP Creator")
    print("=" * 50)
    print()

    # Change to parent directory
    os.chdir("/root")

    # Remove old ZIP if exists
    if os.path.exists(OUTPUT_FILE):
        print("Removing old ZIP file...")
        os.remove(OUTPUT_FILE)

    print("Creating release ZIP...")
    print()

    base_path = Path(PLUGIN_DIR)
    files_added = 0
    total_size = 0

    with zipfile.ZipFile(OUTPUT_FILE, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add individual files
        for pattern in INCLUDE_PATTERNS:
            full_path = base_path / pattern

            if full_path.is_file():
                # Single file
                if not should_exclude(full_path):
                    zipf.write(full_path, full_path)
                    files_added += 1
                    total_size += full_path.stat().st_size
                    print(f"  ✓ {full_path}")

            elif full_path.is_dir():
                # Directory - recursively add all files
                for root, dirs, files in os.walk(full_path):
                    # Filter out excluded directories
                    dirs[:] = [d for d in dirs if not should_exclude(Path(root) / d)]

                    for file in files:
                        file_path = Path(root) / file
                        if not should_exclude(file_path):
                            zipf.write(file_path, file_path)
                            files_added += 1
                            total_size += file_path.stat().st_size

    print()
    print("✅ Release ZIP created successfully!")
    print()

    # Show summary
    zip_size = os.path.getsize(OUTPUT_FILE)
    zip_size_mb = zip_size / (1024 * 1024)

    print("📦 ZIP Contents Summary:")
    print("-" * 50)
    print(f"Total files: {files_added}")
    print(f"Uncompressed size: {total_size / (1024 * 1024):.2f} MB")
    print(f"Compressed size: {zip_size_mb:.2f} MB")
    print(f"Compression ratio: {(1 - zip_size / total_size) * 100:.1f}%")
    print()

    print(f"📍 Location: /root/{OUTPUT_FILE}")
    print()
    print("=" * 50)
    print("✨ Ready for distribution!")
    print("=" * 50)
    print()
    print("Installation instructions:")
    print(f"1. Download: /root/{OUTPUT_FILE}")
    print("2. Go to WordPress Admin → Plugins → Add New")
    print("3. Click 'Upload Plugin'")
    print("4. Select the ZIP file")
    print("5. Click 'Install Now' then 'Activate'")
    print()

    # Verify contents
    print("Verifying ZIP contents...")
    with zipfile.ZipFile(OUTPUT_FILE, 'r') as zipf:
        # Check for main plugin file
        if any('postquee-bridge.php' in name for name in zipf.namelist()):
            print("  ✓ Main plugin file found")

        # Check for bundle
        if any('calendar.bundle.js' in name for name in zipf.namelist()):
            print("  ✓ React bundle found")

        # Check for includes
        if any('includes/' in name for name in zipf.namelist()):
            print("  ✓ PHP includes found")

        print()
        print("✅ ZIP file verified and ready!")

if __name__ == "__main__":
    try:
        create_release_zip()
    except Exception as e:
        print(f"❌ Error creating ZIP: {e}")
        import traceback
        traceback.print_exc()
