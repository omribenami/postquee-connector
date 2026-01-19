import React from 'react';
import { useDrop } from 'react-dnd';
import dayjs from 'dayjs';
import { PostCard } from './PostCard';
import type { Post } from '../types';

const DND_TYPE = 'POST';

interface CalendarSlotProps {
  date: dayjs.Dayjs;
  hour?: number; // For day/week views
  posts: Post[];
  onDrop: (post: Post, newDate: dayjs.Dayjs) => void;
  onCreate?: (date: dayjs.Dayjs) => void;
  onDeletePost: (postId: string) => void;
  onEditPost?: (post: Post) => void;
  variant?: 'week' | 'month' | 'day';
  className?: string;
}

/**
 * Droppable Calendar Time Slot
 */
export const CalendarSlot: React.FC<CalendarSlotProps> = ({
  date,
  hour,
  posts,
  onDrop,
  onCreate,
  onDeletePost,
  onEditPost,
  variant = 'week',
  className = '',
}) => {
  // Create the exact datetime for this slot
  const slotDateTime = hour !== undefined ? date.hour(hour).minute(0).second(0) : date;
  const isPast = slotDateTime.isBefore(dayjs());
  const isToday = slotDateTime.isSame(dayjs(), 'day');

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: DND_TYPE,
    canDrop: () => !isPast, // Only allow dropping on future slots
    drop: (item: { post: Post }) => {
      onDrop(item.post, slotDateTime);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const handleClick = () => {
    if (!isPast && onCreate && posts.length === 0) {
      onCreate(slotDateTime);
    }
  };

  // Determine border color
  const getBorderColor = () => {
    if (isOver && canDrop) return 'border-btnPrimary';
    if (canDrop) return 'border-newBorder';
    return 'border-newBorder';
  };

  return (
    <div
      ref={drop}
      onClick={handleClick}
      className={`
        ${className}
        border ${getBorderColor()}
        transition-all
        ${isPast ? 'bg-newBgLineColor cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${!isPast && 'hover:bg-newBoxHover group'}
        ${isOver && canDrop ? 'bg-btnPrimary/10 border-2' : ''}
      `}
    >
      {/* Orange + icon on hover for empty future slots */}
      {!isPast && posts.length === 0 && (
        <div className="hidden group-hover:flex items-center justify-center h-full text-btnPrimary text-2xl font-bold">
          +
        </div>
      )}

      {/* Posts */}
      <div className="space-y-1">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            variant={variant}
            onDelete={onDeletePost}
            onEdit={onEditPost}
          />
        ))}
      </div>
    </div>
  );
};
