jQuery(document).ready(function ($) {
    // -------------------------------------------------------------------------
    // State & Init
    // -------------------------------------------------------------------------
    var appUrl = postqueeObj.appUrl;
    var state = {
        date: new Date(), // Current reference date
        view: 'week',     // 'day', 'week', 'month'
        posts: Array.isArray(postqueeObj.posts) ? postqueeObj.posts : [],
        channels: Array.isArray(postqueeObj.channels) ? postqueeObj.channels : []
    };

    // DOM Elements
    var $container = $('#pq-calendar-container');
    var $dateDisplay = $('#pq-date-display');
    var $modalOverlay = $('#pq-modal-overlay');
    var $modalContent = $('#pq-modal-content');

    // Initialize
    init();

    function init() {
        bindEvents();
        render();
    }

    // -------------------------------------------------------------------------
    // Event Binding
    // -------------------------------------------------------------------------
    function bindEvents() {
        // Navigation
        $('#pq-prev-week').on('click', function () { navigate(-1); });
        $('#pq-next-week').on('click', function () { navigate(1); });
        $('#pq-today-btn').on('click', function () {
            state.date = new Date();
            render();
        });

        // View Switching
        $('.pq-view-btn').on('click', function () {
            $('.pq-view-btn').removeClass('active');
            $(this).addClass('active');
            state.view = $(this).data('view');
            render();
        });

        // Create Post Modal
        $('#pq-create-post-btn').on('click', function (e) {
            e.preventDefault();
            openCreateModal();
        });

        // Close Modal
        $modalOverlay.on('click', function (e) {
            if (e.target === this) closeModal();
        });

        // Other existing handlers (Admin Bar)
        $('body').on('click', '.send-to-postquee-api', function (e) {
            e.preventDefault();
            var title = $(this).data('title');
            var url = $(this).data('url');

            // Visual feedback
            var $btn = $(this);
            var originalText = $btn.text();
            $btn.text('Sending...');

            $.post(postqueeObj.ajaxUrl, {
                action: 'postquee_send_post',
                title: title,
                url: url,
                nonce: postqueeObj.nonce
            }, function (res) {
                if (res.success) {
                    alert('Draft sent to PostQuee Plugin!');
                } else {
                    alert('Error: ' + res.data);
                }
                $btn.text(originalText);
            }).fail(function () {
                alert('Request failed');
                $btn.text(originalText);
            });
        });

        // Calendar Slot Clicks (Delegated)
        $container.on('click', '.pq-time-slot, .pq-month-day', function (e) {
            // Don't trigger if clicked on a post inside the slot
            if ($(e.target).closest('.pq-calendar-post').length || $(e.target).closest('.pq-post-dot').length) return;

            openCreateModal();
        });
    }

    function navigate(dir) {
        if (state.view === 'week') {
            state.date.setDate(state.date.getDate() + (dir * 7));
        } else if (state.view === 'day') {
            state.date.setDate(state.date.getDate() + dir);
        } else if (state.view === 'month') {
            state.date.setMonth(state.date.getMonth() + dir);
        }
        render();
    }

    // -------------------------------------------------------------------------
    // Rendering Logic
    // -------------------------------------------------------------------------
    function render() {
        updateTopBar();
        $container.empty();

        if (state.view === 'week') renderWeekView();
        else if (state.view === 'month') renderMonthView();
        else if (state.view === 'day') renderDayView();
    }

    function updateTopBar() {
        var opts = { month: 'long', year: 'numeric' };
        if (state.view === 'day') opts = { month: 'long', year: 'numeric', day: 'numeric' };
        $dateDisplay.text(state.date.toLocaleDateString(undefined, opts));
    }

    // --- Week View ---
    function renderWeekView() {
        // Grid Layout: Header row + Time slots
        var startOfWeek = getStartOfWeek(state.date);
        var weekDays = [];
        for (var i = 0; i < 7; i++) {
            var d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            weekDays.push(d);
        }

        // Create Grid Container
        var $grid = $('<div class="pq-week-grid"></div>').css({
            'display': 'grid',
            'grid-template-columns': '50px repeat(7, minmax(0, 1fr))',
            'height': '100%',
            'overflow': 'auto'
        });

        // 1. Header Row (Days)
        $grid.append('<div class="pq-time-col-header"></div>'); // Empty corner
        weekDays.forEach(function (d) {
            var isToday = isSameDate(d, new Date());
            // Format match: "Monday" (newline) "01/19"
            var dayName = d.toLocaleDateString(undefined, { weekday: 'long' });
            // Month/Day format zero-padded manually or via locale
            var mon = (d.getMonth() + 1).toString().padStart(2, '0');
            var dateNum = d.getDate().toString().padStart(2, '0');
            var dayDate = mon + '/' + dateNum;

            var $header = $(`
                <div class="pq-day-header ${isToday ? 'today' : ''}">
                    <div class="day-name">${dayName}</div>
                    <div class="day-num">${dayDate}</div>
                </div>
            `);
            $grid.append($header);
        });

        // 2. Time Slots (00:00 - 23:00)
        for (var h = 0; h < 24; h++) {
            var hourLabel = (h === 0) ? '12 AM' : (h < 12 ? h + ' AM' : (h === 12 ? '12 PM' : (h - 12) + ' PM'));
            if (h === 0 && !isUS()) hourLabel = '00:00'; // Simple check

            // Time Label
            $grid.append(`<div class="pq-time-label">${hourLabel}</div>`);

            // 7 Columns for this hour
            for (var d = 0; d < 7; d++) {
                var currentDay = weekDays[d];
                // Check for posts in this hour/day
                var slotPosts = getPostsForSlot(currentDay, h);

                var $slot = $('<div class="pq-time-slot"></div>');

                if (slotPosts.length > 0) {
                    slotPosts.forEach(function (post) {
                        var $postEl = createPostElement(post);
                        $slot.append($postEl);
                    });
                }

                $grid.append($slot);
            }
        }

        $container.html($grid); // Use .html() to ensure clean replacement
    }

    function isUS() { return true; } // Placeholder logic if locale needed

    // --- Month View ---
    function renderMonthView() {
        var year = state.date.getFullYear();
        var month = state.date.getMonth();
        var firstDay = new Date(year, month, 1);
        var lastDay = new Date(year, month + 1, 0);

        var startDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mon start
        var totalDays = lastDay.getDate();

        var $grid = $('<div class="pq-month-grid"></div>');

        // Headers
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(d => {
            $grid.append(`<div class="pq-month-header">${d}</div>`);
        });

        // Blanks
        for (var i = 0; i < startDayIndex; i++) {
            $grid.append('<div class="pq-month-day empty"></div>');
        }

        // Days
        for (var i = 1; i <= totalDays; i++) {
            var currentDateIter = new Date(year, month, i);
            var isToday = isSameDate(currentDateIter, new Date());
            var dayPosts = getPostsForDay(currentDateIter);

            var $dayEl = $(`
                <div class="pq-month-day">
                    <div class="pq-day-num ${isToday ? 'today' : ''}">${i}</div>
                    <div class="pq-day-content"></div>
                </div>
            `);

            dayPosts.forEach(function (post) {
                var smallIcon = '';
                // Try to find channel icon
                /* if(post.integration) ... */
                $dayEl.find('.pq-day-content').append(`<div class="pq-post-dot" title="${post.content || 'Post'}"></div>`);
            });

            $grid.append($dayEl);
        }

        $container.append($grid);
    }

    // --- Day View ---
    function renderDayView() {
        // Similar to week but 1 column expanded
        var $view = $('<div style="padding:20px; text-align:center;">Day View Not Fully Implemented Yet</div>');
        $container.append($view);
    }


    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    function getStartOfWeek(date) {
        var d = new Date(date);
        var day = d.getDay();
        var diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday (0) to be Monday (1) based
        // Actually JS getDay: Sun=0, Mon=1...Sat=6. 
        // If Sun(0), we want -6 days (previous Monday). 
        // If Mon(1), we want 0 days (diff = 1 - 1 + 1? No.)
        // Standard formula: diff = d.getDate() - day + (day == 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    function isSameDate(d1, d2) {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    }

    function getPostsForSlot(date, hour) {
        // Filter posts that match date and hour
        return state.posts.filter(p => {
            if (!p.scheduledAt) return false;
            var pDate = new Date(p.scheduledAt); // Assuming ISO string
            return isSameDate(pDate, date) && pDate.getHours() === hour;
        });
    }

    function getPostsForDay(date) {
        return state.posts.filter(p => {
            if (!p.scheduledAt) return false;
            var pDate = new Date(p.scheduledAt);
            return isSameDate(pDate, date);
        });
    }

    function createPostElement(post) {
        // Find channel info if available
        // Expected structure: post.integration or we map via channels
        var content = post.content || post.title || 'Untitled';
        var $el = $(`
            <div class="pq-calendar-post">
                <div class="pq-post-content">${content.substring(0, 20)}...</div>
            </div>
        `);
        return $el;
    }

    // -------------------------------------------------------------------------
    // Modals
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // Modals
    // -------------------------------------------------------------------------
    function openCreateModal() {
        var html = `
            <div class="pq-modal-header">
                <div class="pq-modal-title">Create Post</div>
                <button class="pq-modal-close" id="pq-modal-close-btn">&times;</button>
            </div>
            
            <div class="pq-modal-body">
                <!-- Left Column: inputs -->
                <div class="pq-modal-left">
                    
                    <div class="pq-channel-row">
                        ${renderChannelOptions()}
                    </div>

                    <div class="pq-editor-container">
                        <textarea id="pq-new-post-content" class="pq-editor-textarea" placeholder="What's on your mind?"></textarea>
                        
                        <div class="pq-editor-toolbar">
                             <div class="pq-tool-btn primary-tool">
                                <span class="dashicons dashicons-format-image"></span> Insert Media
                             </div>
                             <div class="pq-tool-btn">
                                <span class="dashicons dashicons-art"></span> Design Media
                             </div>
                             <div class="pq-tool-btn" style="color:#d8b4fe;">
                                <span class="dashicons dashicons-star-filled"></span> AI Magic
                             </div>
                             <div style="flex:1;"></div>
                             <div class="pq-tool-btn" title="Emoji">😊</div>
                        </div>
                    </div>

                    <div style="margin-top:20px; display:flex; gap:10px;">
                        <button class="pq-tool-btn"><span class="dashicons dashicons-tag"></span> Add New Tag</button>
                        <button class="pq-tool-btn"><span class="dashicons dashicons-backup"></span> Repeat Post Every...</button>
                    </div>

                </div>

                <!-- Right Column: Preview -->
                <div class="pq-modal-right">
                    <div class="pq-preview-header">
                        <span>Post Preview</span>
                        <span class="dashicons dashicons-no-alt" style="cursor:pointer;" onclick="jQuery('#pq-modal-overlay').removeClass('active')"></span>
                    </div>
                    <div class="pq-preview-content">
                        <div class="pq-post-card-preview">
                            <div class="pq-preview-meta">
                                <div class="pq-preview-avatar"></div>
                                <div style="font-size:13px; font-weight:600; color:white;">Global Edit <span class="dashicons dashicons-yes" style="font-size:12px;"></span></div>
                            </div>
                            <div class="pq-preview-text" id="pq-preview-text-target">This is a test</div>
                            <div class="pq-preview-image-placeholder">
                                Image Preview
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pq-modal-footer">
                <div class="pq-date-picker-trigger">
                    <span class="dashicons dashicons-calendar-alt"></span>
                    <span>${new Date().toLocaleString()}</span>
                </div>
                
                <button class="pq-btn-ghost" id="pq-draft-btn">Save as draft</button>
                <button class="pq-btn-primary" id="pq-submit-post-btn">Add to Calendar</button>
            </div>
        `;

        $modalContent.html(html);
        $modalOverlay.addClass('active');

        // Bind Events

        // 1. Close
        $('#pq-modal-close-btn').on('click', closeModal);

        // 2. Submit
        $('#pq-submit-post-btn').on('click', function () { submitPost('schedule'); });
        $('#pq-draft-btn').on('click', function () { submitPost('draft'); });

        // 3. Channel Toggle
        $('.pq-channel-circle').on('click', function () {
            var $t = $(this);
            $t.toggleClass('selected');
        });

        // 4. Live Preview
        $('#pq-new-post-content').on('input', function () {
            var val = $(this).val();
            $('#pq-preview-text-target').text(val || 'This is a test');
        });
    }

    function closeModal() {
        $modalOverlay.removeClass('active');
    }

    function renderChannelOptions() {
        if (!state.channels || state.channels.length === 0) return '<div style="color:#777;">No channels</div>';

        // Render detailed circles
        return state.channels.map(function (ch) {
            // Get initial (first letter) if no icon
            var initial = (ch.name || '?').charAt(0).toUpperCase();
            var iconHtml = initial;

            return `
            <div class="pq-channel-circle selected" data-id="${ch.id}" title="${ch.name}">
                ${iconHtml}
            </div>
            `;
        }).join('');
    }

    function submitPost(mode) {
        var content = $('#pq-new-post-content').val();
        var selectedChannels = [];
        $('.pq-channel-circle.selected').each(function () {
            selectedChannels.push($(this).data('id'));
        });

        // Allow drafts with empty content? maybe title only?
        // Enforce content for now
        if (!content && mode !== 'draft') { alert('Please enter content'); return; }
        if (selectedChannels.length === 0 && mode !== 'draft') { alert('Select at least one channel'); return; }

        var btnId = mode === 'draft' ? '#pq-draft-btn' : '#pq-submit-post-btn';
        var initText = $(btnId).text();
        $(btnId).text('...').prop('disabled', true);

        // Mimic the API structure used in PHP
        $.post(postqueeObj.ajaxUrl, {
            action: 'postquee_send_post',
            content: content,
            providers: selectedChannels,
            status: mode,
            nonce: postqueeObj.nonce
        }, function (res) {
            if (res.success) {
                closeModal();
                alert(mode === 'draft' ? 'Draft Saved!' : 'Post Scheduled!');
                location.reload();
            } else {
                alert('Error: ' + res.data);
            }
            $(btnId).text(initText).prop('disabled', false);
        });
    }

});
