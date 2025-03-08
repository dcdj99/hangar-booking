import { collection, addDoc, query, where, getDocs, Timestamp, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';

export const BOOKINGS_COLLECTION = 'bookings';

// Shared helper function now exported
export const serializeFirestoreData = (doc) => {
  const data = doc instanceof Object ? (doc.data ? doc.data() : doc) : doc;
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value instanceof Timestamp) {
      acc[key] = value.toDate().toISOString();
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const createBooking = async (booking, userId) => {
  try {
    if (!userId) {
      throw new Error('User is not authenticated');
    }

    // Check if booking already exists first - improved duplicate detection
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    
    // Ensure we're using exact matches with proper data types
    const roomId = typeof booking.roomId === 'string' ? parseInt(booking.roomId, 10) : booking.roomId;
    
    const q = query(bookingsRef, 
      where('roomId', '==', roomId),
      where('date', '==', booking.date),
      where('startTime', '==', booking.startTime),
      where('endTime', '==', booking.endTime)
    );
    
    const existingBookings = await getDocs(q);
    
    // Only throw if there's an actual conflict (not our own new booking)
    if (!existingBookings.empty) {
      // Check if it's not our own booking (e.g., when retrying a submission)
      const conflictingBooking = existingBookings.docs[0].data();
      if (conflictingBooking.userId === userId && 
          conflictingBooking.name === booking.name && 
          conflictingBooking.company === booking.company) {
        // It's likely a duplicate submission of the same booking
        console.log('Duplicate submission detected, returning existing booking ID');
        return existingBookings.docs[0].id;
      } else {
        throw new Error('This booking already exists');
      }
    }

    // If no duplicate, create the booking
    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
      ...booking,
      roomId: roomId, // Ensure consistent type
      createdAt: Timestamp.now(),
      userId: userId
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getBookings = async (params) => {
  try {
    const bookingsCollection = collection(db, BOOKINGS_COLLECTION);
    const conditions = [];

    if (params.roomId) {
      conditions.push(where('roomId', '==', params.roomId));
    }

    if (params.startDate) {
      conditions.push(where('date', '>=', params.startDate));
    }

    if (params.endDate) {
      conditions.push(where('date', '<=', params.endDate));
    }

    const bookingsQuery = conditions.length > 0
      ? query(bookingsCollection, ...conditions)
      : bookingsCollection;

    const querySnapshot = await getDocs(bookingsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...serializeFirestoreData(doc)
    }));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const updateBooking = async (bookingId, updates, userId) => {
  try {
    if (!userId) {
      throw new Error('User is not authenticated');
    }

    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

export const deleteBooking = async (bookingId, userId) => {
  try {
    if (!userId) {
      throw new Error('User is not authenticated');
    }

    // First, get the booking to check ownership
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingData = bookingSnap.data();
    
    // Verify ownership - only the booking creator or admin can delete
    if (bookingData.userId !== userId) {
      throw new Error('You do not have permission to delete this booking');
    }

    // Delete the booking
    await deleteDoc(bookingRef);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};
