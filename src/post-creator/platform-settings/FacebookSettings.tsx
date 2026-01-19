import React from 'react';
import type { FacebookSettings, PlatformSettingsProps } from './types';

/**
 * Facebook Platform Settings
 */
export const FacebookSettingsComponent: React.FC<PlatformSettingsProps<FacebookSettings>> = ({
  settings,
  onChange,
}) => {
  const handlePrivacyChange = (value: FacebookSettings['privacy']) => {
    onChange({ ...settings, privacy: value });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...settings, location: e.target.value });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
    onChange({ ...settings, tags });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-newTextColor">Facebook Settings</h3>

      {/* Privacy */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">Privacy</label>
        <select
          value={settings.privacy || 'public'}
          onChange={(e) => handlePrivacyChange(e.target.value as FacebookSettings['privacy'])}
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
        >
          <option value="public">Public</option>
          <option value="friends">Friends</option>
          <option value="only_me">Only me</option>
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">
          Location (optional)
        </label>
        <input
          type="text"
          value={settings.location || ''}
          onChange={handleLocationChange}
          placeholder="Add a location"
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor placeholder-textItemBlur focus:border-btnPrimary focus:outline-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">
          Tags (optional)
        </label>
        <input
          type="text"
          value={settings.tags?.join(', ') || ''}
          onChange={handleTagsChange}
          placeholder="tag1, tag2, tag3"
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor placeholder-textItemBlur focus:border-btnPrimary focus:outline-none"
        />
        <p className="mt-1 text-xs text-textItemBlur">
          Separate multiple tags with commas
        </p>
      </div>
    </div>
  );
};
