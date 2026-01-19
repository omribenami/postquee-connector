import React from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useCalendarStore, useCalendarContext } from '../context';
import { CalendarSlot } from '../components/CalendarSlot';
import type { Post } from '../types';

dayjs.extend(isoWeek);

interface MonthViewProps {
  onCreate: (date: dayjs.Dayjs) => void;
  onEdit: (post: Post) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ onCreate, onEdit }) => {
  const { currentDate } = useCalendarStore();
  const { posts, deletePost, reschedulePost } = useCalendarContext();

  const monthStart = dayjs(currentDate).startOf('month');
  const calendarStart = monthStart.startOf('isoWeek'); // Start from Monday

  // 6 weeks × 7 days = 42 days
  const calendarDays = Array.from({ length: 42 }, (_, i) => calendarStart.add(i, 'day'));

  // Get posts for a specific day
  const getPostsForDay = (day: dayjs.Dayjs) => {
    return posts.filter((post: Post) => dayjs(post.publishDate).isSame(day, 'day'));
  };

  const handleDrop = async (post: Post, newDate: dayjs.Dayjs) => {
    // Keep the original time, just change the date
    const originalTime = dayjs(post.publishDate);
    const newDateTime = newDate.hour(originalTime.hour()).minute(originalTime.minute());
    await reschedulePost(post.id, newDateTime.toISOString());
  };

  const handleDelete = async (postId: string) => {
    await deletePost(postId);
  };

  return (
    <div className="h-full overflow-auto p-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center text-textItemBlur text-sm font-medium p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1" style={{ gridAutoRows: 'minmax(120px, 1fr)' }}>
        {calendarDays.map((day) => {
          const dayPosts = getPostsForDay(day);
          const isToday = day.isSame(dayjs(), 'day');
          const isCurrentMonth = day.month() === monthStart.month();

          return (
            <div
              key={day.format('YYYY-MM-DD')}
              className={`rounded-lg bg-newBgColor ${!isCurrentMonth ? 'opacity-40' : ''}`}
            >
              {/* Day number */}
              <div className="flex items-center justify-between p-2">
                <span
                  className={`text-sm font-semibold ${isToday
                      ? 'bg-btnPrimary text-white px-2 py-1 rounded-full'
                      : isCurrentMonth
                        ? 'text-newTextColor'
                        : 'text-textItemBlur'
                    }`}
                >
                  {day.format('D')}
                </span>
              </div>

              {/* Calendar slot for the day */}
              <CalendarSlot
                date={day}
                posts={dayPosts}
                onDrop={handleDrop}
                onCreate={onCreate}
                onDeletePost={handleDelete}
                onEditPost={onEdit}
                variant="month"
                className="px-2 pb-2 min-h-[80px]"
              />

              {/* Show "+X more" if there are more posts than displayed */}
              {dayPosts.length > 3 && (
                <div className="text-xs text-btnPrimary font-medium text-center px-2 pb-2">
                  +{dayPosts.length - 3} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
