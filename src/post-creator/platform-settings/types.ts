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
  privacy_level?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY';
  duet?: boolean;
  stitch?: boolean;
  comment?: boolean;
  autoAddMusic?: boolean;
  brand_organic_toggle?: boolean;
  content_posting_method?: 'DIRECT_POST' | 'UPLOAD';
}

export interface PinterestSettings {
  __type: 'pinterest';
  // API expects 'Board' with capital B sometimes, or 'board' depending on validation.
  // Based on error: "posts.0.settings.Board is required"
  // So likely the API wants 'Board' or maybe 'board'. Let's ensure we send something.
  // Actually, standard practice is lowercase in TS interfaces, mapping happens later if needed.
  // But wait! The error clearly says "Board". Let's use 'Board' in the payload.
  // We'll keep the interface cleaner and map it before sending if possible, or just use 'Board' here.
  Board?: string; // Changed from board_id to match likely API requirement seen in error
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

export interface DiscordSettings {
  __type: 'discord';
  channel?: string; // Channel ID
}

export interface SlackSettings {
  __type: 'slack';
  channel?: string; // Channel ID
}

export type PlatformSettings =
  | XTwitterSettings
  | FacebookSettings
  | LinkedInSettings
  | InstagramSettings
  | ThreadsSettings
  | TikTokSettings
  | PinterestSettings
  | YouTubeSettings
  | DiscordSettings
  | SlackSettings;

export interface PlatformSettingsProps<T extends PlatformSettings> {
  settings: T;
  onChange: (settings: T) => void;
}
