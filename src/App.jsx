import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from './contexts/AuthContext';
import { useBookingsSync } from './hooks/useBookingsSync';
import { fetchBookings } from './store/bookingsSlice';

import HomePage from './pages/HomePage';
import RoomCalendarPage from './pages/RoomCalendarPage';
import AboutPage from './pages/AboutPage'; // Import the About page

import LoadingScreen from './components/LoadingScreen';

function App() {
  const { isLoading, error, user } = useAuth();
  const dispatch = useDispatch();

  // Set up real-time sync
  useBookingsSync();

  // Initial data fetch
  useEffect(() => {
    if (user) {
      dispatch(fetchBookings({}));
    }
  }, [dispatch, user]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen message="Initializing application..." />;
  }

  // Show error if authentication failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route path="/room/:roomId/calendar" element={<RoomCalendarPage />} />
          <Route path="/about" element={<AboutPage />} /> {/* Add the About page route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
