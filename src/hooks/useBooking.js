import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createBooking as createBookingService, updateBooking, deleteBooking as deleteBookingService } from '../firebase/bookingService';

export function useBooking() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const createBooking = async (bookingData) => {
    if (!user) {
      setError('You must be logged in to make a booking');
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bookingId = await createBookingService(bookingData, user.uid);
      setIsSubmitting(false);
      return bookingId;
    } catch (err) {
      setError(err.message || 'Failed to create booking');
      setIsSubmitting(false);
      return null;
    }
  };

  const editBooking = async (bookingId, updates) => {
    if (!user) {
      setError('You must be logged in to edit a booking');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Updating booking:', { bookingId, updates });
      await updateBooking(bookingId, {
        ...updates,
        userId: user.uid // Ensure userId is preserved
      }, user.uid);
      setIsSubmitting(false);
      return true;
    } catch (err) {
      console.error('Edit failed:', err);
      setError(err.message || 'Failed to update booking');
      setIsSubmitting(false);
      return false;
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!user) {
      setError('You must be logged in to delete a booking');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await deleteBookingService(bookingId, user.uid);
      setIsSubmitting(false);
      return true;
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete booking');
      setIsSubmitting(false);
      return false;
    }
  };

  return {
    createBooking,
    isSubmitting,
    error,
    userId: user?.uid,
    editBooking,
    deleteBooking,
  };
}
