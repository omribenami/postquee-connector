import React from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useCalendarStore, useCalendarContext } from '../context';
import { CalendarSlot } from '../components/CalendarSlot';
import type { Post } from '../types';

dayjs.extend(isoWeek);

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface WeekViewProps {
  onCreate: (date: dayjs.Dayjs) => void;
  onEdit: (post: Post) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({ onCreate, onEdit }) => {
  const { currentDate } = useCalendarStore();
  const { posts, deletePost, reschedulePost } = useCalendarContext();

  // Get week days (Monday - Sunday)
  const weekStart = dayjs(currentDate).startOf('isoWeek');
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));

  // Group posts by day and hour
  const getPostsForSlot = (day: dayjs.Dayjs, hour: number) => {
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
      {/* Week grid */}
      <div className="grid gap-0" style={{ gridTemplateColumns: '80px repeat(7, minmax(0, 1fr))' }}>
        {/* Header row with day names */}
        <div className="sticky top-0 bg-newBgColor border-b border-newBorder p-2 z-10"></div>
        {weekDays.map((day) => (
          <div
            key={day.format('YYYY-MM-DD')}
            className="sticky top-0 bg-newBgColor border-b border-l border-newBorder p-3 text-center z-10"
          >
            <div className="text-textItemBlur text-xs uppercase">{day.format('ddd')}</div>
            <div
              className={`text-lg font-semibold mt-1 ${
                day.isSame(dayjs(), 'day') ? 'text-btnPrimary' : 'text-newTextColor'
              }`}
            >
              {day.format('D')}
            </div>
          </div>
        ))}

        {/* Time slots */}
        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            {/* Time label */}
            <div className="border-r border-newBorder p-2 text-right text-textItemBlur text-sm">
              {dayjs().hour(hour).format('HH:00')}
            </div>

            {/* Day columns with CalendarSlot */}
            {weekDays.map((day) => {
              const slotPosts = getPostsForSlot(day, hour);

              return (
                <CalendarSlot
                  key={`${day.format('YYYY-MM-DD')}-${hour}`}
                  date={day}
                  hour={hour}
                  posts={slotPosts}
                  onDrop={handleDrop}
                  onCreate={onCreate}
                  onDeletePost={handleDelete}
                  onEditPost={onEdit}
                  variant="week"
                  className="border-l border-b min-h-[60px] p-1"
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
