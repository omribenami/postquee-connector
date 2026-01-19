import React from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

/**
 * Drag and Drop Provider
 * Wraps the calendar with react-dnd context
 */
export const DndProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ReactDndProvider backend={HTML5Backend}>{children}</ReactDndProvider>;
};
