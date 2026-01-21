/**
 * Calendar Types
 * Based on PostQuee app data structures
 */

export interface Integration {
  id: string;
  name: string;
  identifier: string; // 'x', 'facebook', 'linkedin', 'instagram', 'pinterest', 'tiktok', etc.
  picture: string | null; // Profile picture URL (may be null)
  disabled: boolean; // Whether channel is disabled
  profile?: string; // JSON string with additional profile data
  customer?: {
    id: string;
    name: string;
  };
  // Legacy fields (might not be in API response)
  type?: string;
  inBetweenSteps?: boolean;
  refreshNeeded?: boolean;
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
  state: 'DRAFT' | 'QUEUE' | 'PUBLISHED' | 'ERROR'; // Actual API values
  integration: {
    id: string;
    providerIdentifier: string; // 'x', 'facebook', etc.
    name: string;
    picture: string | null;
  };
  content?: string; // Flattened from value[0].content
  value: PostValue[];
  settings?: any;
  releaseURL?: string | null;
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      color: string;
    };
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
