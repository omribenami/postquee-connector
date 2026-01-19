import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useCalendarStore, CalendarProvider, useCalendarContext } from './context';
import { DndProvider } from './components/DndProvider';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';
import { DayView } from './views/DayView';
import { PostCreatorModal } from '../post-creator/PostCreatorModal';
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
            className={`px-4 py-1.5 rounded capitalize text-sm transition-colors ${view === viewType
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
    // Check if it's the specific database corruption error
    const isChecksumError = error.message?.includes('checksum') || error.message?.includes('Corruption');

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6 bg-red-900/10 rounded-lg border border-red-500/20">
          <div className="text-red-500 text-lg mb-2 font-semibold">Unable to load posts</div>
          <div className="text-textItemBlur text-sm mb-4 max-w-md mx-auto">
            {isChecksumError
              ? 'The external database is currently experiencing issues. Please try again later.'
              : (error.message || 'Failed to load posts from the server.')}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-btnPrimary text-white rounded hover:bg-opacity-90 transition"
          >
            Retry Connection
          </button>
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
 * Main Calendar Application with Post Creator
 */
const CalendarAppInner: React.FC = () => {
  const [modalDate, setModalDate] = useState<dayjs.Dayjs | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [wordPressContent, setWordPressContent] = useState<{ title: string; content: string; featuredImage?: string } | null>(null);
  const { integrations, refresh } = useCalendarContext();

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

  const handleSuccess = () => {
    refresh(); // Refresh calendar after post creation
  };

  // Listen for "Send to PostQuee" messages from WordPress editor (Phase 7)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'POSTQUEE_OPEN_CREATOR') {
        const payload = event.data.payload;

        // Set WordPress content for pre-filling
        setWordPressContent({
          title: payload.title || '',
          content: payload.content || '',
          featuredImage: payload.featuredImage || '',
        });

        // Open modal with current date
        setModalDate(dayjs());
        setEditingPost(null);
      }
    };

    // Add event listener
    window.addEventListener('message', handleMessage);

    // Check sessionStorage for pending message (from page navigation)
    const pendingMessage = sessionStorage.getItem('postquee_pending_message');
    if (pendingMessage) {
      try {
        const payload = JSON.parse(pendingMessage);
        setWordPressContent({
          title: payload.title || '',
          content: payload.content || '',
          featuredImage: payload.featuredImage || '',
        });
        setModalDate(dayjs());
        setEditingPost(null);

        // Clear the pending message
        sessionStorage.removeItem('postquee_pending_message');
      } catch (e) {
        console.error('Failed to parse pending message:', e);
      }
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Clear WordPress content when modal closes
  useEffect(() => {
    if (!modalDate) {
      setWordPressContent(null);
    }
  }, [modalDate]);

  return (
    <>
      <div className="postquee-calendar-app flex flex-col w-full h-full bg-newBgColor">
        <div className="flex-shrink-0 px-6 pt-4">
          <h1 className="text-2xl font-bold text-newTextColor mb-4">PostQuee Calendar</h1>
          <CalendarHeader />
        </div>
        <div className="flex-1 px-6 pb-6" style={{ minHeight: 0 }}>
          <div
            className="bg-newBgColorInner rounded-lg border border-newBorder overflow-hidden h-full"
          >
            <CalendarContent onCreatePost={handleCreatePost} onEditPost={handleEditPost} />
          </div>
        </div>
      </div>

      {/* Full Post Creator Modal */}
      {modalDate && (
        <PostCreatorModal
          date={modalDate}
          post={editingPost}
          integrations={integrations}
          wordPressContent={wordPressContent}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

/**
 * Main Calendar Application
 */
const CalendarApp: React.FC = () => {
  return (
    <DndProvider>
      <CalendarProvider>
        <CalendarAppInner />
      </CalendarProvider>
    </DndProvider>
  );
};

export default CalendarApp;
