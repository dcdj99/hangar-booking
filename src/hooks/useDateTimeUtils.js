import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useBooking } from './useBooking';
import { isTimeSlotAvailable } from '../store/bookingsSlice';
import { useLocalStorage } from './useLocalStorage';

export const useDateTimeUtils = (room, initialDate, editBooking = null) => {
  // Fixed utility functions - move outside state dependencies
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

  // Combine static utility functions into a single object to avoid recomputation
  const utils = useMemo(() => ({
    generateTimeSlots: () => {
      const slots = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
        }
      }
      return slots;
    },
    
    generateEndTimeSlots: () => {
      const slots = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          if (hour === 0 && minute === 0) continue;
          slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
        }
      }
      slots.push('23:59');
      return slots;
    },
    
    dateUtils: {
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
        return !utils.dateUtils.isDateInPast(date) && !utils.dateUtils.isDateTooFarInFuture(date);
      },
      
      formatDateForBooking: (date) => {
        if (!date) return '';
        
        // Already formatted as YYYY-MM-DD
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return date;
        }
        
        // Convert Date object to YYYY-MM-DD
        try {
          const d = date instanceof Date ? date : new Date(date);
          if (isNaN(d.getTime())) throw new Error('Invalid date');
          
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch (err) {
          console.error('Date formatting error:', err, date);
          return '';
        }
      },
      
      parseDate: (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
      },
      
      isTimeInPast: (time, date, getCurrentDate, getCurrentTimeSlot) => {
        if (date !== getCurrentDate()) return false;
        const [hours, minutes] = time.split(':').map(Number);
        const [currentHours, currentMinutes] = getCurrentTimeSlot().split(':').map(Number);
        if (hours < currentHours) return true;
        if (hours === currentHours && minutes <= currentMinutes) return true;
        return false;
      }
    },
    
    dateLimits: {
      minDate: getCurrentDate(),
      maxDate: (() => {
        const today = new Date();
        today.setMonth(today.getMonth() + 1);
        return today.toISOString().split('T')[0];
      })()
    },
    
    isValidTimeRange: (startTime, endTime) => {
      // Special case: if end time is midnight (00:00), it's always valid
      if (endTime === '00:00') return true;
  
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      // Convert to minutes for easier comparison
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      return endMinutes > startMinutes;
    },
    
    getMaxEndTime: (time) => {
      if (!time) return null;
      const [hours, minutes] = time.split(':').map(Number);
      let newHours = hours + 4;
      return newHours >= 24 ? '23:59' : `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }), [getCurrentDate, getCurrentTimeSlot]);

  // Combine form-related state into a single object
  const [formState, setFormState] = useState({
    data: (() => {
      // Normalize the date format when initializing
      const normalizedDate = initialDate 
        ? utils.dateUtils.formatDateForBooking(initialDate) 
        : getCurrentDate();
        
      console.log('Initializing form with date:', {
        initialDate,
        normalized: normalizedDate
      });
      
      if (editBooking) {
        return {
          date: editBooking.date,
          startTime: editBooking.startTime,
          endTime: editBooking.endTime,
          name: editBooking.name || '',
          company: editBooking.company || ''
        };
      }
      return {
        date: normalizedDate,
        startTime: '',
        endTime: '',
        name: '',
        company: ''
      };
    })(),
    timeError: ''
  });
  
  // Use local storage for user details
  const [userName, setUserName] = useLocalStorage('hangar-booking-name', '');
  const [userCompany, setUserCompany] = useLocalStorage('hangar-booking-company', '');
  
  // Apply stored values if not editing
  useEffect(() => {
    if (!editBooking) {
      setFormState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          name: userName || prev.data.name,
          company: userCompany || prev.data.company
        }
      }));
    }
  }, [userName, userCompany, editBooking]);

  // Special effect to handle initialDate changes after component mount
  useEffect(() => {
    if (initialDate) {
      const formattedDate = utils.dateUtils.formatDateForBooking(initialDate);
      
      if (formattedDate !== formState.data.date) {
        console.log('Updating form date to match initialDate:', {
          initialDate,
          formattedDate,
          currentFormDate: formState.data.date
        });
        
        setFormState(prev => ({
          ...prev,
          data: {
            ...prev.data,
            date: formattedDate
          }
        }));
      }
    }
  }, [initialDate, utils.dateUtils, formState.data.date]);

  const bookings = useSelector(state => state.bookings.items);
  const { createBooking, isSubmitting, error: submitError } = useBooking();
  
  // Calculate available times based on current bookings and form state
  const availableTimes = useMemo(() => {
    const relevantBookings = bookings.filter(b => 
      b.date === formState.data.date && 
      b.roomId === room?.id && 
      (!editBooking?.id || b.id !== editBooking.id)
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));

    const isToday = formState.data.date === getCurrentDate();
    const currentTimeSlot = isToday ? getCurrentTimeSlot() : '00:00';

    // Find next available booking after the given time
    const getNextBookingStart = (afterTime) => {
      const nextBooking = relevantBookings.find(b => b.startTime > afterTime);
      return nextBooking ? nextBooking.startTime : '23:59';
    };

    // Generate available start times
    const availableStartTimes = utils.generateTimeSlots().filter(time => {
      if (isToday && time < currentTimeSlot) return false;
      
      // When editing, always allow the original start time
      if (editBooking && time === editBooking.startTime) return true;
      
      // Can't start during another booking
      return !relevantBookings.some(b => time >= b.startTime && time < b.endTime);
    });

    // Generate available end times if a start time is selected
    const availableEndTimes = formState.data.startTime ? utils.generateEndTimeSlots().filter(time => {
      if (time <= formState.data.startTime) return false;
      
      // Check 4-hour limit
      const maxEndTime = utils.getMaxEndTime(formState.data.startTime);
      if (time > maxEndTime) return false;
      
      // When editing, allow the original end time
      if (editBooking && time === editBooking.endTime && formState.data.startTime === editBooking.startTime) {
        return true;
      }
      
      // Find next booking's start time
      const nextBookingStart = getNextBookingStart(formState.data.startTime);
      
      // Can't end after the next booking starts
      if (time > nextBookingStart) return false;
      
      // Check for overlaps with existing bookings
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
    }) : [];

    return { availableStartTimes, availableEndTimes };
  }, [bookings, formState.data.date, formState.data.startTime, getCurrentDate, getCurrentTimeSlot, room, editBooking, utils]);

  // Update end time when start time changes
  useEffect(() => {
    if (formState.data.startTime && availableTimes.availableEndTimes.length > 0) {
      const currentEndTime = formState.data.endTime;
      
      // Check if the current end time is still valid
      const isCurrentEndTimeValid = currentEndTime && 
        availableTimes.availableEndTimes.includes(currentEndTime) && 
        utils.isValidTimeRange(formState.data.startTime, currentEndTime);
      
      if (!isCurrentEndTimeValid) {
        // Set to first available end time if current one is invalid
        setFormState(prev => ({
          ...prev,
          data: {
            ...prev.data,
            endTime: availableTimes.availableEndTimes[0] || ''
          }
        }));
      }
    }
  }, [formState.data.startTime, availableTimes.availableEndTimes, formState.data.endTime, utils]);

  // Simplified form change handler
  const setFormData = useCallback((newData) => {
    if (typeof newData === 'function') {
      setFormState(prev => ({
        ...prev,
        data: typeof newData === 'function' ? newData(prev.data) : { ...prev.data, ...newData }
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        data: { ...prev.data, ...newData }
      }));
    }
  }, []);

  // Simplified error handling
  const setTimeError = useCallback((error) => {
    setFormState(prev => ({ ...prev, timeError: error }));
  }, []);

  // Form submission handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formState.data.startTime) {
      setTimeError('Please select a start time');
      return null;
    }

    if (!formState.data.endTime) {
      if (availableTimes.availableEndTimes.length > 0) {
        setTimeError('Please select an end time');
      } else {
        setTimeError('No available end times for this start time');
      }
      return null;
    }

    setTimeError('');

    if (!utils.isValidTimeRange(formState.data.startTime, formState.data.endTime)) {
      setTimeError('End time must be after start time');
      return null;
    }

    if (!isTimeSlotAvailable(bookings, {
      ...formState.data,
      roomId: room?.id
    })) {
      setTimeError('This time slot is no longer available');
      return null;
    }

    try {
      // Store user details
      setUserName(formState.data.name);
      setUserCompany(formState.data.company);

      const bookingId = await createBooking({
        ...formState.data,
        roomId: room?.id
      });

      if (bookingId) {
        return {
          id: bookingId,
          ...formState.data,
          roomId: room?.id,
        };
      }
      return null;
    } catch (err) {
      setTimeError(err.message || 'Failed to create booking');
      return null;
    }
  };

  // Handle booking edits
  const handleEdit = async (e) => {
    e.preventDefault();
    
    // Similar validation as for creating
    if (!formState.data.startTime) {
      setTimeError('Please select a start time');
      return null;
    }

    if (!formState.data.endTime) {
      if (availableTimes.availableEndTimes.length > 0) {
        setTimeError('Please select an end time');
      } else {
        setTimeError('No available end times for this start time');
      }
      return null;
    }
    
    setTimeError('');

    if (!utils.isValidTimeRange(formState.data.startTime, formState.data.endTime)) {
      setTimeError('End time must be after start time');
      return null;
    }

    // Check availability excluding current booking
    const otherBookings = bookings.filter(b => b.id !== editBooking.id);
    if (!isTimeSlotAvailable(otherBookings, {
      ...formState.data,
      roomId: room?.id
    })) {
      setTimeError('This time slot is no longer available');
      return null;
    }

    try {
      if (!editBooking?.onEdit) {
        throw new Error('Edit function not provided');
      }

      // Store user details
      setUserName(formState.data.name);
      setUserCompany(formState.data.company);

      await editBooking.onEdit(editBooking.id, {
        ...formState.data,
        roomId: room?.id
      });

      return {
        id: editBooking.id,
        ...formState.data,
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
    dateUtils: utils.dateUtils,
    dateLimits: utils.dateLimits,
    timeSlots: utils.generateTimeSlots(),
    formData: formState.data,
    setFormData,
    timeError: formState.timeError,
    setTimeError,
    isSubmitting,
    submitError,
    availableStartTimes: availableTimes.availableStartTimes,
    availableEndTimes: availableTimes.availableEndTimes,
    handleSubmit,
    handleEdit
  };
};
