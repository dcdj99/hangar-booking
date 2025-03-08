import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createBooking as createBookingService, updateBooking, deleteBooking as deleteBookingService } from '../firebase/bookingService';

export function useBooking() {
  // Combine related state into a single state object
  const [bookingState, setBookingState] = useState({
    isSubmitting: false,
    error: null
  });
  const { user } = useAuth();

  // Helper function to handle operation state
  const handleOperation = async (operation, ...args) => {
    if (!user) {
      setBookingState(prev => ({ ...prev, error: 'You must be logged in' }));
      return null;
    }

    setBookingState({ isSubmitting: true, error: null });
    
    try {
      const result = await operation(...args);
      setBookingState({ isSubmitting: false, error: null });
      return result;
    } catch (err) {
      console.error('Operation failed:', err);
      setBookingState({ isSubmitting: false, error: err.message || 'Operation failed' });
      return null;
    }
  };

  const createBooking = async (bookingData) => {
    return handleOperation(
      async () => await createBookingService(bookingData, user.uid)
    );
  };

  const editBooking = async (bookingId, updates) => {
    return handleOperation(
      async () => {
        await updateBooking(bookingId, {
          ...updates,
          userId: user.uid // Ensure userId is preserved
        }, user.uid);
        return true;
      }
    );
  };

  const deleteBooking = async (bookingId) => {
    return handleOperation(
      async () => {
        await deleteBookingService(bookingId, user.uid);
        return true;
      }
    );
  };

  return {
    createBooking,
    editBooking,
    deleteBooking,
    isSubmitting: bookingState.isSubmitting,
    error: bookingState.error,
    userId: user?.uid
  };
}
