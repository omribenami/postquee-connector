import React from 'react';
import dayjs from 'dayjs';
import { useCalendarStore, useCalendarContext } from '../context';
import type { Post } from '../types';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const DayView: React.FC = () => {
  const { currentDate } = useCalendarStore();
  const { posts } = useCalendarContext();

  const day = dayjs(currentDate);

  // Get posts for a specific hour
  const getPostsForHour = (hour: number) => {
    return posts.filter((post: Post) => {
      const postDate = dayjs(post.publishDate);
      return postDate.isSame(day, 'day') && postDate.hour() === hour;
    });
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-4">
        {/* Time slots */}
        {HOURS.map((hour) => {
          const hourPosts = getPostsForHour(hour);
          const isPast = day.hour(hour).isBefore(dayjs());

          return (
            <div
              key={hour}
              className={`flex border-b border-newBorder group ${
                isPast ? 'bg-newBgLineColor cursor-not-allowed opacity-60' : ''
              }`}
            >
              {/* Time label */}
              <div className="w-24 flex-shrink-0 p-4 text-right text-textItemBlur">
                {dayjs().hour(hour).format('HH:00')}
              </div>

              {/* Content area */}
              <div className={`flex-1 p-4 min-h-[80px] ${!isPast ? 'hover:bg-newBoxHover cursor-pointer' : ''}`}>
                {/* Orange + icon on hover for empty future slots */}
                {!isPast && hourPosts.length === 0 && (
                  <div className="hidden group-hover:flex items-center justify-center h-full text-btnPrimary text-3xl font-bold">
                    +
                  </div>
                )}

                {/* Posts */}
                <div className="space-y-2">
                  {hourPosts.map((post: Post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-lg bg-newColColor border-l-4 border-btnPrimary hover:bg-newBoxHover cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {post.integration.picture && (
                          <img
                            src={post.integration.picture}
                            alt={post.integration.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <div className="text-newTextColor font-semibold">
                            {dayjs(post.publishDate).format('HH:mm')}
                          </div>
                          <div className="text-textItemBlur text-xs">{post.integration.name}</div>
                        </div>
                        {post.state && (
                          <span className={`ml-auto text-xs px-2 py-1 rounded ${
                            post.state === 'published' ? 'bg-green-500/20 text-green-400' :
                            post.state === 'schedule' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {post.state}
                          </span>
                        )}
                      </div>
                      <div className="text-textItemBlur">
                        {post.value[0]?.content.replace(/<[^>]*>/g, '') || 'No content'}
                      </div>
                      {post.value[0]?.image && post.value[0].image.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {post.value[0].image.slice(0, 4).map((img, idx) => (
                            <img
                              key={idx}
                              src={img.path}
                              alt={img.alt || ''}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
