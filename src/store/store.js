import { configureStore } from '@reduxjs/toolkit';
import bookingsReducer from './bookingsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    bookings: bookingsReducer,
    ui: uiReducer
  },
});
