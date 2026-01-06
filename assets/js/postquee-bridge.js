jQuery(document).ready(function ($) {
    var appUrl = postqueeObj.appUrl;
    var targetOrigin = postqueeObj.origin;

    // --- 1. Iframe Resizing & Communication (Main Page) ---
    var $mainIframe = $('#postquee-iframe');

    // Listen for messages from the App
    window.addEventListener('message', function (event) {
        // Strict Origin Validation
        if (event.origin !== targetOrigin) {
            return;
        }

        var data = event.data;

        // Smart Resizing Logic
        if (data.type === 'resize' && data.height) {
            $mainIframe.css('height', data.height + 'px');
        }
    });


    // --- 2. Send to PostQuee (Post List & Editor Integration) ---

    // Helper to create the modal
    function getOrCreateModal() {
        var $modal = $('#postquee-modal');
        if ($modal.length === 0) {
            // App URL with specific path if needed? For now root app.
            var iframeSrc = appUrl;

            // Check if we need to append a query param to indicate specific mode if needed
            // iframeSrc += '?mode=composer'; 

            var modalHtml = `
                <div id="postquee-modal" class="postquee-modal-overlay">
                    <div class="postquee-modal-content">
                        <button id="postquee-modal-close" class="postquee-close-btn">&times;</button>
                        <iframe id="postquee-modal-iframe" src="${iframeSrc}" allow="clipboard-read; clipboard-write; camera; microphone;"></iframe>
                    </div>
                </div>
            `;
            $('body').append(modalHtml);
            $modal = $('#postquee-modal');

            // Close handlers
            $('#postquee-modal-close').on('click', function () {
                $modal.hide();
            });

            // Close on click outside
            $modal.on('click', function (e) {
                if (e.target.id === 'postquee-modal') {
                    $modal.hide();
                }
            });
        }
        return $modal;
    }

    // Handler for the "Send to PostQuee" button
    $(document).on('click', '.send-to-postquee, .send-to-postquee-editor', function (e) {
        e.preventDefault();

        var $btn = $(this);
        var postData = {
            post_title: $btn.data('title'),
            post_url: $btn.data('url'),
            featured_image: $btn.data('image'),
            excerpt: $btn.data('excerpt')
        };

        console.log('[PostQuee Bridge] Send to PostQuee clicked');
        console.log('[PostQuee Bridge] Post data:', postData);

        var $modal = getOrCreateModal();
        $modal.show();

        var iframe = document.getElementById('postquee-modal-iframe');

        // Function to send data
        var sendAttempts = 0;
        var sendMessage = function () {
            sendAttempts++;
            if (iframe && iframe.contentWindow) {
                var message = {
                    type: 'create-post-from-wp',
                    data: postData
                };
                console.log('[PostQuee Bridge] Sending message (attempt ' + sendAttempts + '):', message);
                iframe.contentWindow.postMessage(message, '*'); // Changed to wildcard to ensure delivery across protocols/redirects
            } else {
                console.warn('[PostQuee Bridge] Iframe not ready (attempt ' + sendAttempts + ')');
            }
        };

        // Attempt to send immediately (if already loaded)
        sendMessage();

        // Also send when it finishes loading (if new)
        iframe.onload = function () {
            console.log('[PostQuee Bridge] Iframe loaded');
            sendMessage();
        };

        // Retry mechanism: extended duration to handle slow app loading/hydration
        setTimeout(sendMessage, 1500);
        setTimeout(sendMessage, 3000);
        setTimeout(sendMessage, 5000);
        setTimeout(sendMessage, 8000);
    });

});
