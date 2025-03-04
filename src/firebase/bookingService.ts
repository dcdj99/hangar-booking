import { collection, addDoc, query, where, getDocs, Timestamp, CollectionReference, Query, QueryFieldFilterConstraint, DocumentData, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';

export const BOOKINGS_COLLECTION = 'bookings';

export interface Booking {
  id?: string;
  roomId: number;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  company: string;
  createdAt?: Date;
}

// Shared helper function now exported
export const serializeFirestoreData = (doc: any) => {
  const data = doc instanceof Object ? (doc.data ? doc.data() : doc) : doc;
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value instanceof Timestamp) {
      acc[key] = value.toDate().toISOString();
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
};

export const createBooking = async (booking: Booking, userId: string): Promise<string> => {
  try {
    if (!userId) {
      throw new Error('User is not authenticated');
    }

    // Check if booking already exists first
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(bookingsRef, 
      where('roomId', '==', booking.roomId),
      where('date', '==', booking.date),
      where('startTime', '==', booking.startTime),
      where('endTime', '==', booking.endTime)
    );
    
    const existingBookings = await getDocs(q);
    if (!existingBookings.empty) {
      throw new Error('This booking already exists');
    }

    // If no duplicate, create the booking
    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
      ...booking,
      createdAt: Timestamp.now(),
      userId: userId
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getBookings = async (params: {
  roomId?: number;
  startDate?: string;
  endDate?: string;
}): Promise<Booking[]> => {
  try {
    const bookingsCollection = collection(db, BOOKINGS_COLLECTION);
    const conditions: QueryFieldFilterConstraint[] = [];

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
    })) as Booking[];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const updateBooking = async (bookingId: string, updates: Partial<Booking>, userId: string): Promise<void> => {
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

export const deleteBooking = async (bookingId: string, userId: string): Promise<void> => {
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
