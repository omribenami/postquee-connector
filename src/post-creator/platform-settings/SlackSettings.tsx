import React from 'react';
import type { PlatformSettingsProps } from './types';

export const SlackSettingsComponent: React.FC<
  PlatformSettingsProps<{ __type: 'slack'; channel: string }> & { integrationId: string }
> = ({ settings, onChange }) => {
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
          Channel ID *
        </label>
        <input
          type="text"
          value={settings.channel || ''}
          onChange={(e) => handleChannelChange(e.target.value)}
          placeholder="Enter Slack channel ID (e.g., C01234ABCDE)"
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:outline-none focus:ring-2 focus:ring-btnPrimary placeholder-textItemBlur"
          required
        />
        <div className="text-xs text-textItemBlur space-y-1 mt-2">
          <p>To find your Slack channel ID:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Open Slack in your browser (not desktop app)</li>
            <li>Navigate to the channel</li>
            <li>The channel ID is in the URL: slack.com/messages/<strong>C01234ABCDE</strong></li>
            <li>Copy the ID (starts with C) and paste it here</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
