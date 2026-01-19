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

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...settings, location: e.target.value });
  };

  const handleCollaboratorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const collaborators = e.target.value.split(',').map((c) => c.trim()).filter(Boolean);
    onChange({ ...settings, collaborators });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-newTextColor">Instagram Settings</h3>

      {/* Post Type */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">Post type</label>
        <select
          value={settings.post_type || 'post'}
          onChange={(e) => handlePostTypeChange(e.target.value as InstagramSettings['post_type'])}
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
        >
          <option value="post">Post</option>
          <option value="reel">Reel</option>
          <option value="story">Story</option>
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

      {/* Collaborators */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">
          Collaborators (optional)
        </label>
        <input
          type="text"
          value={settings.collaborators?.join(', ') || ''}
          onChange={handleCollaboratorsChange}
          placeholder="@username1, @username2"
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor placeholder-textItemBlur focus:border-btnPrimary focus:outline-none"
        />
        <p className="mt-1 text-xs text-textItemBlur">
          Tag collaborators for this post
        </p>
      </div>
    </div>
  );
};
