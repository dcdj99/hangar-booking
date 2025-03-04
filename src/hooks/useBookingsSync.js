import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { listenForNewBookings } from '../firebase/bookingListener';
import { bookingReceived } from '../store/bookingsSlice';

export function useBookingsSync() {
  const dispatch = useDispatch();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for new bookings
    const unsubscribe = listenForNewBookings(
      {}, // Empty params to listen to all bookings
      (newBooking) => {
        dispatch(bookingReceived(newBooking));
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [dispatch, user]);
}
