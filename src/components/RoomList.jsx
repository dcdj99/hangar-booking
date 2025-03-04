import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoomList = ({ rooms, onRoomSelect }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {rooms.map((room) => (
        <div key={room.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg">
          {room.image && (
            <div className="h-56 overflow-hidden">
              <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
            </div>
          )}
          <div className="p-6">
            <h3 className="text-xl font-bold text-blue-800 mb-2">{room.name}</h3>
            <div className="flex items-center mb-3 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{room.capacity} people</span>
            </div>
            <p className="text-gray-700 mb-4">{room.description}</p>
            <div className="mt-4 flex justify-between">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-300 flex items-center"
                onClick={() => navigate(`/room/${room.id}/calendar`)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Calendar
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors duration-300 flex items-center"
                onClick={() => onRoomSelect(room)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
