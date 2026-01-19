(function (wp) {
    if (!wp) return;

    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerPlugin = wp.plugins.registerPlugin;
    var PluginSidebar = wp.editPost.PluginSidebar;
    var PluginSidebarMoreMenuItem = wp.editPost.PluginSidebarMoreMenuItem;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var Spinner = wp.components.Spinner;
    var withSelect = wp.data.withSelect;
    var compose = wp.compose.compose;

    console.log('PostQuee Sidebar: Loading...');

    // Icon
    var PostQueeIcon = el('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: '#ff6900' },
        el('path', { d: 'M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z' }),
        el('path', { d: 'M10 5l-1 2-2 1 2 1 1 2 1-2 2-1-2-1z' })
    );

    var PostQueeSidebar = function (props) {
        var postId = props.postId;

        var statePair = wp.element.useState({
            loading: false, // Lazy load: start false, waiting for user or initial check
            synced: false,
            syncedId: null,
            lastError: null,
            apiStatus: 'unknown', // 'unknown', 'checking', 'ok', 'error'
            integrations: [],
            currentChannel: '',
            syncing: false,
            initialized: false
        });
        var state = statePair[0];
        var setState = statePair[1];

        // Safe Fetch Function
        var loadStatus = function () {
            if (!postId) return;
            setState(Object.assign({}, state, { loading: true, apiStatus: 'checking' }));

            wp.apiFetch({ path: '/postquee-connector/v1/status?post_id=' + postId })
                .then(function (data) {
                    setState({
                        loading: false,
                        synced: data.synced,
                        syncedId: data.synced_id,
                        lastError: data.api_error || data.last_error, // PRIORITIZE API ERROR FROM PHP
                        apiStatus: (data.api_error || data.api_status === 'error') ? 'error' : 'ok',
                        integrations: data.integrations,
                        currentChannel: data.current_channel,
                        syncing: false,
                        initialized: true
                    });
                })
                .catch(function (err) {
                    console.error('PostQuee API Fetch Error:', err);
                    setState({
                        loading: false,
                        synced: false,
                        syncedId: null,
                        lastError: 'System Error: ' + (err.message || 'Check console'),
                        apiStatus: 'error',
                        integrations: [],
                        currentChannel: '',
                        syncing: false,
                        initialized: true
                    });
                });
        };

        // Initial Load (One time)
        wp.element.useEffect(function () {
            if (postId && !state.initialized) {
                // Wrap in timeout to defer slightly from critical render path
                setTimeout(loadStatus, 500);
            }
        }, [postId, state.initialized]);

        var handleSync = function () {
            setState(Object.assign({}, state, { syncing: true }));

            wp.apiFetch({
                path: '/postquee-connector/v1/sync',
                method: 'POST',
                data: { post_id: postId }
            }).then(function (res) {
                setState(Object.assign({}, state, { syncing: false, synced: true, syncedId: res.id, lastError: null }));
                wp.data.dispatch('core/notices').createNotice('success', 'Post sent to PostQuee!', { isDismissible: true });
            }).catch(function (err) {
                var errMsg = err.message || 'Unknown error';
                setState(Object.assign({}, state, { syncing: false, lastError: errMsg }));
                wp.data.dispatch('core/notices').createNotice('error', 'Sync Failed: ' + errMsg, { isDismissible: true });
            });
        };

        var headerStyle = { display: 'flex', alignItems: 'center', marginBottom: '15px' };
        var statusStyle = { padding: '10px', background: state.synced ? '#e6fffa' : '#f7fafc', borderRadius: '4px', marginBottom: '15px', border: '1px solid #cbd5e0' };

        return el(Fragment, {},
            el(PluginSidebarMoreMenuItem, { target: 'postquee-sidebar', icon: PostQueeIcon }, 'PostQuee'),
            el(PluginSidebar, { name: 'postquee-sidebar', title: 'PostQuee', icon: PostQueeIcon },
                el(PanelBody, { title: 'Post Status' },

                    // Loading State
                    state.loading ? el(Spinner) : null,

                    // Error Details (Visible if apiStatus is error)
                    (state.lastError && !state.loading) ? el('div', { style: { color: '#c53030', background: '#fff5f5', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #fc8181', fontSize: '11px', wordBreak: 'break-word' } },
                        el('strong', {}, 'Error: '), state.lastError,
                        el(Button, { isSmall: true, variant: 'secondary', onClick: loadStatus, style: { display: 'block', marginTop: '5px' } }, 'Retry Connection')
                    ) : null,

                    // Normal Status Box (Only if initialized and no serious API error blocking view)
                    (state.initialized && !state.loading && state.apiStatus !== 'error') ? el(Fragment, {},
                        el('div', { style: statusStyle },
                            el('strong', {}, state.synced ? '✅ Synced' : '⚪ Not Synced'),
                            state.syncedId ? el('div', { style: { fontSize: '11px', marginTop: '5px', color: '#718096' } }, 'ID: ' + state.syncedId) : null
                        ),
                        // Action Button
                        el(Button, {
                            isPrimary: true,
                            isBusy: state.syncing,
                            disabled: state.syncing,
                            onClick: handleSync,
                            style: { width: '100%', justifyContent: 'center', marginBottom: '10px' }
                        }, state.synced ? 'Sync Again' : 'Send to PostQuee'),

                        el('p', { style: { fontSize: '11px', color: '#718096', textAlign: 'center', margin: 0 } },
                            'Channel: ' + (state.currentChannel ? state.currentChannel : 'None')
                        )
                    ) : null
                ),

                // Integrations Panel
                el(PanelBody, { title: 'Integrations', initialOpen: false },
                    state.loading ? el(Spinner) :
                        (!state.integrations || state.integrations.length === 0) ? el('p', { style: { color: '#666', fontSize: '12px' } }, 'No integrations found.') :
                            el('ul', { style: { margin: 0 } },
                                state.integrations.map(function (integ) {
                                    return el('li', { key: integ.id, style: { marginBottom: '8px', display: 'flex', alignItems: 'center' } },
                                        el('span', { style: { width: '6px', height: '6px', borderRadius: '50%', background: '#48bb78', marginRight: '8px' } }),
                                        el('span', {}, integ.name)
                                    );
                                })
                            )
                )
            )
        );
    };

    var PostQueeSidebarWithData = withSelect(function (select) {
        return {
            postId: select('core/editor').getCurrentPostId()
        };
    })(PostQueeSidebar);

    registerPlugin('postquee-connector', {
        render: PostQueeSidebarWithData,
        icon: PostQueeIcon
    });

    console.log('PostQuee Sidebar: Registered.');

})(window.wp);
