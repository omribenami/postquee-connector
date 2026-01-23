import React from 'react';
import type { PlatformSettingsProps } from './types';

export const DiscordSettingsComponent: React.FC<
  PlatformSettingsProps<{ __type: 'discord'; channel: string }> & { integrationId: string }
> = ({ settings, onChange }) => {
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
          Channel ID *
        </label>
        <input
          type="text"
          value={settings.channel || ''}
          onChange={(e) => handleChannelChange(e.target.value)}
          placeholder="Enter Discord channel ID"
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:outline-none focus:ring-2 focus:ring-btnPrimary placeholder-textItemBlur"
          required
        />
        <div className="text-xs text-textItemBlur space-y-1 mt-2">
          <p>To find your Discord channel ID:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Enable Developer Mode in Discord: User Settings → Advanced → Developer Mode</li>
            <li>Right-click on the channel in Discord</li>
            <li>Click "Copy Channel ID"</li>
            <li>Paste the ID here</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
