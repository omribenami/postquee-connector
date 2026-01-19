/**
 * PostQuee Calendar - Full Featured Calendar Implementation
 * Matches the PostQuee app calendar functionality
 */

(function($) {
    'use strict';

    // Configuration
    const API_BASE = wpApiSettings.root + 'postquee-connector/v1';
    const NONCE = wpApiSettings.nonce;

    // State management
    const CalendarState = {
        view: 'week', // 'day', 'week', 'month'
        currentDate: new Date(),
        posts: [],
        integrations: [],
        selectedIntegrations: [],
        loading: false,

        // Date range
        getDateRange() {
            const date = this.currentDate;
            switch (this.view) {
                case 'day':
                    return {
                        start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                        end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
                    };
                case 'week':
                    const day = date.getDay();
                    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
                    const monday = new Date(date.setDate(diff));
                    const sunday = new Date(monday);
                    sunday.setDate(monday.getDate() + 6);
                    return {
                        start: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()),
                        end: new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59)
                    };
                case 'month':
                    return {
                        start: new Date(date.getFullYear(), date.getMonth(), 1),
                        end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
                    };
            }
        },

        toISOString(date) {
            return date.toISOString();
        },

        navigate(direction) {
            const amount = direction === 'prev' ? -1 : 1;
            switch (this.view) {
                case 'day':
                    this.currentDate.setDate(this.currentDate.getDate() + amount);
                    break;
                case 'week':
                    this.currentDate.setDate(this.currentDate.getDate() + (amount * 7));
                    break;
                case 'month':
                    this.currentDate.setMonth(this.currentDate.getMonth() + amount);
                    break;
            }
        },

        goToToday() {
            this.currentDate = new Date();
        }
    };

    // API Service
    const API = {
        async request(endpoint, options = {}) {
            const defaults = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': NONCE
                }
            };

            const config = { ...defaults, ...options };
            if (config.body && typeof config.body === 'object') {
                config.body = JSON.stringify(config.body);
            }

            try {
                const response = await fetch(API_BASE + endpoint, config);
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'API Error');
                }
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },

        async getIntegrations() {
            return await this.request('/integrations');
        },

        async getPosts(startDate, endDate) {
            const params = new URLSearchParams({
                startDate: startDate,
                endDate: endDate
            });
            return await this.request('/posts?' + params.toString());
        },

        async createPost(payload) {
            return await this.request('/posts', {
                method: 'POST',
                body: payload
            });
        },

        async deletePost(postId) {
            return await this.request(`/posts/${postId}`, {
                method: 'DELETE'
            });
        },

        async uploadFile(file) {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(API_BASE + '/upload', {
                method: 'POST',
                headers: {
                    'X-WP-Nonce': NONCE
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }
            return await response.json();
        }
    };

    // Calendar Renderer
    const CalendarRenderer = {
        init() {
            this.container = $('.postquee-calendar-grid');
            if (!this.container.length) {
                console.warn('Calendar container not found');
                return;
            }
        },

        render() {
            switch (CalendarState.view) {
                case 'week':
                    this.renderWeekView();
                    break;
                case 'month':
                    this.renderMonthView();
                    break;
                case 'day':
                    this.renderDayView();
                    break;
            }
        },

        renderWeekView() {
            const range = CalendarState.getDateRange();
            const days = [];

            // Generate 7 days
            for (let i = 0; i < 7; i++) {
                const day = new Date(range.start);
                day.setDate(range.start.getDate() + i);
                days.push(day);
            }

            let html = '<div class="pq-week-grid">';

            // Header row
            html += '<div class="pq-time-col"></div>';
            days.forEach(day => {
                const isToday = this.isToday(day);
                const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
                const dateStr = (day.getMonth() + 1).toString().padStart(2, '0') + '/' +
                               day.getDate().toString().padStart(2, '0');
                html += `<div class="pq-day-header ${isToday ? 'today' : ''}">
                    <div class="day-name">${dayName}</div>
                    <div class="day-num">${dateStr}</div>
                </div>`;
            });

            // Time slots (24 hours)
            for (let hour = 0; hour < 24; hour++) {
                const hourLabel = this.formatHour(hour);
                html += `<div class="pq-time-label">${hourLabel}</div>`;

                // 7 columns for each hour
                days.forEach(day => {
                    const slotDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour);
                    const posts = this.getPostsForSlot(slotDate);

                    html += '<div class="pq-time-slot" data-date="' + slotDate.toISOString() + '">';
                    posts.forEach(post => {
                        html += this.renderPost(post);
                    });
                    html += '</div>';
                });
            }

            html += '</div>';
            this.container.html(html);
        },

        renderMonthView() {
            const range = CalendarState.getDateRange();
            const firstDay = range.start;
            const lastDay = range.end;

            let html = '<div class="pq-month-grid">';

            // Day headers
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
                html += `<div class="pq-month-header">${day}</div>`;
            });

            // Empty cells before first day
            const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
            for (let i = 0; i < startDay; i++) {
                html += '<div class="pq-month-day empty"></div>';
            }

            // Days of month
            const daysInMonth = lastDay.getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
                const isToday = this.isToday(date);
                const posts = this.getPostsForDay(date);

                html += `<div class="pq-month-day" data-date="${date.toISOString()}">
                    <div class="pq-day-num ${isToday ? 'today' : ''}">${day}</div>
                    <div class="pq-day-content">`;

                posts.slice(0, 3).forEach(post => {
                    html += `<div class="pq-post-dot" title="${this.escapeHtml(post.content)}"></div>`;
                });

                if (posts.length > 3) {
                    html += `<div class="pq-post-more">+${posts.length - 3} more</div>`;
                }

                html += `</div></div>`;
            }

            html += '</div>';
            this.container.html(html);
        },

        renderDayView() {
            const range = CalendarState.getDateRange();
            const day = range.start;

            let html = '<div class="pq-day-grid">';

            for (let hour = 0; hour < 24; hour++) {
                const hourLabel = this.formatHour(hour);
                const slotDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour);
                const posts = this.getPostsForSlot(slotDate);

                html += `<div class="pq-time-label">${hourLabel}</div>`;
                html += '<div class="pq-time-slot" data-date="' + slotDate.toISOString() + '">';
                posts.forEach(post => {
                    html += this.renderPost(post);
                });
                html += '</div>';
            }

            html += '</div>';
            this.container.html(html);
        },

        renderPost(post) {
            const content = this.escapeHtml(post.content || '').substring(0, 50);
            const integration = post.integration || {};
            const picture = integration.picture || '';

            return `<div class="pq-calendar-post" data-post-id="${post.id}">
                ${picture ? `<img src="${picture}" class="pq-post-avatar" alt="">` : ''}
                <div class="pq-post-content">${content}...</div>
                <button class="pq-post-delete" data-id="${post.id}">&times;</button>
            </div>`;
        },

        getPostsForSlot(slotDate) {
            return CalendarState.posts.filter(post => {
                if (!post.publishDate) return false;
                const postDate = new Date(post.publishDate);
                return postDate.getFullYear() === slotDate.getFullYear() &&
                       postDate.getMonth() === slotDate.getMonth() &&
                       postDate.getDate() === slotDate.getDate() &&
                       postDate.getHours() === slotDate.getHours();
            });
        },

        getPostsForDay(date) {
            return CalendarState.posts.filter(post => {
                if (!post.publishDate) return false;
                const postDate = new Date(post.publishDate);
                return postDate.getFullYear() === date.getFullYear() &&
                       postDate.getMonth() === date.getMonth() &&
                       postDate.getDate() === date.getDate();
            });
        },

        formatHour(hour) {
            if (hour === 0) return '12 AM';
            if (hour < 12) return hour + ' AM';
            if (hour === 12) return '12 PM';
            return (hour - 12) + ' PM';
        },

        isToday(date) {
            const today = new Date();
            return date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
        },

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    };

    // Post Creation Modal
    const PostModal = {
        init() {
            this.$modal = $('#postquee_create_modal');
            this.$form = this.$modal.find('form');
            this.$content = $('#postque_content');
            this.$preview = $('#postquee_preview_content');
            this.$imagePreview = $('#postquee_preview_image');
            this.$scheduleRadio = $('[name="post_type_selector"]');
            this.$scheduleInput = $('#postquee_schedule_input');

            this.bindEvents();
        },

        bindEvents() {
            const self = this;

            // Open modal
            $('#postquee_open_create, .pq-time-slot').on('click', function(e) {
                if ($(e.target).closest('.pq-calendar-post').length) return;
                const slotDate = $(this).data('date');
                self.open(slotDate);
            });

            // Close modal
            $('.postquee-close-modal, .postquee-modal').on('click', function(e) {
                if (e.target === this) {
                    self.close();
                }
            });

            // Live preview
            this.$content.on('input', function() {
                const text = $(this).val() || 'Your post caption will appear here...';
                self.$preview.text(text);
            });

            // Image preview
            $('[name="postque_image"]').on('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        self.$imagePreview.html(`<img src="${e.target.result}" alt="Preview">`).removeClass('empty');
                    };
                    reader.readAsDataURL(file);
                } else {
                    self.$imagePreview.html('No image selected').addClass('empty');
                }
            });

            // Schedule radio
            this.$scheduleRadio.on('change', function() {
                if ($(this).val() === 'schedule') {
                    self.$scheduleInput.slideDown();
                } else {
                    self.$scheduleInput.slideUp();
                }
            });

            // AI Assistant
            $('#postquee_ai_btn').on('click', function() {
                self.handleAIAssist();
            });
        },

        open(slotDate) {
            this.$modal.fadeIn();

            // Pre-fill date if provided
            if (slotDate) {
                const date = new Date(slotDate);
                const dateStr = date.getFullYear() + '-' +
                    (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
                    date.getDate().toString().padStart(2, '0') + 'T' +
                    date.getHours().toString().padStart(2, '0') + ':00';
                $('[name="schedule_date"]').val(dateStr);
                $('#postquee_schedule_radio').prop('checked', true).trigger('change');
            }
        },

        close() {
            this.$modal.fadeOut();
            this.$form[0].reset();
            this.$preview.text('Your post caption will appear here...');
            this.$imagePreview.html('No image selected').addClass('empty');
        },

        async handleAIAssist() {
            const $btn = $('#postquee_ai_btn');
            const currentContent = this.$content.val();

            if (!currentContent) {
                alert('Please enter some content first for AI to improve');
                return;
            }

            $btn.addClass('loading').prop('disabled', true);

            try {
                const response = await $.ajax({
                    url: ajaxurl,
                    method: 'POST',
                    data: {
                        action: 'postquee_ai_assist',
                        nonce: postquee_admin_vars.nonce,
                        user_prompt: currentContent
                    }
                });

                if (response.success) {
                    this.$content.val(response.data).trigger('input');
                } else {
                    alert('AI Assistant error: ' + (response.data || 'Unknown error'));
                }
            } catch (error) {
                alert('AI Assistant failed: ' + error.message);
            } finally {
                $btn.removeClass('loading').prop('disabled', false);
            }
        }
    };

    // Event Handlers
    const EventHandlers = {
        init() {
            this.bindNavigation();
            this.bindViewSwitcher();
            this.bindPostActions();
        },

        bindNavigation() {
            $('.postquee-btn-icon').eq(0).on('click', () => {
                CalendarState.navigate('prev');
                this.refresh();
            });

            $('.postquee-btn-icon').eq(1).on('click', () => {
                CalendarState.navigate('next');
                this.refresh();
            });

            $('.postquee-btn-outline').filter(':contains("Today")').on('click', () => {
                CalendarState.goToToday();
                this.refresh();
            });
        },

        bindViewSwitcher() {
            $('.postquee-btn-group button').on('click', function() {
                $('.postquee-btn-group button').removeClass('active');
                $(this).addClass('active');

                const view = $(this).text().toLowerCase();
                CalendarState.view = view;
                CalendarRenderer.render();
            });
        },

        bindPostActions() {
            $(document).on('click', '.pq-post-delete', async function(e) {
                e.stopPropagation();
                const postId = $(this).data('id');

                if (!confirm('Delete this post?')) return;

                try {
                    await API.deletePost(postId);
                    $(this).closest('.pq-calendar-post').fadeOut(() => {
                        $(this).remove();
                    });
                } catch (error) {
                    alert('Failed to delete post: ' + error.message);
                }
            });
        },

        async refresh() {
            this.updateDateDisplay();
            await CalendarApp.loadPosts();
            CalendarRenderer.render();
        },

        updateDateDisplay() {
            const range = CalendarState.getDateRange();
            const start = range.start.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
            const end = range.end.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

            // For day view, show single date; for week/month show range
            if (CalendarState.view === 'day') {
                $('.postquee-date-range').text(start);
            } else {
                $('.postquee-date-range').text(`${start} - ${end}`);
            }
        }
    };

    // Main App
    const CalendarApp = {
        async init() {
            console.log('PostQuee Calendar initializing...');

            // Initialize components
            CalendarRenderer.init();
            PostModal.init();
            EventHandlers.init();

            // Load data
            await this.loadIntegrations();
            await this.loadPosts();

            // Initial render
            CalendarRenderer.render();
            EventHandlers.updateDateDisplay();

            console.log('PostQuee Calendar ready');
        },

        async loadIntegrations() {
            try {
                const data = await API.getIntegrations();
                CalendarState.integrations = Array.isArray(data) ? data : [];
                console.log('Loaded integrations:', CalendarState.integrations.length);
            } catch (error) {
                console.error('Failed to load integrations:', error);
            }
        },

        async loadPosts() {
            const range = CalendarState.getDateRange();
            const startDate = CalendarState.toISOString(range.start);
            const endDate = CalendarState.toISOString(range.end);

            try {
                const data = await API.getPosts(startDate, endDate);
                CalendarState.posts = data.posts || [];
                console.log('Loaded posts:', CalendarState.posts.length);
            } catch (error) {
                console.error('Failed to load posts:', error);
                CalendarState.posts = [];
            }
        }
    };

    // Initialize when DOM is ready
    $(document).ready(function() {
        // Only init on the PostQuee dashboard page
        if ($('.postquee-app-container').length) {
            CalendarApp.init();
        }
    });

})(jQuery);
