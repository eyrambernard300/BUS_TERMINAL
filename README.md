# Campus Bus Booking (React + Node Server)

A bus booking site for university students to book buses from campus to their hometowns.

## What was added
- React-based frontend UI for booking and listing trips.
- Node/Express API server so bookings can be viewed online (not only in localStorage).
- Seat number support during booking.
- Seat conflict validation (same trip/date/time cannot reuse the same seat).
- Responsive design for mobile, tablet, and desktop.

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start server:
   ```bash
   npm start
   ```
3. Open:
   `http://localhost:4173`

## API endpoints
- `GET /api/bookings` - list all bookings
- `POST /api/bookings` - create booking
- `DELETE /api/bookings` - clear all bookings

## Deploy online
Deploy this Node app to platforms like Render, Railway, Fly.io, or any VPS.
Set `PORT` as provided by the platform; the server already uses `process.env.PORT`.
