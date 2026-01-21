import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { TipTapEditor } from './components/TipTapEditor';
import { ChannelSelector } from './components/ChannelSelector';
import { MediaUpload } from './components/MediaUpload';
import { PostPreview } from './components/PostPreview';
import { DateTimePicker } from './components/DateTimePicker';
import { TagsInput, type Tag } from './components/TagsInput';
import { AIRefineModal } from './components/AIRefineModal';
import { PlatformSettings, getPlatformType } from './platform-settings/PlatformSettings';
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
  wordPressContent?: { title: string; content: string; featuredImage?: string } | null;
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
  wordPressContent,
  onClose,
  onSuccess,
}) => {
  const [content, setContent] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  // Changed: Store settings Map<ChannelID, Settings>
  const [platformSettingsMap, setPlatformSettingsMap] = useState<Record<string, PlatformSettingsType>>({});
  const [tags, setTags] = useState<Tag[]>([]);
  const [showAIRefine, setShowAIRefine] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for accordion: which channel settings are open?
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);

  // Initialize form when date or post changes
  useEffect(() => {
    if (date) {
      setScheduledDate(date.toDate());
    }

    // Load WordPress content if provided
    if (wordPressContent) {
      let contentHtml = wordPressContent.content;
      if (wordPressContent.title) {
        contentHtml = `<h2>${wordPressContent.title}</h2>${contentHtml}`;
      }
      setContent(contentHtml);
      if (wordPressContent.featuredImage) {
        setMedia([
          {
            id: 'wp-featured-' + Date.now(),
            path: wordPressContent.featuredImage,
            type: 'image' as const,
          },
        ]);
      }
    } else if (post) {
      setContent(post.value[0]?.content || '');
      setSelectedChannels([post.integration.id]);
      if (post.value[0]?.image) {
        setMedia(
          post.value[0].image.map((img) => ({
            id: img.id,
            path: img.path,
            type: 'image' as const,
          }))
        );
      }
      if (post.tags && post.tags.length > 0) {
        // Map from API format {tag: {id, name, color}} to UI format {label, value}
        setTags(post.tags.map(t => ({
          label: t.tag.name,
          value: t.tag.id
        })));
      }
      // Load existing settings if any
      if (post.settings) {
        setPlatformSettingsMap({ [post.integration.id]: post.settings });
      }
    }
  }, [date, post, wordPressContent]);

  const handleSubmit = async (type: 'schedule' | 'draft' = 'schedule') => {
    setError(null);

    if (selectedChannels.length === 0) {
      setError('Please select at least one channel');
      return;
    }

    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (!textContent && media.length === 0) {
      setError('Please add some content or media');
      return;
    }

    // Check if Pinterest is selected and media is required
    const hasPinterest = selectedChannels.some((channelId) => {
      const integration = integrations.find((i) => i.id === channelId);
      return integration && getPlatformType(integration.identifier) === 'pinterest';
    });

    if (hasPinterest && media.length === 0) {
      setError('Pinterest posts require at least one image or video. Please upload media.');
      return;
    }

    // Warn about Discord/Slack channels
    const hasDiscord = selectedChannels.some((channelId) => {
      const integration = integrations.find((i) => i.id === channelId);
      return integration && getPlatformType(integration.identifier) === 'discord';
    });

    if (hasDiscord) {
      console.warn('Discord/Slack channels will be skipped - not fully supported in WordPress plugin yet');
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type,
        date: dayjs(scheduledDate).toISOString(),
        shortLink: false,
        tags: tags.length > 0 ? tags : [],
        posts: selectedChannels.map((channelId) => {
          // Get specific settings for this channel or default
          let settings = platformSettingsMap[channelId];

          if (!settings) {
            const integration = integrations.find((i) => i.id === channelId);
            const type = integration ? getPlatformType(integration.identifier) : 'x';

            // Smart defaults
            if (type === 'discord') {
              // Discord/Slack require a specific channel ID within the integration
              // WordPress plugin doesn't have channel selection UI yet
              // Skip Discord channels for now to avoid validation errors
              console.warn(`Discord/Slack posting not fully supported in WordPress plugin yet. Skipping channel: ${integration?.name || channelId}`);
              return null; // Will be filtered out
            } else if (type === 'tiktok') {
              // TikTok requires all these fields
              settings = {
                __type: 'tiktok',
                privacy_level: 'PUBLIC_TO_EVERYONE',
                duet: true,
                stitch: true,
                comment: true,
                autoAddMusic: false,
                brand_organic_toggle: false,
                content_posting_method: 'DIRECT_POST',
              } as any;
            } else {
              settings = { __type: type || 'x' } as any;
            }
          }

          return {
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
            settings,
          };
        }).filter((post) => post !== null), // Remove Discord/unsupported channels
      };

      if (post?.id) {
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

  const previewIntegration = integrations.find((i) => i.id === selectedChannels[0]) || null;

  // Helper to toggle accordion
  const toggleSettings = (id: string) => {
    if (openSettingsId === id) {
      setOpenSettingsId(null);
    } else {
      setOpenSettingsId(id);
    }
  };

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

              {/* Multi-Channel Settings Accordion */}
              {selectedChannels.length > 0 && (
                <div className="space-y-2">
                  {selectedChannels.map((channelId) => {
                    const integration = integrations.find((i) => i.id === channelId);
                    if (!integration) return null;

                    const isOpen = openSettingsId === channelId || selectedChannels.length === 1;

                    return (
                      <div key={channelId} className="border border-newBorder rounded overflow-hidden">
                        {/* Accordion Header */}
                        {selectedChannels.length > 1 && (
                          <button
                            onClick={() => toggleSettings(channelId)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-[#FF6900] text-white hover:bg-[#E65E00] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {/* Provider Icon */}
                              {integration.picture ? (
                                <img
                                  src={integration.picture}
                                  alt=""
                                  className="w-5 h-5 rounded-full bg-white/10"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                                  {integration.identifier?.[0]?.toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium text-sm">
                                {integration.name} Settings
                              </span>
                            </div>
                            <svg
                              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}

                        {/* Settings Body */}
                        {isOpen && (
                          <div className={selectedChannels.length > 1 ? 'p-4 bg-newBgColorInner' : ''}>
                            <PlatformSettings
                              integration={integration}
                              onChange={(newSettings) => {
                                setPlatformSettingsMap((prev) => ({
                                  ...prev,
                                  [channelId]: newSettings,
                                }));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

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
              <MediaUpload
                media={media}
                onChange={setMedia}
                required={selectedChannels.some((channelId) => {
                  const integration = integrations.find((i) => i.id === channelId);
                  return integration && getPlatformType(integration.identifier) === 'pinterest';
                })}
                requirementMessage="Pinterest posts require at least one image or video."
              />

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
