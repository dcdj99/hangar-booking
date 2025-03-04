import React from 'react';
import Layout from '../components/Layout';

const AboutPage = () => {
  return (
    <Layout title="About HANGAR Booking System">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8 mb-10">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">About the Application</h2>
        
        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-blue-700 mb-3">Overview</h3>
          <p className="text-gray-700 mb-4">
            The HANGAR Meeting Room Booking System is a user-friendly web application designed to help HANGAR members
            efficiently book and manage meeting spaces. The system provides real-time visibility of room availability,
            a simple booking process, and easy management of existing reservations.
          </p>
          <p className="text-gray-700 mb-4">
            Built with modern web technologies including React, Redux, and Firebase, the application
            offers a responsive experience across desktop and mobile devices.
          </p>
        </section>
        
        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-blue-700 mb-3">How to Use</h3>
          
          <div className="mb-6">
            <h4 className="text-xl font-medium text-blue-600 mb-2">Finding Available Rooms</h4>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
              <li>Visit the <span className="font-semibold">Home page</span> to see all available rooms.</li>
              <li>Each room card shows current availability status and upcoming bookings.</li>
              <li>Green status indicators show available rooms, amber indicates rooms currently in use.</li>
            </ol>
          </div>
          
          <div className="mb-6">
            <h4 className="text-xl font-medium text-blue-600 mb-2">Making a Booking</h4>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
              <li>Click on a room card to view its detailed calendar.</li>
              <li>Select a date from the calendar view.</li>
              <li>Click the "Book This Room" button to open the booking form.</li>
              <li>Select your desired time slot, enter your name and company.</li>
              <li>Click "Book Room" to confirm your reservation.</li>
            </ol>
          </div>
          
          <div className="mb-6">
            <h4 className="text-xl font-medium text-blue-600 mb-2">Managing Your Bookings</h4>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 pl-4">
              <li>Visit the calendar view for any room.</li>
              <li>Your bookings will be displayed with edit and delete options.</li>
              <li>Click "Edit" to modify your booking details.</li>
              <li>Click "Delete" to cancel your reservation.</li>
            </ol>
            <p className="text-amber-600 mt-2 italic">
              Note: You can only modify or delete bookings that you created on your current device.
            </p>
          </div>
        </section>
        
        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-blue-700 mb-3">Available Meeting Rooms</h3>
          
          <div className="space-y-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="text-xl font-medium text-blue-600 mb-2">Level 1 Meeting Room</h4>
              <p className="text-gray-700 mb-2"><span className="font-semibold">Location:</span> First Floor</p>
              <p className="text-gray-700 mb-2"><span className="font-semibold">Capacity:</span> 5 people</p>
              <p className="text-gray-700 mb-2"><span className="font-semibold">Amenities:</span> Whiteboard, TV display, Video conferencing equipment</p>
              <p className="text-gray-700"><span className="font-semibold">Best For:</span> Small team discussions, 1:1 meetings, video calls</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="text-xl font-medium text-blue-600 mb-2">Level 2 Meeting Room</h4>
              <p className="text-gray-700 mb-2"><span className="font-semibold">Location:</span> Second Floor</p>
              <p className="text-gray-700 mb-2"><span className="font-semibold">Capacity:</span> 8 people</p>
              <p className="text-gray-700 mb-2"><span className="font-semibold">Amenities:</span> Projector, Large whiteboard, Conference call system</p>
              <p className="text-gray-700"><span className="font-semibold">Best For:</span> Team meetings, presentations, workshops, training sessions</p>
            </div>
          </div>
        </section>
        
        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-blue-700 mb-3">Booking Guidelines</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
            <li>Bookings can be made up to 30 days in advance.</li>
            <li>Meeting room slots are available in 30-minute increments.</li>
            <li>Please cancel your booking if you no longer need the room.</li>
            <li>If you're more than 15 minutes late, your booking may be canceled.</li>
            <li>Please leave the room clean and tidy for the next user.</li>
            <li>Report any issues with the room to HANGAR staff.</li>
          </ul>
        </section>
        
        <section>
          <h3 className="text-2xl font-semibold text-blue-700 mb-3">Development Information</h3>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="text-xl font-medium text-blue-600 mb-3">About the Developer</h4>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Developer:</span> Darren Chow
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Version:</span> 1.0.0
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Released:</span> March 2025
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Support Contact:</span> <a href="mailto:dcdj99@gmail.com" className="text-blue-600 hover:underline">dcdj99@gmail.com</a>
            </p>
            <p className="text-gray-700 mt-4">
              This application was developed to simplify the meeting room booking process at HANGAR.
              For any issues or suggestions, please contact the developer directly.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;
