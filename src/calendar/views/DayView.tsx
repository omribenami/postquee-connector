import React from 'react';
import dayjs from 'dayjs';
import { useCalendarStore, useCalendarContext } from '../context';
import { CalendarSlot } from '../components/CalendarSlot';
import type { Post } from '../types';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface DayViewProps {
  onCreate: (date: dayjs.Dayjs) => void;
  onEdit: (post: Post) => void;
}

export const DayView: React.FC<DayViewProps> = ({ onCreate, onEdit }) => {
  const { currentDate } = useCalendarStore();
  const { posts, deletePost, reschedulePost } = useCalendarContext();

  const day = dayjs(currentDate);

  // Get posts for a specific hour
  const getPostsForHour = (hour: number) => {
    return posts.filter((post: Post) => {
      const postDate = dayjs(post.publishDate);
      return postDate.isSame(day, 'day') && postDate.hour() === hour;
    });
  };

  const handleDrop = async (post: Post, newDate: dayjs.Dayjs) => {
    await reschedulePost(post.id, newDate.toISOString());
  };

  const handleDelete = async (postId: string) => {
    await deletePost(postId);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-4">
        {/* Time slots */}
        {HOURS.map((hour) => {
          const hourPosts = getPostsForHour(hour);

          return (
            <div key={hour} className="flex border-b border-newBorder">
              {/* Time label */}
              <div className="w-24 flex-shrink-0 p-4 text-right text-textItemBlur">
                {dayjs().hour(hour).format('HH:00')}
              </div>

              {/* Content area with CalendarSlot */}
              <CalendarSlot
                date={day}
                hour={hour}
                posts={hourPosts}
                onDrop={handleDrop}
                onCreate={onCreate}
                onDeletePost={handleDelete}
                onEditPost={onEdit}
                variant="day"
                className="flex-1 p-4 min-h-[100px]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
