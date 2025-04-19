import { configureStore } from '@reduxjs/toolkit';
import editorReducer from './editorSlice';

export const store = configureStore({
  reducer: {
    editor: editorReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['editor/setImage'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload'],
        // Ignore these paths in the state
        ignoredPaths: ['editor.image'],
      },
    }),
}); 