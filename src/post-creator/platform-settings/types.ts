/**
 * Platform-specific settings types
 * Based on PostQuee API DTOs - exactly matching backend requirements
 */

export interface XTwitterSettings {
  __type: 'x';
  who_can_reply_post: 'everyone' | 'following' | 'mentionedUsers' | 'subscribers' | 'verified';
  community?: string; // Optional: https://x.com/i/communities/[id]
}

export interface FacebookSettings {
  __type: 'facebook';
  url?: string; // Optional URL
}

export interface LinkedInSettings {
  __type: 'linkedin';
  post_as_images_carousel?: boolean; // Optional
}

export interface InstagramSettings {
  __type: 'instagram';
  post_type: 'post' | 'story'; // Required
  collaborators?: Array<{ id: string; name: string }>; // Optional
}

export interface ThreadsSettings {
  __type: 'threads';
  // No settings required
}

export interface TikTokSettings {
  __type: 'tiktok';
  title?: string; // Optional, max 90 chars
  privacy_level: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY';
  duet: boolean;
  stitch: boolean;
  comment: boolean;
  autoAddMusic: 'yes' | 'no';
  brand_content_toggle: boolean;
  video_made_with_ai?: boolean;
  brand_organic_toggle: boolean;
  content_posting_method: 'DIRECT_POST' | 'UPLOAD';
}

export interface PinterestSettings {
  __type: 'pinterest';
  board: string; // Required - Board ID
  title?: string; // Optional, max 100 chars
  link?: string; // Optional URL
  dominant_color?: string; // Optional
}

export interface YouTubeSettings {
  __type: 'youtube';
  title: string; // Required, 2-100 chars
  type: 'public' | 'private' | 'unlisted'; // Required
  selfDeclaredMadeForKids?: 'yes' | 'no'; // Optional
  tags?: Array<{ id: string; name: string }>; // Optional
}

export interface DiscordSettings {
  __type: 'discord';
  channel: string; // Required - Channel ID
}

export interface SlackSettings {
  __type: 'slack';
  channel: string; // Required - Channel ID
}

export interface RedditSettings {
  __type: 'reddit';
  subreddit: Array<{
    subreddit: string; // Required, min 2 chars
    title: string; // Required, min 2 chars
    type: 'self' | 'link' | 'media'; // Required
    url?: string; // Required if type='link'
    is_flair_required: boolean; // Required
    flair?: { id: string; name: string }; // Required if is_flair_required
  }>;
}

export interface MediumSettings {
  __type: 'medium';
  title: string; // Required, min 6 chars
  subtitle?: string; // Optional, min 2 chars
  publication?: string; // Required - Publication ID
  tags?: Array<{ id: string; name: string }>; // Optional
}

export interface HashnodeSettings {
  __type: 'hashnode';
  title: string; // Required, min 6 chars
  subtitle?: string; // Optional, min 2 chars
  publication: string; // Required - Publication ID
  tags: Array<{ id: string; name: string }>; // Required - at least one
  canonical?: string; // Optional URL
}

export interface DevToSettings {
  __type: 'dev.to';
  title: string; // Required
  tags?: Array<{ id: string; name: string }>; // Optional
  organization?: string; // Optional - Organization ID
}

export interface WordPressSettings {
  __type: 'wordpress';
  title: string; // Required
  type: 'post' | 'page'; // Required
}

export interface LemmySettings {
  __type: 'lemmy';
  subreddit: Array<{
    subreddit: string; // Required - Instance name
    title: string; // Required
  }>;
}

export interface DribbbleSettings {
  __type: 'dribbble';
  title: string; // Required
  team?: string; // Optional - Team ID
}

export interface ListmonkSettings {
  __type: 'listmonk';
  subject: string; // Required, min 1 char
  preview: string; // Required
  list: string; // Required - List ID
  template?: string; // Optional - Template ID
}

export interface GMBSettings {
  __type: 'gmb';
  topicType?: string; // Optional
  callToAction?: {
    actionType?: string;
    url?: string;
  };
}

export interface FarcasterSettings {
  __type: 'farcaster';
  subreddit?: Array<{ id: string; name: string }>; // Optional - Channels
}

export interface MastodonSettings {
  __type: 'mastodon';
  // No settings required
}

export interface BlueskySettings {
  __type: 'bluesky';
  // No settings required
}

export interface TelegramSettings {
  __type: 'telegram';
  // No settings required
}

export interface NostrSettings {
  __type: 'nostr';
  // No settings required
}

export interface VKSettings {
  __type: 'vk';
  // No settings required
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
  | SlackSettings
  | RedditSettings
  | MediumSettings
  | HashnodeSettings
  | DevToSettings
  | WordPressSettings
  | LemmySettings
  | DribbbleSettings
  | ListmonkSettings
  | GMBSettings
  | FarcasterSettings
  | MastodonSettings
  | BlueskySettings
  | TelegramSettings
  | NostrSettings
  | VKSettings;

export interface PlatformSettingsProps<T extends PlatformSettings> {
  settings: T;
  onChange: (settings: T) => void;
}
