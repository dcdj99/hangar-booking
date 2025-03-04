import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children, title }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <Link to="/" className="text-2xl font-bold hover:text-white/90 text-center">
              HANGAR Meeting Room Booking
            </Link>
            
            {title && <h2 className="text-xl font-light text-center">{title}</h2>}
            
            <nav className="w-full">
              <div className="flex items-center justify-center space-x-6">
                <Link to="/" className="text-white hover:text-white/90 font-medium">Home</Link>
                <Link to="/about" className="text-white hover:text-white/90 font-medium">About</Link>
              </div>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
      
      <footer className="bg-gray-100 text-gray-600 p-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} HANGAR Booking System</p>
          <div className="flex items-center space-x-6 mt-2 md:mt-0">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium text-sm hover:underline">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium text-sm hover:underline">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
