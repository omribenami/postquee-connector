import os
import zipfile

def zip_plugin(output_filename, source_dir):
    # The name of the root directory inside the zip
    plugin_slug = 'postquee-connector'

    # Files/Dirs to exclude (System files, build scripts, and legacy bridge mode files)
    excludes = {
        '.git',
        '.claude',
        '.DS_Store',
        'Plugin install.mp4',
        output_filename, # Don't zip the zip itself
        'create_zip.py',
        'verify_zip.py',
        'README.md', # GitHub readme, not for WP plugin (we use readme.txt)
        '.gitignore',
        'node_modules',
    }

    # Define LEGACY BRIDGE MODE files to EXCLUDE (v1.0.0 - replaced by v2.0.0 connector)
    legacy_bridge_excludes = {
        'postquee-bridge.php',  # OLD main file
        'includes/class-postquee-bridge.php',  # OLD bridge class
        'includes/class-postquee-admin.php',  # OLD admin class (replaced by Admin/class-dashboard.php)
        'assets/css/postquee-bridge.css',  # OLD bridge CSS
        'assets/css/postquee-bridge.css.bak',
        'assets/js/postquee-bridge.js',  # OLD bridge JS
        'assets/js/postquee-bridge.js.bak',
        'includes/class-postquee-admin.php.bak',
    }

    # Helper to check if file should be excluded based on path
    def is_excluded(file_path):
        filename = os.path.basename(file_path)

        # Check if filename is in general excludes
        if filename in excludes:
            return True

        # Exclude .bak files
        if filename.endswith('.bak'):
            return True

        # Check legacy bridge mode files
        rel_path = os.path.relpath(file_path, source_dir)
        for legacy_file in legacy_bridge_excludes:
            if rel_path == legacy_file or rel_path.endswith(legacy_file):
                return True

        return False

    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        print(f"\nCreating PostQuee Connector v2.0.0 Plugin ZIP...\n")

        for root, dirs, files in os.walk(source_dir):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if not is_excluded(os.path.join(root, d))]

            for file in files:
                full_path = os.path.join(root, file)
                if is_excluded(full_path):
                    continue

                # Compute relative path for archive
                rel_path = os.path.relpath(full_path, source_dir)

                # Double check if any part of the path is in general excludes
                path_parts = rel_path.split(os.sep)
                if any(part in excludes for part in path_parts):
                    continue

                # Prepend the plugin slug folder
                arcname = os.path.join(plugin_slug, rel_path)

                print(f"  ✓ Adding: {rel_path}")
                zipf.write(full_path, arcname)

        print(f"\n✅ ZIP created successfully: {output_filename}")
        print(f"\nIncluded files for PostQuee Connector v2.0.0:")
        print("  • postquee-connector.php (Main plugin file)")
        print("  • includes/Admin/ (Dashboard, Settings, Metabox)")
        print("  • includes/API/ (Client, Endpoints)")
        print("  • includes/Core/ (Hooks, Mapper)")
        print("  • includes/Rest/ (REST API Controller)")
        print("  • includes/Utils/ (Utilities)")
        print("  • assets/js/ (Calendar, Admin, Gutenberg)")
        print("  • assets/css/ (Modern styling)")
        print("  • readme.txt (WordPress.org readme)")
        print("\nExcluded legacy bridge mode files (v1.0.0)")
        print("  ✗ postquee-bridge.php")
        print("  ✗ includes/class-postquee-bridge.php")
        print("  ✗ includes/class-postquee-admin.php (old)")
        print("  ✗ assets/**/postquee-bridge.* (old)")
        print("  ✗ Build scripts and .bak files\n")

if __name__ == "__main__":
    zip_plugin('postquee-connector.zip', '/root/WP_PostQuee')
    print("Zip created successfully.")
