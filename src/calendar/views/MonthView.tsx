import React from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useCalendarStore, useCalendarContext } from '../context';
import type { Post } from '../types';

dayjs.extend(isoWeek);

export const MonthView: React.FC = () => {
  const { currentDate } = useCalendarStore();
  const { posts } = useCalendarContext();

  const monthStart = dayjs(currentDate).startOf('month');
  const calendarStart = monthStart.startOf('isoWeek'); // Start from Monday

  // 6 weeks × 7 days = 42 days
  const calendarDays = Array.from({ length: 42 }, (_, i) => calendarStart.add(i, 'day'));

  // Get posts for a specific day
  const getPostsForDay = (day: dayjs.Dayjs) => {
    return posts.filter((post: Post) => dayjs(post.publishDate).isSame(day, 'day'));
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
      <div className="grid grid-cols-7 gap-1" style={{ gridAutoRows: 'minmax(100px, 1fr)' }}>
        {calendarDays.map((day) => {
          const dayPosts = getPostsForDay(day);
          const isToday = day.isSame(dayjs(), 'day');
          const isCurrentMonth = day.month() === monthStart.month();
          const isPast = day.isBefore(dayjs(), 'day');

          return (
            <div
              key={day.format('YYYY-MM-DD')}
              className={`border border-newBorder rounded-lg p-2 group hover:bg-newBoxHover transition-colors ${
                !isCurrentMonth ? 'opacity-40' : ''
              } ${isPast ? 'bg-newBgLineColor cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-semibold ${
                    isToday
                      ? 'bg-btnPrimary text-white px-2 py-1 rounded-full'
                      : isCurrentMonth
                      ? 'text-newTextColor'
                      : 'text-textItemBlur'
                  }`}
                >
                  {day.format('D')}
                </span>

                {/* Orange + on hover for empty future days */}
                {!isPast && dayPosts.length === 0 && (
                  <span className="hidden group-hover:inline-block text-btnPrimary text-xl font-bold">
                    +
                  </span>
                )}
              </div>

              {/* Posts */}
              <div className="space-y-1">
                {dayPosts.slice(0, 3).map((post: Post) => (
                  <div
                    key={post.id}
                    className="text-xs p-1.5 rounded bg-newColColor border-l-2 border-btnPrimary hover:bg-newBoxHover cursor-pointer"
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      {post.integration.picture && (
                        <img
                          src={post.integration.picture}
                          alt={post.integration.name}
                          className="w-3 h-3 rounded-full"
                        />
                      )}
                      <span className="text-newTextColor font-medium">
                        {dayjs(post.publishDate).format('HH:mm')}
                      </span>
                    </div>
                    <div className="text-textItemBlur line-clamp-1">
                      {post.value[0]?.content.replace(/<[^>]*>/g, '') || 'No content'}
                    </div>
                  </div>
                ))}

                {/* Show "+X more" if there are more posts */}
                {dayPosts.length > 3 && (
                  <div className="text-xs text-btnPrimary font-medium text-center">
                    +{dayPosts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
