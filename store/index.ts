import { configureStore } from '@reduxjs/toolkit';
import factFindReducer from './slices/factFindSlice';

export const store = configureStore({
  reducer: {
    factFind: factFindReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in certain paths if needed (e.g. Dates)
        ignoredActions: ['factFind/setSelectedSubmission'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
