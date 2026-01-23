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

interface PlatformSettingsProps {
  integration: Integration;
  onChange: (settings: PlatformSettingsType) => void;
}

/**
 * Map integration provider to platform type
 */
export const getPlatformType = (provider: string): PlatformSettingsType['__type'] | null => {
  const providerLower = provider.toLowerCase();

  if (providerLower.includes('twitter') || providerLower === 'x') {
    return 'x';
  }
  if (providerLower.includes('discord')) {
    return 'discord';
  }
  if (providerLower.includes('slack')) {
    return 'slack';
  }
  if (providerLower.includes('facebook')) {
    return 'facebook';
  }
  if (providerLower.includes('linkedin')) {
    return 'linkedin';
  }
  if (providerLower.includes('instagram')) {
    return 'instagram';
  }
  if (providerLower.includes('threads')) {
    return 'threads';
  }
  if (providerLower.includes('tiktok')) {
    return 'tiktok';
  }
  if (providerLower.includes('pinterest')) {
    return 'pinterest';
  }
  if (providerLower.includes('youtube')) {
    return 'youtube';
  }

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
      case 'x':
        return { __type: 'x', who_can_reply_post: 'everyone' };
      case 'facebook':
        return { __type: 'facebook', privacy: 'public' };
      case 'linkedin':
        return { __type: 'linkedin', visibility: 'public' };
      case 'instagram':
        return { __type: 'instagram', post_type: 'post' };
      case 'discord':
        return { __type: 'discord', channel: '' };
      case 'slack':
        return { __type: 'slack', channel: '' };
      case 'threads':
        return { __type: 'threads', who_can_reply: 'everyone' };
      case 'tiktok':
        return {
          __type: 'tiktok',
          privacy_level: 'PUBLIC_TO_EVERYONE',
          duet: true,
          stitch: true,
          comment: true,
          autoAddMusic: false,
          brand_organic_toggle: false,
          content_posting_method: 'DIRECT_POST',
        };
      case 'pinterest':
        return { __type: 'pinterest' };
      case 'youtube':
        return { __type: 'youtube', title: '', privacy: 'public' };
      default:
        return { __type: 'x' }; // Fallback
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

      {/* Additional platforms can be added here */}
      {(platformType === 'threads' || platformType === 'tiktok' || platformType === 'youtube') && (
        <div className="text-sm text-textItemBlur text-center py-4">
          Advanced settings for {integration.identifier} coming soon
        </div>
      )}
    </div>
  );
};
