import React from 'react';
import type { InstagramSettings, PlatformSettingsProps } from './types';

/**
 * Instagram Platform Settings
 */
export const InstagramSettingsComponent: React.FC<PlatformSettingsProps<InstagramSettings>> = ({
  settings,
  onChange,
}) => {
  const handlePostTypeChange = (value: InstagramSettings['post_type']) => {
    onChange({ ...settings, post_type: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-newTextColor">Instagram Settings</h3>

      {/* Post Type */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">Post type *</label>
        <select
          value={settings.post_type || 'post'}
          onChange={(e) => handlePostTypeChange(e.target.value as InstagramSettings['post_type'])}
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
          required
        >
          <option value="post">Post (Feed)</option>
          <option value="story">Story</option>
        </select>
        <p className="mt-1 text-xs text-textItemBlur">
          Choose whether to post to feed or stories
        </p>
      </div>
    </div>
  );
};
