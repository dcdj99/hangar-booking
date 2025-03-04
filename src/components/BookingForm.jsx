import React from 'react';
import { useDateTimeUtils } from '../hooks/useDateTimeUtils';

const BookingForm = ({ room, initialDate, onSubmit, onCancel, editBooking }) => {
  const {
    formData,
    setFormData,
    timeError,
    availableStartTimes,
    availableEndTimes,
    timeSlots,
    handleSubmit: handleSubmitBooking,
    handleEdit: handleEditBooking,
    dateLimits,
    isSubmitting
  } = useDateTimeUtils(room, initialDate, editBooking);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // First validate that start time is before end time
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (endMinutes <= startMinutes) {
      alert('End time must be after start time');
      return;
    }
    
    // Use the appropriate handler based on whether we're editing or creating
    const result = await (editBooking 
      ? handleEditBooking(e) 
      : handleSubmitBooking(e));
    
    if (result) {
      onSubmit(result); // Pass the result, not formData
    }
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({ ...prev, date: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-2">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={handleDateChange}
          min={dateLimits.minDate}
          max={dateLimits.maxDate}
          disabled={!!initialDate} // Only disable if initialDate is provided
          className={`w-full p-2 border rounded ${initialDate ? 'bg-gray-50' : 'bg-white'}`}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">Start Time</label>
          <select
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            className="w-full p-2 border rounded"
          >
            {timeSlots
              .filter(time => {
                // Show only available times and the current time when editing
                const isCurrentEditingTime = editBooking && time === editBooking.startTime;
                return availableStartTimes.includes(time) || isCurrentEditingTime;
              })
              .map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))
            }
          </select>
          {availableStartTimes.length === 0 && !editBooking && (
            <p className="text-red-500 text-sm mt-1">No available start times for today.</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">End Time</label>
          <select
            value={formData.endTime}
            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            className="w-full p-2 border rounded"
            disabled={availableEndTimes.length === 0}
          >
            {availableEndTimes.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      {availableEndTimes.length === 0 && formData.startTime && (
        <div className="text-amber-500 text-sm">
          No available end times for this start time due to existing bookings.
        </div>
      )}

      {timeError && (
        <div className="text-red-500 text-sm">{timeError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-gray-700 font-medium">Your Name:</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          />
        </div>
        
        <div className="space-y-1">
          <label htmlFor="company" className="block text-gray-700 font-medium">Company:</label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            required
            placeholder="Enter your company name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={availableEndTimes.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Processing...' : (editBooking ? 'Update Booking' : 'Book Room')}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
