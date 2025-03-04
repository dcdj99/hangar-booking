import React from 'react';

const Layout = ({ children, title }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center">
           HANGAR Meeting Room Booking
          </h1>
          {title && <h2 className="text-xl text-center mt-3 font-light">{title}</h2>}
        </div>
      </header>
      
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
      
      <footer className="bg-gray-100 text-gray-600 text-center p-4 border-t border-gray-200">
        <p className="text-sm">&copy; {new Date().getFullYear()} HANGAR Booking System</p>
      </footer>
    </div>
  );
};

export default Layout;
