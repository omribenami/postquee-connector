/**
 * Platform-specific settings types
 * Based on PostQuee API requirements
 */

export interface XTwitterSettings {
  __type: 'x';
  who_can_reply_post?: 'everyone' | 'verified' | 'following' | 'mentioned';
  community?: string; // Community ID
}

export interface FacebookSettings {
  __type: 'facebook';
  privacy?: 'public' | 'friends' | 'only_me';
  location?: string;
  tags?: string[];
}

export interface LinkedInSettings {
  __type: 'linkedin';
  visibility?: 'public' | 'connections';
  carousel?: boolean;
}

export interface InstagramSettings {
  __type: 'instagram';
  post_type?: 'post' | 'reel' | 'story';
  collaborators?: string[];
  location?: string;
}

export interface ThreadsSettings {
  __type: 'threads';
  who_can_reply?: 'everyone' | 'following' | 'mentioned';
}

export interface TikTokSettings {
  __type: 'tiktok';
  privacy?: 'public' | 'friends' | 'private';
  allow_comments?: boolean;
  allow_duet?: boolean;
  allow_stitch?: boolean;
  ai_disclosure?: boolean;
}

export interface PinterestSettings {
  __type: 'pinterest';
  board_id?: string;
  title?: string;
  link?: string;
}

export interface YouTubeSettings {
  __type: 'youtube';
  title: string;
  description?: string;
  privacy?: 'public' | 'unlisted' | 'private';
  made_for_kids?: boolean;
}

export type PlatformSettings =
  | XTwitterSettings
  | FacebookSettings
  | LinkedInSettings
  | InstagramSettings
  | ThreadsSettings
  | TikTokSettings
  | PinterestSettings
  | YouTubeSettings;

export interface PlatformSettingsProps<T extends PlatformSettings> {
  settings: T;
  onChange: (settings: T) => void;
}
