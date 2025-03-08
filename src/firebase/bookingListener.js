import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { BOOKINGS_COLLECTION, serializeFirestoreData } from './bookingService';

/**
 * Set up a listener for new bookings in a specific room and date range
 * @param {Object} params Parameters to filter the bookings
 * @param {Function} callback Callback function when booking changes occur
 * @returns {Function} Unsubscribe function to stop listening
 */
export const listenForNewBookings = (params, callback) => {
  try {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const constraints = [];

    if (params.roomId !== undefined) {
      constraints.push(where('roomId', '==', params.roomId));
    }

    if (params.startDate) {
      constraints.push(where('date', '>=', params.startDate));
    }

    if (params.endDate) {
      constraints.push(where('date', '<=', params.endDate));
    }

    const q = constraints.length > 0 ? query(bookingsRef, ...constraints) : query(bookingsRef);

    // Set up the snapshot listener
    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const bookingData = change.doc.data();
        const booking = {
          id: change.doc.id,
          ...serializeFirestoreData(bookingData)
        };

        callback({
          type: change.type, // 'added', 'modified', or 'removed'
          booking
        });
      });
    }, (error) => {
      console.error('Error listening for bookings:', error);
    });
  } catch (error) {
    console.error('Error setting up booking listener:', error);
    throw error;
  }
};
