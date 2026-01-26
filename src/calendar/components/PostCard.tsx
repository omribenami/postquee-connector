import React from 'react';
import { useDrag } from 'react-dnd';
import dayjs from 'dayjs';
import type { Post } from '../types';
import { SocialIcon } from '../../shared/components/SocialIcon';
import { getPlatformGradient } from '../../shared/utils/platformColors';

const DND_TYPE = 'POST';

interface PostCardProps {
  post: Post;
  variant?: 'week' | 'month' | 'day';
  onDelete?: (postId: string) => void;
  onEdit?: (post: Post) => void;
}

/**
 * Draggable Post Card Component
 */
export const PostCard: React.FC<PostCardProps> = ({ post, variant = 'week', onDelete, onEdit }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DND_TYPE,
    item: { post },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(post);
    }
  };

  // Different styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'day':
        return 'p-3 text-sm';
      case 'month':
        return 'p-1.5 text-xs';
      case 'week':
      default:
        return 'p-2 text-xs';
    }
  };

  return (
    <div
      ref={drag}
      className={`mb-1 rounded bg-newColColor border-l-2 border-btnPrimary hover:bg-newBoxHover cursor-move group ${getVariantStyles()} ${isDragging ? 'opacity-50' : ''
        }`}
      onClick={handleEdit}
    >
      {/* Header with integration info */}
      <div className="flex items-center gap-2 mb-1">
        {post.integration.picture && (
          <div className="relative flex-shrink-0">
            <img
              src={post.integration.picture}
              alt={post.integration.name}
              className={variant === 'month' ? 'w-3 h-3 rounded-full' : 'w-4 h-4 rounded-full'}
            />
            {/* Social media platform badge */}
            <div
              className={`absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center border border-newBorder ${variant === 'month' ? 'w-2 h-2' : 'w-2.5 h-2.5'}`}
              style={{ background: getPlatformGradient(post.integration.providerIdentifier) }}
            >
              <SocialIcon
                identifier={post.integration.providerIdentifier}
                className={`${variant === 'month' ? 'w-1 h-1' : 'w-1.5 h-1.5'} text-white`}
              />
            </div>
          </div>
        )}
        <span className="text-newTextColor font-medium truncate">
          {dayjs(post.publishDate).format('HH:mm')}
        </span>

        {/* Action buttons (show on hover) */}
        <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-newBoxHover rounded"
              title="Edit post"
            >
              <svg className="w-3 h-3 text-textItemBlur" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-500/20 rounded"
              title="Delete post"
            >
              <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content preview */}
      <div className={`text-textItemBlur ${variant === 'month' ? 'line-clamp-1' : 'line-clamp-2'}`}>
        {post.value?.[0]?.content.replace(/<[^>]*>/g, '') || 'No content'}
      </div>

      {/* Images (only in day view) */}
      {variant === 'day' && post.value?.[0]?.image && post.value[0].image.length > 0 && (
        <div className="mt-2 flex gap-2">
          {post.value[0].image.slice(0, 4).map((img, idx) => (
            <img
              key={idx}
              src={img.path}
              alt={img.alt || ''}
              className="w-12 h-12 object-cover rounded"
            />
          ))}
        </div>
      )}

      {/* State badge (only in day view) */}
      {variant === 'day' && post.state && (
        <div className="mt-2">
          <span
            className={`text-xs px-2 py-1 rounded ${post.state === 'PUBLISHED'
              ? 'bg-green-500/20 text-green-400'
              : post.state === 'QUEUE'
                ? 'bg-blue-500/20 text-blue-400'
                : post.state === 'ERROR'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}
          >
            {post.state}
          </span>
        </div>
      )}
    </div>
  );
};
