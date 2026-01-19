/**
 * WordPress REST API Client
 * Handles communication between React and WordPress REST endpoints
 */

interface WPFetchOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
}

interface WordPressGlobal {
  restUrl: string;
  nonce: string;
  apiKey: string;
  integrations: any[];
  ajaxUrl: string;
  user: string;
}

declare global {
  interface Window {
    postqueeWP: WordPressGlobal;
  }
}

/**
 * Fetch wrapper for WordPress REST API
 * Includes nonce authentication for security
 */
export const wpApiFetch = async <T = any>({ path, method = 'GET', data }: WPFetchOptions): Promise<T> => {
  const { restUrl, nonce } = window.postqueeWP;

  const url = `${restUrl}${path}`;

  console.log('[PostQuee Debug] API Call:', {
    restUrl,
    path,
    fullUrl: url,
    method
  });

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

/**
 * API Client for PostQuee Calendar
 */
export class CalendarAPI {
  /**
   * Fetch posts for calendar view
   */
  async getPosts(params: {
    startDate: string;
    endDate: string;
    customer?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return wpApiFetch({
      path: `posts?${queryParams}`,
      method: 'GET',
    });
  }

  /**
   * Create a new post
   */
  async createPost(data: any) {
    return wpApiFetch({
      path: 'posts',
      method: 'POST',
      data,
    });
  }

  /**
   * Update post date (for drag & drop)
   */
  async updatePostDate(postId: string, date: string) {
    return wpApiFetch({
      path: `posts/${postId}/date`,
      method: 'PUT',
      data: { date },
    });
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string) {
    return wpApiFetch({
      path: `posts/${postId}`,
      method: 'DELETE',
    });
  }

  /**
   * Get connected integrations/channels
   */
  getIntegrations() {
    // Already passed from PHP, return from window
    return window.postqueeWP.integrations || [];
  }
}

export const calendarAPI = new CalendarAPI();
