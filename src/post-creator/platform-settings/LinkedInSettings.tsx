import React from 'react';
import type { LinkedInSettings, PlatformSettingsProps } from './types';

/**
 * LinkedIn Platform Settings
 */
export const LinkedInSettingsComponent: React.FC<PlatformSettingsProps<LinkedInSettings>> = ({
  settings,
  onChange,
}) => {
  const handleCarouselChange = (checked: boolean) => {
    onChange({ ...settings, post_as_images_carousel: checked });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-newTextColor">LinkedIn Settings</h3>

      {/* Carousel */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.post_as_images_carousel || false}
            onChange={(e) => handleCarouselChange(e.target.checked)}
            className="w-4 h-4 rounded border-newBorder bg-newBgColor text-btnPrimary focus:ring-btnPrimary focus:ring-offset-0"
          />
          <span className="text-sm text-newTextColor">Post as images carousel</span>
        </label>
        <p className="mt-1 text-xs text-textItemBlur ml-6">
          Convert multiple images into a LinkedIn carousel post
        </p>
      </div>
    </div>
  );
};
