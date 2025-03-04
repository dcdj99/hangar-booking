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
    bookingReceived: (state, action) => {
      const { type, booking } = action.payload;
      let index;
      
      switch (type) {
        case 'added':
          // Check for duplicates before adding
          if (!state.items.some(b => (
            b.roomId === booking.roomId &&
            b.date === booking.date &&
            b.startTime === booking.startTime &&
            b.endTime === booking.endTime
          ))) {
            state.items.push(booking);
          }
          break;
        
        case 'modified':
          index = state.items.findIndex(b => b.id === booking.id);
          if (index !== -1) {
            state.items[index] = booking;
          }
          break;
        
        case 'removed':
          state.items = state.items.filter(b => b.id !== booking.id);
          break;
      }
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

export const { bookingReceived, addBooking, removeBooking } = bookingsSlice.actions;
export default bookingsSlice.reducer;
