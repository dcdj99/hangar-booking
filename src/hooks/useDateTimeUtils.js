import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useBooking } from './useBooking';
import { isTimeSlotAvailable } from '../store/bookingsSlice';

export const useDateTimeUtils = (room, initialDate, editBooking = null) => {
  const getCurrentDate = useCallback(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }, []);

  const getCurrentTimeSlot = useCallback(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = Math.floor(now.getMinutes() / 15) * 15;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }, []);

  const generateTimeSlots = useCallback(() => {
    const slots = [];
    // Generate slots from 00:00 to 23:45
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push(
          `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        );
      }
    }
    return slots;
  }, []);

  const generateEndTimeSlots = useCallback(() => {
    const slots = [];
    // Generate slots from 00:00 to 23:45 (include all times, even on the hour)
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 0 && minute === 0) continue; // Skip 00:00 as it's not a valid end time
        slots.push(
          `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        );
      }
    }
    // Add 23:59 as the last possible end time
    slots.push('23:59');
    return slots;
  }, []);

  const dateUtils = useMemo(() => ({
    isDateInPast: (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    },
    isDateTooFarInFuture: (date) => {
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      oneMonthFromNow.setHours(0, 0, 0, 0);
      return date >= oneMonthFromNow;
    },
    isDateBookable: (date) => {
      if (!date) return false;
      return !dateUtils.isDateInPast(date) && !dateUtils.isDateTooFarInFuture(date);
    },
    formatDateForBooking: (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    parseDate: (dateString) => {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    },
    isTimeInPast: (time, date) => {
      const selectedDate = date || getCurrentDate();
      if (selectedDate !== getCurrentDate()) return false;
      
      const [hours, minutes] = time.split(':').map(Number);
      const [currentHours, currentMinutes] = getCurrentTimeSlot().split(':').map(Number);
      
      if (hours < currentHours) return true;
      if (hours === currentHours && minutes <= currentMinutes) return true;
      return false;
    }
  }), [getCurrentTimeSlot, getCurrentDate]);

  const dateLimits = useMemo(() => ({
    minDate: getCurrentDate(),
    maxDate: (() => {
      const today = new Date();
      today.setMonth(today.getMonth() + 1);
      return today.toISOString().split('T')[0];
    })()
  }), [getCurrentDate]);

  const timeSlots = useMemo(generateTimeSlots, [generateTimeSlots]);
  const endTimeSlots = useMemo(generateEndTimeSlots, [generateEndTimeSlots]);

  // Add booking-specific state and logic
  const bookings = useSelector(state => state.bookings.items);
  const { createBooking, isSubmitting, error: submitError } = useBooking();
  const [timeError, setTimeError] = useState('');
  
  // Move formData declaration after getAvailableTimes
  const getAvailableTimes = useCallback((date, startTime) => {
    // Filter out the booking being edited from availability checks
    const relevantBookings = bookings.filter(b => 
      b.date === date && 
      b.roomId === room?.id && 
      (!editBooking?.id || b.id !== editBooking.id)
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));

    const isToday = date === getCurrentDate();
    const currentTimeSlot = isToday ? getCurrentTimeSlot() : '00:00';

    // Helper to calculate max end time (4 hours after start)
    const getMaxEndTime = (time) => {
      if (!time) return null;
      const [hours, minutes] = time.split(':').map(Number);
      let newHours = hours + 4;
      return newHours >= 24 ? '23:59' : `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    // Find next available booking after the given time
    const getNextBookingStart = (afterTime) => {
      const nextBooking = relevantBookings.find(b => b.startTime > afterTime);
      return nextBooking ? nextBooking.startTime : '23:59';
    };

    return {
      availableStartTimes: timeSlots
        .filter(time => {
          if (isToday && time < currentTimeSlot) return false;
          
          // When editing, always allow the original start time
          if (editBooking && time === editBooking.startTime) return true;
          
          // Can't start during another booking
          return !relevantBookings.some(b => 
            time >= b.startTime && time < b.endTime
          );
        }),
      availableEndTimes: endTimeSlots
        .filter(time => {
         
          if (time <= startTime) return false;
          
          // Check 4-hour limit
          const maxEndTime = getMaxEndTime(startTime);
          if (time > maxEndTime) return false;
          

          // When editing, always allow the original end time
          if (editBooking && time === editBooking.endTime && startTime === editBooking.startTime) return true;
          
          // Find next booking's start time
          const nextBookingStart = getNextBookingStart(startTime);
          
          // Allow booking until the start of next booking (inclusive)
          if (time > nextBookingStart) return false;
          
       
          // For overlapping check, exclude times that fall within existing bookings
          // but specifically allow booking to end exactly at the start time of another booking
          for (const booking of relevantBookings) {
            // Inside another booking's time range (but not at its exact start)
            if (time > booking.startTime && time < booking.endTime) {
            
              return false;
            }
            
            // If this time equals a booking's start time but is NOT the very next booking,
            // then don't allow it (prevents creating gaps)
            if (time === booking.startTime && booking.startTime !== nextBookingStart) {   
             
              return false;
            }
          }
          
          return true;
        })
    };
  }, [bookings, timeSlots, endTimeSlots, getCurrentDate, getCurrentTimeSlot, room, editBooking]);

  // Calculate available times first
  const { availableStartTimes: initialAvailableStartTimes } = useMemo(() => {
    const currentTime = getCurrentTimeSlot();
    return getAvailableTimes(initialDate || getCurrentDate(), currentTime);
  }, [getAvailableTimes, getCurrentDate, getCurrentTimeSlot, initialDate]);

  // Now we can initialize formData with the calculated available times
  const [formData, setFormData] = useState(() => {
    if (editBooking) {
      // When editing, use the existing booking data
      return {
        date: editBooking.date,
        startTime: editBooking.startTime,
        endTime: editBooking.endTime,
        name: editBooking.name,
        company: editBooking.company
      };
    }
    // For new bookings, use the default initialization
    return {
      date: initialDate || getCurrentDate(),
      startTime: initialDate ? initialAvailableStartTimes[0] || '' : '',
      endTime: '',
      name: '',
      company: ''
    };
  });

  // Update available times based on form data changes
  const { availableStartTimes: currentAvailableStartTimes, availableEndTimes: currentAvailableEndTimes } = useMemo(() => 
    getAvailableTimes(formData.date, formData.startTime),
    [formData.date, formData.startTime, getAvailableTimes]
  );

  // Define isValidTimeRange with useCallback to maintain reference stability
  const isValidTimeRange = useCallback((startTime, endTime) => {
    // Special case: if end time is midnight (00:00), it's always valid
    if (endTime === '00:00') return true;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Convert to minutes for easier comparison
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return endMinutes > startMinutes;
  }, []);

  // When formData.startTime changes, set a default endTime
  useEffect(() => {
    if (formData.startTime && currentAvailableEndTimes.length > 0) {
      // Start time has changed, we need to check if end time is still valid
      if (formData.endTime) {
        // Check if the current end time is still valid after changing start time
        const isCurrentEndTimeValid = currentAvailableEndTimes.includes(formData.endTime) && 
                                      isValidTimeRange(formData.startTime, formData.endTime);
        
        if (!isCurrentEndTimeValid) {
          // End time is no longer valid, pick a new one
          setFormData(prev => ({
            ...prev,
            endTime: currentAvailableEndTimes[0]
          }));
        }
      } else {
        // No end time set yet, pick the first available one
        setFormData(prev => ({
          ...prev,
          endTime: currentAvailableEndTimes[0]
        }));
      }
    }
  }, [formData.startTime, currentAvailableEndTimes, formData.endTime, isValidTimeRange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.startTime || !formData.endTime) {
      setTimeError('Both start time and end time are required');
      return null;
    }

    if (!isValidTimeRange(formData.startTime, formData.endTime)) {
      setTimeError('End time must be after start time');
      return null;
    }

    if (!isTimeSlotAvailable(bookings, {
      ...formData,
      roomId: room?.id
    })) {
      setTimeError('This time slot is no longer available');
      return null;
    }

    try {
      const bookingId = await createBooking({
        ...formData,
        roomId: room?.id
      });

      if (bookingId) {
        // Return complete booking object with ID
        const completeBooking = {
          id: bookingId,
          ...formData,
          roomId: room?.id,
        };
        return completeBooking;
      }
      return null;
    } catch (err) {
      setTimeError(err.message || 'Failed to create booking');
      return null;
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!formData.startTime || !formData.endTime) {
      setTimeError('Both start time and end time are required');
      return null;
    }

    if (!isValidTimeRange(formData.startTime, formData.endTime)) {
      setTimeError('End time must be after start time');
      return null;
    }

    // Check if slot is available (excluding current booking)
    const otherBookings = bookings.filter(b => b.id !== editBooking.id);
    if (!isTimeSlotAvailable(otherBookings, {
      ...formData,
      roomId: room?.id
    })) {
      setTimeError('This time slot is no longer available');
      return null;
    }

    try {
      if (!editBooking?.onEdit) {
        throw new Error('Edit function not provided');
      }

      await editBooking.onEdit(editBooking.id, {
        ...formData,
        roomId: room?.id
      });

      return {
        id: editBooking.id,
        ...formData,
        roomId: room?.id,
      };
    } catch (err) {
      setTimeError(err.message || 'Failed to update booking');
      return null;
    }
  };

  return {
    getCurrentDate,
    getCurrentTimeSlot,
    generateTimeSlots,
    dateUtils,
    dateLimits,
    timeSlots,
    formData,
    setFormData,
    timeError,
    setTimeError,
    isSubmitting,
    submitError,
    availableStartTimes: currentAvailableStartTimes,
    availableEndTimes: currentAvailableEndTimes,
    handleSubmit,
    handleEdit
  };
};
