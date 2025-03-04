# HANGAR Meeting Room Booking System

A comprehensive web application for booking and managing meeting rooms at HANGAR. This React-based system allows users to view room availability in real-time, make bookings, and manage their scheduled meetings.

**[View the live application →](https://b71-hangar.web.app)**

## Features

- **Real-time Availability**: See which rooms are currently available or occupied
- **Visual Calendar Interface**: View bookings on a daily, weekly, or monthly basis
- **Quick Booking**: Reserve rooms directly from the homepage
- **Booking Management**: View, modify, or cancel your existing bookings
- **User-friendly Interface**: Intuitive design with responsive layout
- **Anonymous Authentication**: No login required to make bookings

## Available Rooms

| Room | Location | Capacity | Best For |
|------|----------|----------|----------|
| **Level 1 Meeting Room** | First Floor | 5 people | Small team discussions, 1:1 meetings |
| **Level 2 Meeting Room** | Second Floor | 8 people | Team meetings, presentations, workshops |

## Technical Architecture

This application is built with:

- **React** - Frontend UI library
- **Redux** - State management
- **Firebase** - Backend services (Firestore for data, Authentication)
- **React Router** - Navigation management
- **Tailwind CSS** - Styling and responsive design

## Setup & Installation

### Prerequisites

- Node.js (v14.0 or newer)
- npm (v6.0 or newer) or yarn
- A Firebase account for deploying your own instance

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hangar-booking.git
   cd hangar-booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Configure Firebase**
   - Create a `.env` file in the root directory
   - Add your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`

### Firebase Setup

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication and set up Anonymous authentication
4. Create the following Firestore collections:
   - `bookings` - with fields: roomId, date, startTime, endTime, title, description, userId, userName, createdAt

## Building for Production

To create an optimized production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory, ready for deployment.

## Deployment

### Firebase Hosting (Recommended)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in the project:
   ```bash
   firebase init
   ```
   - Select Hosting
   - Select your Firebase project
   - Set "dist" as the public directory
   - Configure as a single-page application

4. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

### Other Hosting Options

The application can be deployed to any static site hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

## Usage Guide

### Making a Booking

1. Navigate to the homepage to see all available rooms
2. Click on a room card to view its calendar
3. Select a date and time on the calendar
4. Fill out the booking form with your details
5. Submit the form to create your booking

### Managing Bookings

1. View all bookings on the room calendar page
2. Click on a booking to view its details
3. Use the edit or delete options if needed

## Troubleshooting

**Issue**: Application fails to load
- Check your internet connection
- Verify Firebase credentials in the .env file
- Ensure Firebase services (Authentication, Firestore) are enabled

**Issue**: Cannot create or view bookings
- Check Firebase rules to ensure read/write permissions
- Verify anonymous authentication is properly configured

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by [Heroicons](https://heroicons.com/)
- UI components inspired by [Tailwind UI](https://tailwindui.com/)
