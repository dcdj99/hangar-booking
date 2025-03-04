import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './config';
import { serializeFirestoreData } from './bookingService';

export const listenForNewBookings = (params, callback) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const constraints = [];

    if (params.roomId) {
      constraints.push(where('roomId', '==', params.roomId));
    }
    if (params.startDate) {
      constraints.push(where('date', '>=', params.startDate));
    }
    if (params.endDate) {
      constraints.push(where('date', '<=', params.endDate));
    }

    const q = constraints.length > 0 ? query(bookingsRef, ...constraints) : bookingsRef;

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const booking = {
          id: change.doc.id,
          ...serializeFirestoreData(change.doc)
        };

        callback({
          type: change.type, // 'added', 'modified', or 'removed'
          booking
        });
      });
    });
  } catch (error) {
    console.error('Error setting up booking listener:', error);
    throw error;
  }
};
