import React from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useCalendarStore, useCalendarContext } from '../context';
import type { Post } from '../types';

dayjs.extend(isoWeek);

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const WeekView: React.FC = () => {
  const { currentDate } = useCalendarStore();
  const { posts } = useCalendarContext();

  // Get week days (Monday - Sunday)
  const weekStart = dayjs(currentDate).startOf('isoWeek');
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));

  // Group posts by day and hour
  const getPostsForSlot = (day: dayjs.Dayjs, hour: number) => {
    const slotStart = day.hour(hour).minute(0);
    const slotEnd = day.hour(hour).minute(59);

    return posts.filter((post: Post) => {
      const postDate = dayjs(post.publishDate);
      return (
        postDate.isSame(day, 'day') &&
        postDate.hour() === hour
      );
    });
  };

  return (
    <div className="h-full overflow-auto">
      {/* Week grid */}
      <div className="grid gap-0" style={{ gridTemplateColumns: '80px repeat(7, minmax(0, 1fr))' }}>
        {/* Header row with day names */}
        <div className="sticky top-0 bg-newBgColor border-b border-newBorder p-2"></div>
        {weekDays.map((day) => (
          <div
            key={day.format('YYYY-MM-DD')}
            className="sticky top-0 bg-newBgColor border-b border-l border-newBorder p-3 text-center"
          >
            <div className="text-textItemBlur text-xs uppercase">{day.format('ddd')}</div>
            <div className={`text-lg font-semibold mt-1 ${
              day.isSame(dayjs(), 'day') ? 'text-btnPrimary' : 'text-newTextColor'
            }`}>
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

            {/* Day columns */}
            {weekDays.map((day) => {
              const slotPosts = getPostsForSlot(day, hour);
              const isPast = day.hour(hour).isBefore(dayjs());

              return (
                <div
                  key={`${day.format('YYYY-MM-DD')}-${hour}`}
                  className={`border-l border-b border-newBorder p-1 min-h-[60px] group hover:bg-newBoxHover transition-colors ${
                    isPast ? 'bg-newBgLineColor cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
                >
                  {/* Orange + icon on hover for empty future slots */}
                  {!isPast && slotPosts.length === 0 && (
                    <div className="hidden group-hover:flex items-center justify-center h-full text-btnPrimary text-2xl font-bold">
                      +
                    </div>
                  )}

                  {/* Posts */}
                  {slotPosts.map((post: Post) => (
                    <div
                      key={post.id}
                      className="mb-1 p-2 rounded text-xs bg-newColColor border-l-2 border-btnPrimary hover:bg-newBoxHover cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {post.integration.picture && (
                          <img
                            src={post.integration.picture}
                            alt={post.integration.name}
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                        <span className="text-newTextColor font-medium truncate">
                          {dayjs(post.publishDate).format('HH:mm')}
                        </span>
                      </div>
                      <div className="text-textItemBlur line-clamp-2">
                        {post.value[0]?.content.replace(/<[^>]*>/g, '') || 'No content'}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
