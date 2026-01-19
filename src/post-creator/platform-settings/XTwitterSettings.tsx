import React from 'react';
import type { XTwitterSettings, PlatformSettingsProps } from './types';

/**
 * X/Twitter Platform Settings
 */
export const XTwitterSettingsComponent: React.FC<PlatformSettingsProps<XTwitterSettings>> = ({
  settings,
  onChange,
}) => {
  const handleReplyChange = (value: XTwitterSettings['who_can_reply_post']) => {
    onChange({ ...settings, who_can_reply_post: value });
  };

  const handleCommunityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...settings, community: e.target.value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-newTextColor">X (Twitter) Settings</h3>

      {/* Who can reply */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">Who can reply</label>
        <select
          value={settings.who_can_reply_post || 'everyone'}
          onChange={(e) => handleReplyChange(e.target.value as XTwitterSettings['who_can_reply_post'])}
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
        >
          <option value="everyone">Everyone</option>
          <option value="verified">Verified accounts only</option>
          <option value="following">People you follow</option>
          <option value="mentioned">Only people you mention</option>
        </select>
      </div>

      {/* Community ID */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">
          Community ID (optional)
        </label>
        <input
          type="text"
          value={settings.community || ''}
          onChange={handleCommunityChange}
          placeholder="Enter community ID"
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor placeholder-textItemBlur focus:border-btnPrimary focus:outline-none"
        />
        <p className="mt-1 text-xs text-textItemBlur">
          Post to a specific X community
        </p>
      </div>
    </div>
  );
};
