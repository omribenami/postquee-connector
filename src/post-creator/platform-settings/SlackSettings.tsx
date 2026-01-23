import React, { useState, useEffect } from 'react';
import type { PlatformSettingsProps } from './types';
import { useProviderFunction } from '../../shared/api/provider-functions';

interface Channel {
  id: string;
  name: string;
}

export const SlackSettingsComponent: React.FC<
  PlatformSettingsProps<{ __type: 'slack'; channel: string }> & { integrationId: string }
> = ({ settings, onChange, integrationId }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { call } = useProviderFunction();

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await call<Channel[]>(integrationId, 'channels');
        setChannels(result || []);
      } catch (err: any) {
        console.error('Failed to fetch Slack channels:', err);
        setError(err.message || 'Failed to load channels');
        setChannels([]);
      } finally {
        setLoading(false);
      }
    };

    if (integrationId) {
      fetchChannels();
    }
  }, [integrationId]);

  const handleChannelChange = (channelId: string) => {
    onChange({
      ...settings,
      channel: channelId,
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-newTextColor">Slack Settings</h3>

      <div>
        <label className="block text-xs text-textItemBlur mb-2">
          Channel *
        </label>
        {loading ? (
          <div className="text-sm text-textItemBlur">Loading channels...</div>
        ) : error || channels.length === 0 ? (
          <>
            <input
              type="text"
              value={settings.channel || ''}
              onChange={(e) => handleChannelChange(e.target.value)}
              placeholder="Enter Slack channel ID (e.g., C01234ABCDE)"
              className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:outline-none focus:ring-2 focus:ring-btnPrimary placeholder-textItemBlur"
              required
            />
            {error && (
              <p className="text-xs text-red-400 mt-1">{error}</p>
            )}
            <div className="text-xs text-textItemBlur space-y-1 mt-2">
              <p>To find your Slack channel ID:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Open Slack in your browser (not desktop app)</li>
                <li>Navigate to the channel</li>
                <li>The channel ID is in the URL: slack.com/messages/<strong>C01234ABCDE</strong></li>
                <li>Copy the ID (starts with C) and paste it here</li>
              </ol>
            </div>
          </>
        ) : (
          <select
            value={settings.channel || ''}
            onChange={(e) => handleChannelChange(e.target.value)}
            className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:outline-none focus:ring-2 focus:ring-btnPrimary"
            required
          >
            <option value="">Select a channel...</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
