import React, { createContext, useContext } from 'react';
import { create } from 'zustand';
import useSWR from 'swr';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { calendarAPI } from '../shared/api/client';
import type { CalendarState, Integration, Post, ViewType } from './types';

dayjs.extend(isoWeek);

/**
 * Calendar state store (Zustand)
 */
export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentDate: new Date(),
  view: 'week' as ViewType,

  setCurrentDate: (date: Date) => set({ currentDate: date }),
  setView: (view: ViewType) => set({ view }),

  goToToday: () => set({ currentDate: new Date() }),

  goToPrevious: () => {
    const { currentDate, view } = get();
    const current = dayjs(currentDate);
    let newDate: dayjs.Dayjs;

    switch (view) {
      case 'day':
        newDate = current.subtract(1, 'day');
        break;
      case 'week':
        newDate = current.subtract(1, 'week');
        break;
      case 'month':
        newDate = current.subtract(1, 'month');
        break;
      default:
        newDate = current;
    }

    set({ currentDate: newDate.toDate() });
  },

  goToNext: () => {
    const { currentDate, view } = get();
    const current = dayjs(currentDate);
    let newDate: dayjs.Dayjs;

    switch (view) {
      case 'day':
        newDate = current.add(1, 'day');
        break;
      case 'week':
        newDate = current.add(1, 'week');
        break;
      case 'month':
        newDate = current.add(1, 'month');
        break;
      default:
        newDate = current;
    }

    set({ currentDate: newDate.toDate() });
  },
}));

/**
 * Calculate date range based on current view
 */
function getDateRange(currentDate: Date, view: ViewType): { start: string; end: string } {
  const current = dayjs(currentDate);

  switch (view) {
    case 'day':
      return {
        start: current.startOf('day').toISOString(),
        end: current.endOf('day').toISOString(),
      };
    case 'week':
      // ISO week starts on Monday
      return {
        start: current.startOf('isoWeek').toISOString(),
        end: current.endOf('isoWeek').toISOString(),
      };
    case 'month':
      // Include full weeks at start/end of month
      const monthStart = current.startOf('month');
      const monthEnd = current.endOf('month');
      return {
        start: monthStart.startOf('isoWeek').toISOString(),
        end: monthEnd.endOf('isoWeek').toISOString(),
      };
    default:
      return {
        start: current.startOf('week').toISOString(),
        end: current.endOf('week').toISOString(),
      };
  }
}

/**
 * Custom hook to fetch posts with SWR
 */
export function useCalendarPosts() {
  const { currentDate, view } = useCalendarStore();
  const { start, end } = getDateRange(currentDate, view);

  const { data, error, isLoading, mutate } = useSWR(
    `posts-${view}-${start}-${end}`,
    () => calendarAPI.getPosts({ startDate: start, endDate: end }),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      onErrorRetry: (error: any, key, config, revalidate, { retryCount }) => {
        // Never retry on 404 or 429
        if (error.status === 404 || error.status === 429) return;

        // Only retry up to 3 times
        if (retryCount >= 3) return;

        // Retry after 5 seconds
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  return {
    posts: Array.isArray(data) ? data : (data as any)?.posts || (data as any)?.data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Custom hook to get integrations
 */
export function useIntegrations(): Integration[] {
  return window.postqueeWP?.integrations || [];
}

/**
 * Calendar context for providing data to components
 */
interface CalendarContextType {
  posts: Post[];
  integrations: Integration[];
  isLoading: boolean;
  error: any;
  refresh: () => void;
  deletePost: (postId: string) => Promise<void>;
  reschedulePost: (postId: string, newDate: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | null>(null);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { posts, isLoading, error, refresh } = useCalendarPosts();
  const integrations = useIntegrations();

  const deletePost = async (postId: string) => {
    try {
      await calendarAPI.deletePost(postId);
      refresh(); // Refresh calendar after deletion
    } catch (err) {
      console.error('Failed to delete post:', err);
      throw err;
    }
  };

  const reschedulePost = async (postId: string, newDate: string) => {
    try {
      await calendarAPI.updatePostDate(postId, newDate);
      refresh(); // Refresh calendar after rescheduling
    } catch (err) {
      console.error('Failed to reschedule post:', err);
      throw err;
    }
  };

  return (
    <CalendarContext.Provider
      value={{ posts, integrations, isLoading, error, refresh, deletePost, reschedulePost }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarContext must be used within CalendarProvider');
  }
  return context;
};
