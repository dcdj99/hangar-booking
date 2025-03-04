import { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { useDateTimeUtils } from './useDateTimeUtils';
import { setSelectedDate } from '../store/uiSlice';

export const useCalendar = (room) => {
  const { dateUtils } = useDateTimeUtils();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { user } = useAuth();

  const bookings = useSelector(state => state.bookings.items);
  const bookingsStatus = useSelector(state => state.bookings.status);
  const bookingsError = useSelector(state => state.bookings.error);
  const selectedDateString = useSelector(state => state.ui.selectedDate);

  const roomBookings = useMemo(() => 
    bookings.filter(b => b.roomId === room.id),
    [bookings, room.id]
  );

  const selectedDate = useMemo(() => 
    selectedDateString ? dateUtils.parseDate(selectedDateString) : null,
    [selectedDateString, dateUtils]
  );

  const hasBookingsForDate = useCallback((date) => {
    if (!date) return false;
    const formattedDate = dateUtils.formatDateForBooking(date);
    return roomBookings.some(booking => booking.date === formattedDate);
  }, [roomBookings, dateUtils]);

  const getBookingsForDate = useCallback((date) => {
    if (!date) return [];
    const formattedDate = dateUtils.formatDateForBooking(date);
    return roomBookings.filter(booking => booking.date === formattedDate);
  }, [roomBookings, dateUtils]);

  const handleDayClick = (day) => {
    if (day.date && dateUtils.isDateBookable(day.date)) {
      dispatch(setSelectedDate(dateUtils.formatDateForBooking(day.date)));
    }
  };

  return {
    currentDate,
    setCurrentDate,
    selectedDate,
    loading,
    setLoading,
    error,
    setError,
    bookingsStatus,
    bookingsError,
    dateUtils,
    roomBookings,
    hasBookingsForDate,
    getBookingsForDate,
    handleDayClick,
    user
  };
};
