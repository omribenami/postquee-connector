import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/globals.css';
import CalendarApp from './CalendarApp';

// WordPress integration: Mount React app when DOM is ready
const mountApp = () => {
  const rootElement = document.getElementById('postquee-calendar-root');

  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<CalendarApp />);
  } else {
    // Expected behavior on non-calendar pages
  }
};

// Mount on DOMContentLoaded or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
