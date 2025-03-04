# HANGAR Meeting Room Booking System

A simple web application for booking meeting rooms at HANGAR. This application allows users to view and book two available meeting rooms: a small room on Level 1 and a large room on Level 2.

## Features

- View available meeting rooms and their details
- Book a meeting room for a specific date and time
- View existing bookings in a calendar view
- Filter bookings by date and room

## Available Rooms

- **Level 1 Meeting Room**: Small meeting room suitable for team discussions (capacity: 6 people)
- **Level 2 Meeting Room**: Large meeting room ideal for presentations and workshops (capacity: 12 people)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/hangar-booking.git
   cd hangar-booking
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To build the application for production, run:

```bash
npm run build
```

The build files will be located in the `dist` directory.

## Technologies Used

- React
- Vite
- CSS3

## Future Enhancements

- User authentication and role-based permissions
- Email notifications for booking confirmations
- Recurring meeting options
- Integration with calendar services (Google Calendar, Outlook)
- Mobile responsive design improvements
