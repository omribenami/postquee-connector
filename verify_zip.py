import zipfile

with zipfile.ZipFile('/root/WP_PostQuee/postquee-connector.zip', 'r') as z:
    files = z.namelist()
    required = [
        'postquee-connector/includes/class-postquee-admin.php',
        'postquee-connector/assets/js/postquee-bridge.js',
        'postquee-connector/assets/css/postquee-bridge.css',
        'postquee-connector/postquee-bridge.php'
    ]
    missing = [f for f in required if f not in files]
    if missing:
        print(f"MISSING FILES: {missing}")
    else:
        print("ALL REQUIRED FILES PRESENT")
