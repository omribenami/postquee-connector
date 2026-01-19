import React from 'react';
import type { LinkedInSettings, PlatformSettingsProps } from './types';

/**
 * LinkedIn Platform Settings
 */
export const LinkedInSettingsComponent: React.FC<PlatformSettingsProps<LinkedInSettings>> = ({
  settings,
  onChange,
}) => {
  const handleVisibilityChange = (value: LinkedInSettings['visibility']) => {
    onChange({ ...settings, visibility: value });
  };

  const handleCarouselChange = (checked: boolean) => {
    onChange({ ...settings, carousel: checked });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-newTextColor">LinkedIn Settings</h3>

      {/* Visibility */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">Visibility</label>
        <select
          value={settings.visibility || 'public'}
          onChange={(e) => handleVisibilityChange(e.target.value as LinkedInSettings['visibility'])}
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
        >
          <option value="public">Public</option>
          <option value="connections">Connections only</option>
        </select>
      </div>

      {/* Carousel */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.carousel || false}
            onChange={(e) => handleCarouselChange(e.target.checked)}
            className="w-4 h-4 rounded border-newBorder bg-newBgColor text-btnPrimary focus:ring-btnPrimary focus:ring-offset-0"
          />
          <span className="text-sm text-newTextColor">Post as carousel</span>
        </label>
        <p className="mt-1 text-xs text-textItemBlur ml-6">
          Convert multiple images into a LinkedIn carousel post
        </p>
      </div>
    </div>
  );
};
