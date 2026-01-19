/**
 * Calendar Types
 * Based on PostQuee app data structures
 */

export interface Integration {
  id: string;
  name: string;
  identifier: string; // 'twitter', 'linkedin', etc.
  picture: string;
  type: string;
  inBetweenSteps: boolean;
  disabled: boolean;
  refreshNeeded: boolean;
  time?: {
    time: number;
  }[];
}

export interface PostValue {
  id: string;
  content: string;
  image: Array<{
    id: string;
    path: string;
    alt?: string;
    thumbnail?: string;
    thumbnailTimestamp?: number;
  }>;
}

export interface Post {
  id: string;
  group: string;
  publishDate: string; // ISO 8601 date
  state: 'schedule' | 'draft' | 'published';
  integration: Integration;
  value: PostValue[];
  settings?: any;
  tags?: Array<{
    label: string;
    value: string;
  }>;
}

export type ViewType = 'day' | 'week' | 'month';

export interface CalendarState {
  currentDate: Date;
  view: ViewType;
  setCurrentDate: (date: Date) => void;
  setView: (view: ViewType) => void;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
}
