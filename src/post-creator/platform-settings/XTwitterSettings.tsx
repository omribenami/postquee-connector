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
        <label className="block text-xs text-textItemBlur mb-2">Who can reply *</label>
        <select
          value={settings.who_can_reply_post || 'everyone'}
          onChange={(e) => handleReplyChange(e.target.value as XTwitterSettings['who_can_reply_post'])}
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
          required
        >
          <option value="everyone">Everyone</option>
          <option value="following">People you follow</option>
          <option value="mentionedUsers">Only people you mention</option>
          <option value="subscribers">Subscribers only</option>
          <option value="verified">Verified accounts</option>
        </select>
      </div>

      {/* Community URL */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">
          Community URL (optional)
        </label>
        <input
          type="url"
          value={settings.community || ''}
          onChange={handleCommunityChange}
          placeholder="https://x.com/i/communities/[id]"
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor placeholder-textItemBlur focus:border-btnPrimary focus:outline-none"
          pattern="^(https:\/\/x\.com\/i\/communities\/\d+)?$"
        />
        <p className="mt-1 text-xs text-textItemBlur">
          Optional: Post to a specific X community
        </p>
      </div>
    </div>
  );
};
