import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/globals.css';

const CalendarApp: React.FC = () => {
  return (
    <div className="postquee-calendar-app bg-newBgColor min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-btnPrimary mb-4">
          PostQuee Calendar
        </h1>
        <p className="text-newTextColor text-lg">
          Hello World! React + TypeScript + Tailwind is working! 🎉
        </p>
        <div className="mt-8 p-6 bg-newBgColorInner rounded-lg border border-newBorder">
          <p className="text-textColor mb-2">
            Testing PostQuee color scheme:
          </p>
          <div className="flex gap-4 mt-4">
            <div className="w-20 h-20 bg-btnPrimary rounded flex items-center justify-center text-white text-xs">
              Primary
            </div>
            <div className="w-20 h-20 bg-newSettings rounded flex items-center justify-center text-white text-xs">
              Settings
            </div>
            <div className="w-20 h-20 bg-newBoxFocused rounded flex items-center justify-center text-white text-xs">
              Focused
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// WordPress integration: Mount React app when DOM is ready
const mountApp = () => {
  const rootElement = document.getElementById('postquee-calendar-root');

  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<CalendarApp />);
  } else {
    console.error('PostQuee: Could not find #postquee-calendar-root element');
  }
};

// Mount on DOMContentLoaded or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
