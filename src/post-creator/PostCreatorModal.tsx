import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { TipTapEditor } from './components/TipTapEditor';
import { ChannelSelector } from './components/ChannelSelector';
import { MediaUpload } from './components/MediaUpload';
import { PostPreview } from './components/PostPreview';
import { DateTimePicker } from './components/DateTimePicker';
import { TagsInput, type Tag } from './components/TagsInput';
import { AIRefineModal } from './components/AIRefineModal';
import { PlatformSettings } from './platform-settings/PlatformSettings';
import type { PlatformSettings as PlatformSettingsType } from './platform-settings/types';
import { calendarAPI } from '../shared/api/client';
import type { Integration, Post } from '../calendar/types';

interface MediaItem {
  id: string;
  path: string;
  type: 'image' | 'video';
}

interface PostCreatorModalProps {
  date: dayjs.Dayjs | null;
  post?: Post | null;
  integrations: Integration[];
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Full Post Creator Modal
 * TipTap editor + channel selection + media + preview
 */
export const PostCreatorModal: React.FC<PostCreatorModalProps> = ({
  date,
  post,
  integrations,
  onClose,
  onSuccess,
}) => {
  const [content, setContent] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsType | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [showAIRefine, setShowAIRefine] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when date or post changes
  useEffect(() => {
    if (date) {
      setScheduledDate(date.toDate());
    }
    if (post) {
      setContent(post.value[0]?.content || '');
      setSelectedChannels([post.integration.id]);
      // Load media if exists
      if (post.value[0]?.image) {
        setMedia(
          post.value[0].image.map((img) => ({
            id: img.id,
            path: img.path,
            type: 'image' as const,
          }))
        );
      }
      // Load tags if exists
      if (post.tags) {
        setTags(post.tags);
      }
    }
  }, [date, post]);

  const handleSubmit = async (type: 'schedule' | 'draft' = 'schedule') => {
    setError(null);

    // Validation
    if (selectedChannels.length === 0) {
      setError('Please select at least one channel');
      return;
    }

    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (!textContent && media.length === 0) {
      setError('Please add some content or media');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build payload matching PostQuee API structure
      const payload = {
        type,
        date: dayjs(scheduledDate).toISOString(),
        shortLink: false,
        tags: tags.length > 0 ? tags : undefined, // Include tags if present
        posts: selectedChannels.map((channelId) => ({
          integration: { id: channelId },
          value: [
            {
              content,
              image: media.map((m) => ({
                id: m.id,
                path: m.path,
              })),
            },
          ],
          settings: platformSettings || { __type: 'x' }, // Use platform settings if available
        })),
      };

      // Create or update post
      if (post?.id) {
        // Update existing post (not implemented in API yet)
        throw new Error('Post editing not yet available via API');
      } else {
        await calendarAPI.createPost(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!date) return null;

  // Get first selected integration for preview
  const previewIntegration = integrations.find((i) => i.id === selectedChannels[0]) || null;

  return (
    <div
      className="fixed inset-0 bg-newBackdrop flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-newSettings rounded-lg border border-newBorder w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-newBorder">
          <h2 className="text-xl font-bold text-newTextColor">
            {post ? 'Edit Post' : 'Create Post'}
          </h2>
          <button
            onClick={onClose}
            className="text-textItemBlur hover:text-newTextColor transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 p-6">
            {/* Left column - Editor */}
            <div className="space-y-6">
              {/* Channel Selection */}
              <ChannelSelector
                integrations={integrations}
                selectedIds={selectedChannels}
                onChange={setSelectedChannels}
              />

              {/* Platform-specific Settings (show only when one channel selected) */}
              {selectedChannels.length === 1 && (() => {
                const selectedIntegration = integrations.find((i) => i.id === selectedChannels[0]);
                return selectedIntegration ? (
                  <PlatformSettings
                    integration={selectedIntegration}
                    onChange={setPlatformSettings}
                  />
                ) : null;
              })()}

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-newTextColor mb-3">Content</label>
                <TipTapEditor
                  content={content}
                  onChange={setContent}
                  onAIRefine={() => setShowAIRefine(true)}
                />
              </div>

              {/* Media Upload */}
              <MediaUpload media={media} onChange={setMedia} />

              {/* Date/Time Picker */}
              <DateTimePicker value={scheduledDate} onChange={setScheduledDate} />

              {/* Tags */}
              <TagsInput selectedTags={tags} onChange={setTags} />
            </div>

            {/* Right column - Preview */}
            <div className="sticky top-0">
              <PostPreview content={content} media={media} integration={previewIntegration} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-newBorder p-4 bg-newBgColorInner">
          {error && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-textItemBlur">
              {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded border border-newBorder text-newTextColor hover:bg-newBoxHover transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="px-4 py-2 rounded border border-newBorder text-newTextColor hover:bg-newBoxHover transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>

              <button
                onClick={() => handleSubmit('schedule')}
                disabled={isSubmitting}
                className="px-6 py-2 rounded bg-btnPrimary text-white hover:bg-btnPrimaryHover transition-colors disabled:opacity-50 font-medium"
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Refine Modal */}
      {showAIRefine && (
        <AIRefineModal
          currentContent={content}
          onApply={setContent}
          onClose={() => setShowAIRefine(false)}
        />
      )}
    </div>
  );
};
