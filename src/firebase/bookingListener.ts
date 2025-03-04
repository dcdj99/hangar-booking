import { collection, onSnapshot, query, where, Timestamp, Unsubscribe, QueryConstraint } from 'firebase/firestore';
import { db } from './config';
import { Booking, BOOKINGS_COLLECTION, serializeFirestoreData } from './bookingService';

type BookingCallback = (booking: Booking) => void;

/**
 * Set up a listener for new bookings in a specific room and date range
 * @param params Parameters to filter the bookings
 * @param onBookingAdded Callback function when a booking is added
 * @returns Unsubscribe function to stop listening
 */
export const listenForNewBookings = (
  params: {
    roomId?: number;
    startDate?: string;
    endDate?: string;
  },
  onBookingAdded: BookingCallback
): Unsubscribe => {
  const bookingsCollection = collection(db, BOOKINGS_COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (params.roomId !== undefined) {
    constraints.push(where('roomId', '==', params.roomId));
  }

  if (params.startDate) {
    constraints.push(where('date', '>=', params.startDate));
  }

  if (params.endDate) {
    constraints.push(where('date', '<=', params.endDate));
  }

  const bookingsQuery = constraints.length > 0
    ? query(bookingsCollection, ...constraints)
    : query(bookingsCollection);

  // Create a timestamp to track when we started listening
  const startListeningTime = new Date();

  // Set up the snapshot listener
  const unsubscribe = onSnapshot(
    bookingsQuery,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const bookingData = change.doc.data();
          const createdAt = bookingData.createdAt instanceof Timestamp
            ? bookingData.createdAt.toDate()
            : new Date(bookingData.createdAt);
          
          // Only process bookings that were created after we started listening
          // This prevents duplicate processing of existing bookings
          if (createdAt > startListeningTime) {
            const booking: Booking = {
              id: change.doc.id,
              ...serializeFirestoreData(bookingData)
            } as Booking;
            
            onBookingAdded(booking);
          }
        }
      });
    },
    (error) => {
      console.error('Error listening for bookings:', error);
    }
  );

  return unsubscribe;
};
