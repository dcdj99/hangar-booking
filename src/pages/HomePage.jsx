import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import BookingForm from '../components/BookingForm';
import { addBooking } from '../store/bookingsSlice';
import { rooms } from '../config/rooms';
import { useBooking } from '../hooks/useBooking'; // Add this import

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { createBooking } = useBooking(); // Add this hook
  
  const bookings = useSelector(state => state.bookings.items);
  const bookingsStatus = useSelector(state => state.bookings.status);
  const bookingsError = useSelector(state => state.bookings.error);

  // Get today's date in YYYY-MM-DD format with proper timezone handling
  const today = useMemo(() => {
    const now = new Date();
    // Format using local timezone values to avoid issues with UTC conversion
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);
  
  // Get current time in HH:MM format
  const currentTime = useMemo(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }, []);

  // Debug the date format to ensure it matches bookings
  console.log("Today's date format:", today);
  console.log("Current time:", currentTime);
  console.log("Sample booking date format:", bookings.length > 0 ? bookings[0].date : "No bookings");

  // Get room availability status and next booking info
  const getRoomStatus = (room) => {
    // Get today's bookings for this room, filtered and properly sorted
    const todayBookings = bookings
      .filter(b => {
        const isMatch = b.roomId === room.id && 
                       b.date === today && 
                       b.startTime && 
                       b.endTime;
        return isMatch;
      })
      .sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return a.startTime.localeCompare(b.startTime);
      });

    if (todayBookings.length === 0) {
      return {
        isCurrentlyAvailable: true,
        statusText: 'Available All Day',
        nextBookingTime: null
      };
    }

    // Find current or next booking
    const currentBooking = todayBookings.find(booking => 
      currentTime >= booking.startTime && currentTime < booking.endTime
    );

    if (currentBooking) {
      // Room is currently booked - find next available time slot
      const currentBookingIndex = todayBookings.indexOf(currentBooking);
      let nextAvailableTime = currentBooking.endTime;
      let nextBookingTime = null;

      // Check for consecutive bookings
      for (let i = currentBookingIndex + 1; i < todayBookings.length; i++) {
        if (todayBookings[i].startTime > nextAvailableTime) {
          // Found a gap between bookings
          nextBookingTime = todayBookings[i].startTime;
          break;
        }
        // Update next available time if bookings are consecutive
        nextAvailableTime = todayBookings[i].endTime;
      }

      return {
        isCurrentlyAvailable: false,
        statusText: 'Currently Booked',
        availableAt: nextAvailableTime,
        nextBookingTime
      };
    } else {
      // Find next booking if room is currently available
      const nextBooking = todayBookings.find(booking => booking.startTime > currentTime);
      
      return {
        isCurrentlyAvailable: true,
        statusText: 'Currently Available',
        nextBookingTime: nextBooking ? nextBooking.startTime : null
      };
    }
  };

  // Handle card click - navigate to calendar view
  const handleCardClick = (room) => {
    navigate(`/room/${room.id}/calendar`);
  };

  // Handle quick book button click - open booking modal
  const handleQuickBook = (e, room) => {
    e.stopPropagation(); // Prevent card click from triggering
    setSelectedRoom(room);
    setIsModalOpen(true);
    // Remove initialDate when opening quick book modal to allow date selection
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      console.log('Booking submitted:', bookingData);
      
      // If bookingData already has an ID, it's coming from the form after creation
      if (bookingData.id) {
        // Just update the Redux store
        dispatch(addBooking(bookingData));
      } else {
        // First create in Firestore - this shouldn't happen as the form handles creation
        const bookingId = await createBooking({
          ...bookingData,
          roomId: selectedRoom.id
        });
        
        if (bookingId) {
          dispatch(addBooking({
            id: bookingId,
            ...bookingData,
            roomId: selectedRoom.id
          }));
        }
      }
      
      setIsModalOpen(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error handling booking:', error);
      alert('Failed to process booking: ' + error.message);
    }
  };

  // Show loading state
  if (bookingsStatus === 'loading') {
    return (
      <Layout title="Available Rooms">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading rooms...</div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (bookingsStatus === 'failed') {
    return (
      <Layout title="Available Rooms">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">Error loading bookings: {bookingsError}</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Available Rooms">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => {
          const status = getRoomStatus(room);
          
          return (
            <div 
              key={room.id}
              onClick={() => handleCardClick(room)}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            >
              <div className="relative h-48">
                <img 
                  src={room.image} 
                  alt={room.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    status.isCurrentlyAvailable ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {status.statusText}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold text-blue-800">{room.name}</h3>
                
                <div className="flex items-center mt-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Capacity: {room.capacity} people</span>
                </div>

                {/* Availability details */}
                <div className="mt-3">
                  {!status.isCurrentlyAvailable && status.availableAt && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Available at:</span> {status.availableAt}
                    </p>
                  )}
                  
                  {status.nextBookingTime && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Next booking:</span> {status.nextBookingTime}
                    </p>
                  )}

                  {status.isCurrentlyAvailable && !status.nextBookingTime && (
                    <p className="text-sm text-green-600 font-medium">
                      No more bookings today
                    </p>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  {/* <button 
                    onClick={(e) => handleQuickBook(e, room)}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Book Now
                  </button> */}
                  
                  <button 
                    className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded transition-colors duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(room);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    View Calendar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRoom(null);
        }}
        title={selectedRoom ? `Book ${selectedRoom.name}` : 'Book Room'}
      >
        {selectedRoom && (
          <BookingForm
            room={selectedRoom}
            onSubmit={handleBookingSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedRoom(null);
            }}
            // Remove initialDate prop to allow date selection
          />
        )}
      </Modal>
    </Layout>
  );
};

export default HomePage;
