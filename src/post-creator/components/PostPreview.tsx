import React from 'react';
import type { Integration } from '../../calendar/types';

interface MediaItem {
  id: string;
  path: string;
  type: 'image' | 'video';
}

interface PostPreviewProps {
  content: string;
  media: MediaItem[];
  integration: Integration | null;
}

/**
 * Post Preview Component
 * Shows how the post will look on the selected platform
 */
export const PostPreview: React.FC<PostPreviewProps> = ({ content, media, integration }) => {
  // Strip HTML tags for preview
  const textContent = content.replace(/<[^>]*>/g, '');

  if (!integration) {
    return (
      <div className="bg-newBgColorInner rounded-lg border border-newBorder p-6 text-center text-textItemBlur">
        Select a channel to see preview
      </div>
    );
  }

  return (
    <div className="bg-newBgColorInner rounded-lg border border-newBorder p-4">
      <div className="text-xs text-textItemBlur mb-2">Preview</div>

      {/* Mock social media post */}
      <div className="bg-newBgColor rounded-lg p-4 border border-newBorder">
        {/* Header with profile */}
        <div className="flex items-center gap-3 mb-3">
          {integration.picture && (
            <img
              src={integration.picture}
              alt={integration.name}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <div className="text-newTextColor font-semibold">{integration.name}</div>
            <div className="text-textItemBlur text-xs">Just now</div>
          </div>
        </div>

        {/* Content */}
        {textContent && (
          <div className="text-newTextColor mb-3 whitespace-pre-wrap">{textContent}</div>
        )}

        {/* Media */}
        {media.length > 0 && (
          <div
            className={`grid gap-1 rounded overflow-hidden ${
              media.length === 1
                ? 'grid-cols-1'
                : media.length === 2
                ? 'grid-cols-2'
                : media.length === 3
                ? 'grid-cols-3'
                : 'grid-cols-2 grid-rows-2'
            }`}
          >
            {media.map((item, idx) => (
              <div key={item.id} className={media.length === 3 && idx === 0 ? 'row-span-2' : ''}>
                {item.type === 'image' ? (
                  <img src={item.path} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={item.path} className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mock interaction buttons */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-newBorder text-textItemBlur text-sm">
          <button className="flex items-center gap-1 hover:text-newTextColor">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Like
          </button>
          <button className="flex items-center gap-1 hover:text-newTextColor">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comment
          </button>
          <button className="flex items-center gap-1 hover:text-newTextColor">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );
};
