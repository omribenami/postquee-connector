import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useCalendarStore, CalendarProvider, useCalendarContext } from './context';
import { DndProvider } from './components/DndProvider';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';
import { DayView } from './views/DayView';
import type { Post } from './types';

/**
 * Navigation and view switcher component
 */
const CalendarHeader: React.FC = () => {
  const { currentDate, view, setView, goToToday, goToPrevious, goToNext } = useCalendarStore();
  const { isLoading } = useCalendarContext();

  const formatDateRange = () => {
    const current = dayjs(currentDate);
    switch (view) {
      case 'day':
        return current.format('MMMM D, YYYY');
      case 'week':
        const weekStart = current.startOf('isoWeek');
        const weekEnd = current.endOf('isoWeek');
        return `${weekStart.format('MMM D')} - ${weekEnd.format('MMM D, YYYY')}`;
      case 'month':
        return current.format('MMMM YYYY');
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center justify-between mb-6 px-4">
      {/* Date navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={goToPrevious}
          className="p-2 rounded hover:bg-newBoxHover transition-colors"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 text-newTextColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-lg font-semibold text-newTextColor min-w-[250px] text-center">
          {formatDateRange()}
        </div>

        <button
          onClick={goToNext}
          className="p-2 rounded hover:bg-newBoxHover transition-colors"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 text-newTextColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={goToToday}
          className="px-3 py-1.5 rounded border border-newBorder hover:bg-newBoxHover text-newTextColor text-sm transition-colors"
          disabled={isLoading}
        >
          Today
        </button>
      </div>

      {/* View switcher */}
      <div className="flex items-center gap-1 bg-newBgColorInner rounded-lg p-1">
        {(['day', 'week', 'month'] as const).map((viewType) => (
          <button
            key={viewType}
            onClick={() => setView(viewType)}
            className={`px-4 py-1.5 rounded capitalize text-sm transition-colors ${
              view === viewType
                ? 'bg-btnPrimary text-white'
                : 'text-textItemBlur hover:text-newTextColor'
            }`}
          >
            {viewType}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Calendar view renderer
 */
interface CalendarContentProps {
  onCreatePost: (date: dayjs.Dayjs) => void;
  onEditPost: (post: Post) => void;
}

const CalendarContent: React.FC<CalendarContentProps> = ({ onCreatePost, onEditPost }) => {
  const { view } = useCalendarStore();
  const { isLoading, error } = useCalendarContext();

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error loading calendar</div>
          <div className="text-textItemBlur text-sm">{error.message || 'Failed to load posts'}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-textItemBlur">Loading calendar...</div>
      </div>
    );
  }

  switch (view) {
    case 'day':
      return <DayView onCreate={onCreatePost} onEdit={onEditPost} />;
    case 'week':
      return <WeekView onCreate={onCreatePost} onEdit={onEditPost} />;
    case 'month':
      return <MonthView onCreate={onCreatePost} onEdit={onEditPost} />;
    default:
      return null;
  }
};

/**
 * Simple Post Creation Modal
 */
interface PostModalProps {
  date: dayjs.Dayjs | null;
  post?: Post | null;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ date, post, onClose }) => {
  if (!date) return null;

  return (
    <div className="fixed inset-0 bg-newBackdrop flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-newSettings rounded-lg border border-newBorder p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-newTextColor">
            {post ? 'Edit Post' : 'Create Post'}
          </h2>
          <button onClick={onClose} className="text-textItemBlur hover:text-newTextColor">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-textItemBlur mb-6">
          <p className="mb-2">
            Scheduled for: <span className="text-newTextColor font-semibold">{date.format('MMMM D, YYYY [at] HH:mm')}</span>
          </p>
          <p className="text-sm text-yellow-400">
            🚧 Full post creator with TipTap editor, AI assistant, and channel settings coming in Phase 4-6!
          </p>
        </div>

        <div className="bg-newBgColor rounded p-4 text-center text-textItemBlur">
          <p>For now, you can:</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>✅ Drag & drop posts to reschedule them</li>
            <li>✅ Delete posts (hover over post → trash icon)</li>
            <li>✅ Navigate calendar views (Day/Week/Month)</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-btnPrimary text-white rounded hover:bg-btnPrimaryHover transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Calendar Application
 */
const CalendarApp: React.FC = () => {
  const [modalDate, setModalDate] = useState<dayjs.Dayjs | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const handleCreatePost = (date: dayjs.Dayjs) => {
    setModalDate(date);
    setEditingPost(null);
  };

  const handleEditPost = (post: Post) => {
    setModalDate(dayjs(post.publishDate));
    setEditingPost(post);
  };

  const handleCloseModal = () => {
    setModalDate(null);
    setEditingPost(null);
  };

  return (
    <DndProvider>
      <CalendarProvider>
        <div className="postquee-calendar-app bg-newBgColor min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-newTextColor mb-6">PostQuee Calendar</h1>
            <CalendarHeader />
            <div className="bg-newBgColorInner rounded-lg border border-newBorder overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
              <CalendarContent onCreatePost={handleCreatePost} onEditPost={handleEditPost} />
            </div>
          </div>
        </div>

        {/* Post Creation/Edit Modal */}
        <PostModal date={modalDate} post={editingPost} onClose={handleCloseModal} />
      </CalendarProvider>
    </DndProvider>
  );
};

export default CalendarApp;
