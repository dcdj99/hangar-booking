import React, { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';  // Add this import
import { useCalendar } from '../hooks/useCalendar';
import CalendarHeader from './calendar/CalendarHeader';
import { useDispatch } from 'react-redux';
import { listenForNewBookings } from '../firebase/bookingListener';
import { bookingReceived } from '../store/bookingsSlice';


const RoomCalendar = ({ room, onBookRoom, onDeleteBooking }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const {
    currentDate,
    setCurrentDate,
    selectedDate,
    loading,
    error,
    bookingsStatus,
    bookingsError,
    dateUtils,
    hasBookingsForDate,
    getBookingsForDate,
    handleDayClick,
  } = useCalendar(room);

  // Add real-time listener for bookings
  useEffect(() => {
    if (!user || !room.id) return;

    const currentMonth = new Date(currentDate);
    const startDate = dateUtils.formatDateForBooking(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
    const endDate = dateUtils.formatDateForBooking(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));

    const unsubscribe = listenForNewBookings(
      {
        roomId: room.id,
        startDate,
        endDate
      },
      (changeData) => {
        dispatch(bookingReceived(changeData));
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, room.id, currentDate, dateUtils, dispatch]);

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar generation
  const generateCalendarDays = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const days = [];
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        hasBookings: hasBookingsForDate(date),
        isBookable: dateUtils.isDateBookable(date)
      });
    }
    
    return days;
  }, [dateUtils, hasBookingsForDate]);

  const handleCalendarDayClick = useCallback((day) => {
    if (day.date && dateUtils.isDateBookable(day.date)) {
      // Only call handleDayClick to update selected date
      // Don't call onBookRoom here anymore
      handleDayClick(day);
    }
  }, [dateUtils, handleDayClick]);

  // Loading and error states
  if (loading || bookingsStatus === 'loading') {
    return <LoadingState />;
  }

  if (error || bookingsError) {
    return <ErrorState error={error || bookingsError} />;
  }

  const calendarDays = generateCalendarDays(currentDate);
  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

 
  return (
    <div className="flex flex-col h-full">
      <RoomInfo room={room} />
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <CalendarHeader 
          currentDate={currentDate}
          onPrevMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
        />
        
        <CalendarGrid 
          calendarDays={calendarDays}
          selectedDate={selectedDate}
          onDayClick={handleCalendarDayClick}
        />
      </div>
      
      {selectedDate && (
        <SelectedDateView 
          selectedDate={selectedDate}
          bookings={selectedDateBookings}
          isDateBookable={dateUtils.isDateBookable(selectedDate)}
          onBookRoom={onBookRoom}
          onDeleteBooking={onDeleteBooking}
          currentUserId={user?.uid}
        />
      )}
    </div>
  );
};

// Subcomponents (could be moved to separate files if they grow)
const LoadingState = () => (
  <div className="flex flex-col h-full items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <p className="mt-4 text-gray-600">Loading calendar...</p>
    <p className="text-sm text-gray-500 mt-2">This should only take a few seconds</p>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="flex flex-col h-full items-center justify-center py-12 bg-red-50 rounded-lg">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h3 className="mt-2 text-lg font-semibold text-red-700">Error Loading Calendar</h3>
    <p className="mt-1 text-red-600">{error}</p>
    <button 
      onClick={() => window.location.reload()} 
      className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Try Again
    </button>
  </div>
);

const RoomInfo = ({ room }) => (
  <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
    <div className="flex items-center">
      <img src={room.image} alt={room.name} className="w-24 h-24 rounded-lg object-cover mr-6 shadow-sm" />
      <div>
        <h3 className="text-2xl font-bold text-blue-800">{room.name}</h3>
        <div className="flex items-center mt-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Capacity: {room.capacity} people</span>
        </div>
      </div>
    </div>
  </div>
);

const CalendarGrid = ({ calendarDays, selectedDate, onDayClick }) => (
  <div className="grid grid-cols-7 gap-2 mb-2">
    <div className="text-center font-semibold text-gray-500 text-sm">Su</div>
    <div className="text-center font-semibold text-gray-500 text-sm">Mo</div>
    <div className="text-center font-semibold text-gray-500 text-sm">Tu</div>
    <div className="text-center font-semibold text-gray-500 text-sm">We</div>
    <div className="text-center font-semibold text-gray-500 text-sm">Th</div>
    <div className="text-center font-semibold text-gray-500 text-sm">Fr</div>
    <div className="text-center font-semibold text-gray-500 text-sm">Sa</div>
    
    {calendarDays.map((day, index) => (
      <div 
        key={index}
        className={`
          text-center py-3 rounded-lg transition-all duration-200 relative
          ${day.isCurrentMonth ? (day.isBookable ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-not-allowed bg-gray-50') : 'text-gray-400'}
          ${day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
          ${day.date && selectedDate && (
              selectedDate instanceof Date 
                ? day.date.toDateString() === selectedDate.toDateString()
                : day.date.toISOString().split('T')[0] === selectedDate
            )
            ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
          ${day.hasBookings && day.isCurrentMonth ? 'font-semibold' : ''}
          ${!day.isBookable && day.isCurrentMonth ? 'text-gray-400' : ''}
        `}
        onClick={() => day.date && onDayClick(day)}
      >
        {day.date ? (
          <>
            <span className="inline-block">{day.date.getDate()}</span>
            {day.hasBookings && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
            {!day.isBookable && day.isCurrentMonth && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg"></div>
            )}
          </>
        ) : null}
      </div>
    ))}
  </div>
);

const SelectedDateView = ({ selectedDate, bookings, isDateBookable, onBookRoom, onDeleteBooking, currentUserId }) => (
  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
    <h4 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {selectedDate.toDateString()}
    </h4>
    
    {/* Show existing bookings sorted by time */}
    {bookings.length > 0 && (
      <div className="space-y-3 mb-6">
        <h5 className="text-sm font-medium text-gray-500 mb-2">Existing Bookings:</h5>
        {[...bookings]
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .map(booking => (
            <div key={booking.id} className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors duration-300">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-800">{booking.startTime} - {booking.endTime}</span>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Booked</span>
                  {booking.userId === currentUserId && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookRoom(selectedDate, booking); // Pass both date and booking
                        }}
                        className="text-xs px-2 py-1 text-gray-600 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this booking?')) {
                            onDeleteBooking(booking.id);
                          }
                        }}
                        className="text-xs px-2 py-1 text-gray-600 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mt-2">Booked by: {booking.name}, {booking.company}</p>
            </div>
          ))}
      </div>
    )}

    {/* Always show booking button if date is bookable */}
    {isDateBookable && (
      <div className="text-center py-8 bg-green-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <p className="text-gray-600 mb-4">
          {bookings.length > 0 
            ? "Some time slots are still available!"
            : "This day is available! No bookings yet."}
        </p>
        <button 
          type="button" // Add type="button" to prevent form submission
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition-colors duration-300"
          onClick={() => onBookRoom(selectedDate)} // This now explicitly opens the booking form
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Book This Room
        </button>
      </div>
    )}
  </div>
);

export default RoomCalendar;
