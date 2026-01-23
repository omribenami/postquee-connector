import React from 'react';
import type { PlatformSettingsProps, TikTokSettings } from './types';

export const TikTokSettingsComponent: React.FC<PlatformSettingsProps<TikTokSettings>> = ({ settings, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-newTextColor">TikTok Settings</h3>

      {/* Title */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">
          Title (optional, max 90 chars)
        </label>
        <input
          type="text"
          value={settings.title || ''}
          onChange={(e) => onChange({ ...settings, title: e.target.value })}
          placeholder="Enter video title"
          maxLength={90}
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor placeholder-textItemBlur focus:border-btnPrimary focus:outline-none"
        />
      </div>

      {/* Privacy Level */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">Privacy Level *</label>
        <select
          value={settings.privacy_level || 'PUBLIC_TO_EVERYONE'}
          onChange={(e) => onChange({ ...settings, privacy_level: e.target.value as any })}
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
          required
        >
          <option value="PUBLIC_TO_EVERYONE">Public</option>
          <option value="MUTUAL_FOLLOW_FRIENDS">Friends</option>
          <option value="FOLLOWER_OF_CREATOR">Followers</option>
          <option value="SELF_ONLY">Private</option>
        </select>
      </div>

      {/* Duet */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.duet !== false}
            onChange={(e) => onChange({ ...settings, duet: e.target.checked })}
            className="w-4 h-4 rounded border-newBorder bg-newBgColor text-btnPrimary focus:ring-btnPrimary"
          />
          <span className="text-sm text-newTextColor">Allow Duet</span>
        </label>
      </div>

      {/* Stitch */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.stitch !== false}
            onChange={(e) => onChange({ ...settings, stitch: e.target.checked })}
            className="w-4 h-4 rounded border-newBorder bg-newBgColor text-btnPrimary focus:ring-btnPrimary"
          />
          <span className="text-sm text-newTextColor">Allow Stitch</span>
        </label>
      </div>

      {/* Comment */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.comment !== false}
            onChange={(e) => onChange({ ...settings, comment: e.target.checked })}
            className="w-4 h-4 rounded border-newBorder bg-newBgColor text-btnPrimary focus:ring-btnPrimary"
          />
          <span className="text-sm text-newTextColor">Allow Comments</span>
        </label>
      </div>

      {/* Auto Add Music */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">Auto Add Music *</label>
        <select
          value={settings.autoAddMusic || 'no'}
          onChange={(e) => onChange({ ...settings, autoAddMusic: e.target.value as 'yes' | 'no' })}
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
          required
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      {/* Brand Content */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.brand_content_toggle === true}
            onChange={(e) => onChange({ ...settings, brand_content_toggle: e.target.checked })}
            className="w-4 h-4 rounded border-newBorder bg-newBgColor text-btnPrimary focus:ring-btnPrimary"
          />
          <span className="text-sm text-newTextColor">Brand Content</span>
        </label>
      </div>

      {/* Brand Organic */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.brand_organic_toggle === true}
            onChange={(e) => onChange({ ...settings, brand_organic_toggle: e.target.checked })}
            className="w-4 h-4 rounded border-newBorder bg-newBgColor text-btnPrimary focus:ring-btnPrimary"
          />
          <span className="text-sm text-newTextColor">Brand Organic</span>
        </label>
      </div>

      {/* Video Made with AI */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.video_made_with_ai === true}
            onChange={(e) => onChange({ ...settings, video_made_with_ai: e.target.checked })}
            className="w-4 h-4 rounded border-newBorder bg-newBgColor text-btnPrimary focus:ring-btnPrimary"
          />
          <span className="text-sm text-newTextColor">Video Made with AI</span>
        </label>
      </div>

      {/* Content Posting Method */}
      <div>
        <label className="block text-xs text-textItemBlur mb-2">Content Posting Method *</label>
        <select
          value={settings.content_posting_method || 'DIRECT_POST'}
          onChange={(e) => onChange({ ...settings, content_posting_method: e.target.value as 'DIRECT_POST' | 'UPLOAD' })}
          className="w-full px-3 py-2 bg-newBgColor border border-newBorder rounded text-newTextColor focus:border-btnPrimary focus:outline-none"
          required
        >
          <option value="DIRECT_POST">Direct Post</option>
          <option value="UPLOAD">Upload</option>
        </select>
      </div>
    </div>
  );
};
