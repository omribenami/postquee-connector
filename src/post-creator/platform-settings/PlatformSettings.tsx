import React, { useState, useEffect } from 'react';
import type { Integration } from '../../calendar/types';
import type { PlatformSettings as PlatformSettingsType } from './types';
import { XTwitterSettingsComponent } from './XTwitterSettings';
import { FacebookSettingsComponent } from './FacebookSettings';
import { LinkedInSettingsComponent } from './LinkedInSettings';
import { InstagramSettingsComponent } from './InstagramSettings';
import { PinterestSettingsComponent } from './PinterestSettings';
import { DiscordSettingsComponent } from './DiscordSettings';
import { SlackSettingsComponent } from './SlackSettings';
import { TikTokSettingsComponent } from './TikTokSettings';
import { YouTubeSettingsComponent } from './YouTubeSettings';

interface PlatformSettingsProps {
  integration: Integration;
  onChange: (settings: PlatformSettingsType) => void;
}

/**
 * Map integration provider to platform type
 */
export const getPlatformType = (provider: string): PlatformSettingsType['__type'] | null => {
  const providerLower = provider.toLowerCase();

  // Social Media Platforms
  if (providerLower.includes('twitter') || providerLower === 'x') return 'x';
  if (providerLower.includes('facebook')) return 'facebook';
  if (providerLower.includes('instagram')) return 'instagram';
  if (providerLower.includes('linkedin')) return 'linkedin';
  if (providerLower.includes('threads')) return 'threads';
  if (providerLower.includes('tiktok')) return 'tiktok';
  if (providerLower.includes('pinterest')) return 'pinterest';
  if (providerLower.includes('youtube')) return 'youtube';
  if (providerLower.includes('reddit')) return 'reddit';
  if (providerLower.includes('mastodon')) return 'mastodon';
  if (providerLower.includes('bluesky')) return 'bluesky';

  // Messaging Platforms
  if (providerLower.includes('discord')) return 'discord';
  if (providerLower.includes('slack')) return 'slack';
  if (providerLower.includes('telegram')) return 'telegram';

  // Blogging Platforms
  if (providerLower.includes('medium')) return 'medium';
  if (providerLower.includes('hashnode')) return 'hashnode';
  if (providerLower.includes('dev.to') || providerLower.includes('dev-to')) return 'dev.to';
  if (providerLower.includes('wordpress')) return 'wordpress';

  // Other Platforms
  if (providerLower.includes('lemmy')) return 'lemmy';
  if (providerLower.includes('dribbble')) return 'dribbble';
  if (providerLower.includes('listmonk')) return 'listmonk';
  if (providerLower.includes('gmb') || providerLower.includes('google my business')) return 'gmb';
  if (providerLower.includes('farcaster') || providerLower.includes('warpcast')) return 'farcaster';
  if (providerLower.includes('nostr')) return 'nostr';
  if (providerLower.includes('vk')) return 'vk';

  return null;
};

/**
 * Platform Settings Wrapper Component
 * Conditionally renders platform-specific settings
 */
export const PlatformSettings: React.FC<PlatformSettingsProps> = ({ integration, onChange }) => {
  const platformType = getPlatformType(integration.identifier);

  // Initialize settings with default values based on platform
  const [settings, setSettings] = useState<PlatformSettingsType>(() => {
    switch (platformType) {
      // Social Media
      case 'x':
        return { __type: 'x', who_can_reply_post: 'everyone' };
      case 'facebook':
        return { __type: 'facebook' };
      case 'linkedin':
        return { __type: 'linkedin' };
      case 'instagram':
        return { __type: 'instagram', post_type: 'post' };
      case 'threads':
        return { __type: 'threads' };
      case 'tiktok':
        return {
          __type: 'tiktok',
          privacy_level: 'PUBLIC_TO_EVERYONE',
          duet: true,
          stitch: true,
          comment: true,
          autoAddMusic: 'no',
          brand_content_toggle: false,
          brand_organic_toggle: false,
          content_posting_method: 'DIRECT_POST',
        };
      case 'pinterest':
        return { __type: 'pinterest', board: '' };
      case 'youtube':
        return { __type: 'youtube', title: '', type: 'public' };
      case 'mastodon':
        return { __type: 'mastodon' };
      case 'bluesky':
        return { __type: 'bluesky' };

      // Messaging
      case 'discord':
        return { __type: 'discord', channel: '' };
      case 'slack':
        return { __type: 'slack', channel: '' };
      case 'telegram':
        return { __type: 'telegram' };

      // Blogging
      case 'medium':
        return { __type: 'medium', title: '', publication: '', tags: [] };
      case 'hashnode':
        return { __type: 'hashnode', title: '', publication: '', tags: [] };
      case 'dev.to':
        return { __type: 'dev.to', title: '' };
      case 'wordpress':
        return { __type: 'wordpress', title: '', type: 'post' };

      // Other
      case 'reddit':
        return { __type: 'reddit', subreddit: [] };
      case 'lemmy':
        return { __type: 'lemmy', subreddit: [] };
      case 'dribbble':
        return { __type: 'dribbble', title: '' };
      case 'listmonk':
        return { __type: 'listmonk', subject: '', preview: '', list: '' };
      case 'gmb':
        return { __type: 'gmb' };
      case 'farcaster':
        return { __type: 'farcaster' };
      case 'nostr':
        return { __type: 'nostr' };
      case 'vk':
        return { __type: 'vk' };

      default:
        return { __type: 'x', who_can_reply_post: 'everyone' }; // Fallback
    }
  });

  // Notify parent when settings change
  useEffect(() => {
    onChange(settings);
  }, [settings, onChange]);

  const handleSettingsChange = (newSettings: PlatformSettingsType) => {
    setSettings(newSettings);
  };

  // If platform doesn't support custom settings, show nothing
  if (!platformType) {
    return null;
  }

  return (
    <div className="bg-newBgColorInner rounded-lg border border-newBorder p-4">
      {platformType === 'x' && settings.__type === 'x' && (
        <XTwitterSettingsComponent settings={settings} onChange={handleSettingsChange} />
      )}

      {platformType === 'facebook' && settings.__type === 'facebook' && (
        <FacebookSettingsComponent settings={settings} onChange={handleSettingsChange} />
      )}

      {platformType === 'linkedin' && settings.__type === 'linkedin' && (
        <LinkedInSettingsComponent settings={settings} onChange={handleSettingsChange} />
      )}

      {platformType === 'instagram' && settings.__type === 'instagram' && (
        <InstagramSettingsComponent settings={settings} onChange={handleSettingsChange} />
      )}

      {/* Pinterest Settings */}
      {platformType === 'pinterest' && settings.__type === 'pinterest' && (
        <PinterestSettingsComponent
          settings={settings}
          onChange={handleSettingsChange}
          integration={integration}
        />
      )}

      {/* Discord Settings */}
      {platformType === 'discord' && settings.__type === 'discord' && (
        <DiscordSettingsComponent
          settings={settings}
          onChange={handleSettingsChange}
          integrationId={integration.id}
        />
      )}

      {/* Slack Settings */}
      {platformType === 'slack' && settings.__type === 'slack' && (
        <SlackSettingsComponent
          settings={settings}
          onChange={handleSettingsChange}
          integrationId={integration.id}
        />
      )}

      {/* TikTok Settings */}
      {platformType === 'tiktok' && settings.__type === 'tiktok' && (
        <TikTokSettingsComponent settings={settings} onChange={handleSettingsChange} />
      )}

      {/* YouTube Settings */}
      {platformType === 'youtube' && settings.__type === 'youtube' && (
        <YouTubeSettingsComponent settings={settings} onChange={handleSettingsChange} />
      )}

      {/* Platforms with no additional settings or not yet implemented */}
      {(platformType && !['x', 'facebook', 'linkedin', 'instagram', 'discord', 'slack', 'tiktok', 'pinterest', 'youtube'].includes(platformType)) && (
        <div className="text-sm text-textItemBlur text-center py-4">
          {['threads', 'mastodon', 'bluesky', 'telegram', 'nostr', 'vk'].includes(platformType)
            ? `${integration.identifier} - No additional settings required`
            : `Advanced settings for ${integration.identifier} coming soon`}
        </div>
      )}
    </div>
  );
};
