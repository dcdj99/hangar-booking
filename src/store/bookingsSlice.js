import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBookings } from '../firebase/bookingService';

// Add back the isTimeSlotAvailable utility function
export const isTimeSlotAvailable = (bookings, newBooking) => {
  const conflictingBookings = bookings.filter(booking => 
    booking.roomId === newBooking.roomId && 
    booking.date === newBooking.date &&
    !(
      (newBooking.startTime >= booking.endTime) || 
      (newBooking.endTime <= booking.startTime)
    )
  );
  
  return conflictingBookings.length === 0;
};

export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (params) => {
    const bookings = await getBookings(params);
    return bookings;
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {
    bookingsLoading(state) {
      if (state.status === 'idle') {
        state.status = 'loading';
      }
    },
    bookingsLoaded(state, action) {
      if (state.status === 'loading') {
        state.items = action.payload;
        state.status = 'succeeded';
      }
    },
    bookingReceived(state, action) {
      // Make sure we don't add duplicates
      if (!state.items.find(booking => booking.id === action.payload.id)) {
        state.items.push(action.payload);
      }
    },
    bookingUpdated(state, action) {
      const index = state.items.findIndex(booking => booking.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    bookingRemoved(state, action) {
      state.items = state.items.filter(booking => booking.id !== action.payload);
    },
    bookingsError(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
    addBooking: (state, action) => {
      const newBooking = action.payload;
      // Check if booking with same ID already exists
      const exists = state.items.some(b => b.id === newBooking.id);
      if (!exists) {
        state.items.push(newBooking);
      }
    },
    removeBooking: (state, action) => {
      const bookingId = action.payload;
      state.items = state.items.filter(booking => booking.id !== bookingId);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { 
  bookingsLoading, 
  bookingsLoaded, 
  bookingReceived, 
  bookingUpdated, 
  bookingRemoved, 
  bookingsError, 
  addBooking, 
  removeBooking 
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
