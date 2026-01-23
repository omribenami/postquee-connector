import React from 'react';
import type { PlatformSettingsProps, YouTubeSettings } from './types';

export const YouTubeSettingsComponent: React.FC<PlatformSettingsProps<YouTubeSettings>> = ({ settings, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-newTextColor">YouTube Settings</h3>

      {/* Title */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">
          Title * (2-100 chars)
        </label>
        <input
          type="text"
          value={settings.title || ''}
          onChange={(e) => onChange({ ...settings, title: e.target.value })}
          placeholder="Enter video title"
          minLength={2}
          maxLength={100}
          required
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor placeholder-textItemBlur focus:border-btnPrimary focus:outline-none"
        />
      </div>

      {/* Privacy/Type */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">Privacy *</label>
        <select
          value={settings.type || 'public'}
          onChange={(e) => onChange({ ...settings, type: e.target.value as 'public' | 'private' | 'unlisted' })}
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
          required
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Made for Kids */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">Made for Kids (optional)</label>
        <select
          value={settings.selfDeclaredMadeForKids || ''}
          onChange={(e) => onChange({ ...settings, selfDeclaredMadeForKids: (e.target.value || undefined) as 'yes' | 'no' | undefined })}
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
        >
          <option value="">Not specified</option>
          <option value="yes">Yes, made for kids</option>
          <option value="no">No, not made for kids</option>
        </select>
      </div>
    </div>
  );
};
