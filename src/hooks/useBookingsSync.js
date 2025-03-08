import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { listenForNewBookings } from '../firebase/bookingListener';
import { bookingReceived, bookingUpdated, bookingRemoved } from '../store/bookingsSlice';

export function useBookingsSync() {
  const dispatch = useDispatch();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for booking changes
    const unsubscribe = listenForNewBookings(
      {}, // Empty params to listen to all bookings
      (changeData) => {
        const { type, booking } = changeData;
        
        if (type === 'added') {
          console.log('Booking added:', booking);
          dispatch(bookingReceived(booking));
        } else if (type === 'modified') {
          console.log('Booking updated:', booking);
          dispatch(bookingUpdated(booking));
        } else if (type === 'removed') {
          console.log('Booking removed:', booking);
          dispatch(bookingRemoved(booking.id));
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [dispatch, user]);
}
