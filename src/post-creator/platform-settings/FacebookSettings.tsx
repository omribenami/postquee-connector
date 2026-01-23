import React from 'react';
import type { FacebookSettings, PlatformSettingsProps } from './types';

/**
 * Facebook Platform Settings
 */
export const FacebookSettingsComponent: React.FC<PlatformSettingsProps<FacebookSettings>> = ({
  settings,
  onChange,
}) => {
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...settings, url: e.target.value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-newTextColor">Facebook Settings</h3>

      {/* URL */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">
          URL (optional)
        </label>
        <input
          type="url"
          value={settings.url || ''}
          onChange={handleUrlChange}
          placeholder="https://example.com"
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor placeholder-textItemBlur focus:border-btnPrimary focus:outline-none"
        />
        <p className="mt-1 text-xs text-textItemBlur">
          Optional URL to attach to the post
        </p>
      </div>
    </div>
  );
};
