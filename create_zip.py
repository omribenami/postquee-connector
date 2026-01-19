import os
import zipfile

def zip_plugin(output_filename, source_dir):
    # The name of the root directory inside the zip
    plugin_slug = 'postquee-connector'

    # Files/Dirs to exclude (System files, build scripts, and development files)
    excludes = {
        '.git',
        '.claude',
        '.DS_Store',
        'Plugin install.mp4',
        output_filename, # Don't zip the zip itself
        'create_zip.py',
        'create-release-zip.py',
        'create-release-zip.sh',
        'verify_zip.py',
        'README.md', # GitHub readme, not for WP plugin (we use readme.txt)
        'CLAUDE.md', # Development instructions
        '.gitignore',
        'node_modules',
        'src', # TypeScript source (we use compiled assets/dist)
        'webpack.config.js',
        'tsconfig.json',
        'tailwind.config.js',
        'postcss.config.js',
        'package.json',
        'package-lock.json',
        'INSTALLATION_COMPLETE.txt',
        'check-config.php',
        'fix-wordpress-conflict.sh',
        'postquee-connector.php',  # Disabled v2.0.0 connector (we use bridge mode)
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

        # Exclude source maps in production
        if filename.endswith('.map'):
            return True

        return False

    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        print(f"\nCreating PostQuee Connector Plugin ZIP (Bridge Mode)...\n")

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
        print(f"\nIncluded files for PostQuee Connector (Bridge Mode):")
        print("  • postquee-bridge.php (Main plugin file)")
        print("  • includes/class-postquee-bridge.php (Core loader)")
        print("  • includes/class-postquee-admin.php (Admin interface)")
        print("  • includes/API/ (PostQuee API client)")
        print("  • includes/Admin/ (Settings, Metabox)")
        print("  • includes/Core/ (Mapper utilities)")
        print("  • includes/Rest/ (WordPress REST API)")
        print("  • includes/Utils/ (Helper functions)")
        print("  • assets/dist/ (Compiled React calendar)")
        print("  • assets/css/ (Admin styles)")
        print("  • assets/js/ (Metabox, Gutenberg integration)")
        print("\nExcluded files:")
        print("  ✗ postquee-connector.php (disabled v2.0.0)")
        print("  ✗ src/ (TypeScript source - compiled to assets/dist)")
        print("  ✗ node_modules/ (build dependencies)")
        print("  ✗ Build scripts and development files")
        print("  ✗ .bak and .map files\n")

if __name__ == "__main__":
    zip_plugin('postquee-connector.zip', '/root/WP_PostQuee')
    print("Zip created successfully.")
