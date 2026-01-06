# PostQuee Application Integration Guide

This document explains what needs to be added to the PostQuee application (at `https://app.postquee.com`) to receive and handle messages from the WordPress plugin.

## Problem

The WordPress plugin is sending `postMessage` events with post data, but the PostQuee application doesn't have a listener to receive and process these messages.

## Required Implementation

Add a `postMessage` listener to the PostQuee application that:

1. Listens for messages of type `create-post-from-wp`
2. Extracts the WordPress post data
3. Opens/navigates to the post composer
4. Pre-fills the composer with the received data

## Message Structure

The WordPress plugin sends messages with this structure:

```javascript
{
  type: 'create-post-from-wp',
  data: {
    post_title: string,      // WordPress post title
    post_url: string,        // Post permalink
    featured_image: string,  // Full-size featured image URL (or empty string)
    excerpt: string          // Post excerpt (or empty string)
  }
}
```

## Example Implementation (React/Next.js)

### Option 1: Global Listener (Recommended)

Add this to your root layout or main app component:

```typescript
// app/layout.tsx or pages/_app.tsx
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    // Accept messages from any origin for WordPress integration
    // WordPress plugin sends from various admin URLs

    const { type, data } = event.data;

    if (type === 'create-post-from-wp') {
      console.log('[PostQuee App] Received WordPress post data:', data);

      // Extract WordPress data
      const {
        post_title,
        post_url,
        featured_image,
        excerpt
      } = data;

      // Navigate to composer with pre-filled data
      // Option A: Use URL params
      const composerUrl = `/launches?wp_title=${encodeURIComponent(post_title || '')}&wp_url=${encodeURIComponent(post_url || '')}&wp_image=${encodeURIComponent(featured_image || '')}&wp_excerpt=${encodeURIComponent(excerpt || '')}`;

      router.push(composerUrl);

      // Option B: Use state management (Redux, Zustand, Context)
      // dispatch(setComposerData({
      //   title: post_title,
      //   url: post_url,
      //   image: featured_image,
      //   excerpt: excerpt
      // }));
      // router.push('/launches');
    }
  };

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, []);
```

### Option 2: Composer Page Listener

Add this to your composer/launches page:

```typescript
// app/launches/page.tsx or wherever your composer lives
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    const { type, data } = event.data;

    if (type === 'create-post-from-wp') {
      console.log('[PostQuee Composer] Received WordPress post data:', data);

      // Pre-fill your composer form fields
      setFormData({
        content: `${data.post_title}\n\n${data.excerpt}\n\n${data.post_url}`,
        images: data.featured_image ? [data.featured_image] : [],
        // ... other fields
      });

      // Optionally show a success notification
      toast.success('Post data loaded from WordPress!');
    }
  };

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, []);
```

### Option 3: Using URL Parameters

If you prefer to pass data via URL instead of postMessage, modify the WordPress plugin to open a URL like:

```
https://app.postquee.com/launches?from=wordpress&title=...&url=...&image=...&excerpt=...
```

Then read URL params in your composer:

```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  if (params.get('from') === 'wordpress') {
    const wpData = {
      title: params.get('title') || '',
      url: params.get('url') || '',
      image: params.get('image') || '',
      excerpt: params.get('excerpt') || ''
    };

    console.log('[PostQuee] Loading WordPress data from URL:', wpData);

    // Pre-fill composer
    setFormData({
      content: `${wpData.title}\n\n${wpData.excerpt}\n\n${wpData.url}`,
      images: wpData.image ? [wpData.image] : []
    });

    // Clean URL to remove params
    window.history.replaceState({}, '', '/launches');
  }
}, []);
```

## Testing the Integration

1. **Add the listener code** to your PostQuee application
2. **Deploy** the changes to `app.postquee.com`
3. **Open browser DevTools** console in WordPress admin
4. **Click "Send to PostQuee"** on a WordPress post
5. **Check console logs**:
   - WordPress side should show: `[PostQuee Bridge] Sending message (attempt X)`
   - PostQuee app should show: `[PostQuee App] Received WordPress post data`

## Debugging

If the integration isn't working:

1. **Check browser console** for both WordPress and PostQuee iframe
2. **Verify message structure** matches expected format
3. **Check iframe origin** - make sure postMessage isn't being blocked
4. **Test with simple alert**:

```javascript
window.addEventListener('message', (event) => {
  console.log('Received message:', event.data);
  if (event.data.type === 'create-post-from-wp') {
    alert('WordPress post received!');
  }
});
```

## Security Considerations

The WordPress plugin sends to wildcard origin (`'*'`) for compatibility with redirects. The PostQuee app should:

1. **Validate message structure** before processing
2. **Sanitize all data** before displaying
3. **Not execute arbitrary code** from message data
4. **Optionally validate origin** if you want to restrict to specific WordPress domains

## Next Steps

1. Choose an implementation approach (global listener, composer listener, or URL params)
2. Add the code to your PostQuee application
3. Deploy to production
4. Test the full workflow
5. Add visual feedback (loading state, success message, etc.)
