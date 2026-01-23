import React, { useState, useEffect } from 'react';
import type { PlatformSettingsProps } from './types';
import { calendarAPI } from '../../shared/api/client';

interface Channel {
  id: string;
  name: string;
}

export const DiscordSettingsComponent: React.FC<
  PlatformSettingsProps<{ __type: 'discord'; channel?: string }> & { integrationId: string }
> = ({ settings, onChange, integrationId }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannels() {
      try {
        setLoading(true);
        const result = await calendarAPI.getIntegrationChannels(integrationId);
        setChannels(result);
      } catch (err: any) {
        console.error('Failed to fetch Discord channels:', err);
        setError(err.message || 'Failed to load channels');
      } finally {
        setLoading(false);
      }
    }

    fetchChannels();
  }, [integrationId]);

  const handleChannelChange = (channelId: string) => {
    onChange({
      ...settings,
      channel: channelId,
    });
  };

  if (loading) {
    return (
      <div className="text-sm text-textItemBlur text-center py-4">
        Loading Discord channels...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 text-center py-4">
        {error}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="text-sm text-textItemBlur text-center py-4">
        No channels available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-newTextColor">
        Discord Channel *
      </label>
      <select
        value={settings.channel || ''}
        onChange={(e) => handleChannelChange(e.target.value)}
        className="w-full px-3 py-2 bg-newBgColorInner border border-newBorder rounded text-newTextColor focus:outline-none focus:ring-2 focus:ring-btnPrimary"
        required
      >
        <option value="">Select a channel</option>
        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            #{channel.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-textItemBlur">
        Select the Discord channel where this post will be published
      </p>
    </div>
  );
};
