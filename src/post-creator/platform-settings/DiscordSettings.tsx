import React, { useEffect, useState } from 'react';
import type { PlatformSettingsProps } from './types';
import { useProviderFunction } from '../../helpers/useProviderFunction';

export const DiscordSettingsComponent: React.FC<
  PlatformSettingsProps<{ __type: 'discord'; channel: string }> & { integrationId: string }
> = ({ settings, onChange, integrationId }) => {
  const { callFunction, loading, error } = useProviderFunction();
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (integrationId) {
      callFunction(integrationId, 'channels')
        .then((data) => {
          if (Array.isArray(data)) {
            setChannels(data);
            // Auto-select first channel if none selected
            if (!settings.channel && data.length > 0) {
              onChange({ ...settings, channel: data[0].id });
            }
          }
        })
        .catch((e) => {
          console.error("Failed to load channels", e);
        });
    }
  }, [integrationId, callFunction]);

  const handleChannelChange = (channelId: string) => {
    onChange({
      ...settings,
      channel: channelId,
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-newTextColor">Discord Settings</h3>

      <div>
        <label className="block text-xs text-textItemBlur mb-2">
          Select Channel
        </label>

        {loading ? (
          <div className="text-xs text-textItemBlur">Loading channels...</div>
        ) : error ? (
          <div className="text-xs text-red-500">Error loading channels: {error}</div>
        ) : (
          <select
            value={settings.channel || ''}
            onChange={(e) => handleChannelChange(e.target.value)}
            className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:outline-none focus:ring-2 focus:ring-btnPrimary"
            required
          >
            <option value="">-- Select Channel --</option>
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>
        )}

        {channels.length === 0 && !loading && !error && (
          <p className="text-xs text-textItemBlur mt-2">No channels found for this Discord server.</p>
        )}
      </div>
    </div>
  );
};

