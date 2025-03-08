import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import RoomCalendar from '../components/RoomCalendar';
import { rooms } from '../config/rooms';
import { useBooking } from '../hooks/useBooking';
import Modal from '../components/Modal';
import BookingForm from '../components/BookingForm';
import { useDateTimeUtils } from '../hooks/useDateTimeUtils';
import { useDispatch } from 'react-redux';
import { removeBooking } from '../store/bookingsSlice';

const RoomCalendarPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { createBooking, editBooking, deleteBooking, error } = useBooking();
  const { dateUtils } = useDateTimeUtils();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);

  const numericRoomId = parseInt(roomId, 10);
  const room = rooms.find(r => r.id === numericRoomId);

  // Ensure consistent date formatting
  const formatDateForBooking = useCallback((date) => {
    if (!date) return null;
    
    // Handle both Date objects and string dates
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return date; // If already formatted, return as is
  }, []);

  const handleBookRoom = (selectedDay, existingBooking = null) => {
    console.log('Opening booking form:', { 
      selectedDay,
      existingBooking,
      type: selectedDay instanceof Date ? 'Date object' : typeof selectedDay
    });
    
    if (existingBooking) {
      setEditingBooking({
        ...existingBooking,
        onEdit: editBooking // Pass the edit function
      });
      setSelectedDate(existingBooking.date);
    } else {
      setEditingBooking(null);
      const formattedDate = formatDateForBooking(selectedDay);
      console.log('Formatted date for form:', formattedDate); // Debug
      setSelectedDate(formattedDate);
    }
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      console.log('Submitting booking:', { editingBooking, bookingData });
      
      if (editingBooking?.id) {
        // For editing, pass the ID and use editBooking function
        await editBooking(editingBooking.id, {
          ...bookingData,
          roomId: room.id,
          userId: editingBooking.userId
        });
      } else {
        // For new bookings
        await createBooking({
          ...bookingData,
          roomId: room.id
        });
      }
      setIsModalOpen(false);
      setSelectedDate(null);
      setEditingBooking(null);
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      const success = await deleteBooking(bookingId);
      if (success) {
        // Update Redux store to remove the booking
        dispatch(removeBooking(bookingId));
      }
    } catch (err) {
      console.error('Delete booking failed:', err);
    }
  };

  // Redirect if room not found
  if (!room) {
    return (
      <Layout title="Room Not Found">
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-red-600 mb-4">Room not found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${room.name} Calendar`}>
      <div className="flex flex-col h-full max-w-5xl mx-auto">
        <div className="mb-6">
          <button 
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-colors duration-300" 
            onClick={() => navigate('/')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Rooms
          </button>
        </div>
        
        <RoomCalendar 
          room={room}
          onBookRoom={handleBookRoom}
          onDeleteBooking={handleDeleteBooking}
        />

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
            setEditingBooking(null);
          }}
          title={editingBooking ? `Edit Booking - ${room.name}` : `Book ${room.name}`}
        >
          <BookingForm
            room={room}
            initialDate={selectedDate}
            editBooking={editingBooking}
            onSubmit={handleBookingSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedDate(null);
              setEditingBooking(null);
            }}
          />
        </Modal>

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RoomCalendarPage;
