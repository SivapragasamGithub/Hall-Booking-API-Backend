const express = require("express");
const app = express();

app.use(express.json()); // Middleware to parse JSON data

// In-memory data storage
const rooms = [];
const bookings = [];

// 1. Create a Room
app.post("/rooms", (req, res) => {
  const { roomName, seats, amenities, pricePerHour } = req.body;

  if (rooms.find((room) => room.roomName === roomName)) {
    return res.status(400).json({ message: "Room already exists!" });
  }

  const newRoom = { roomName, seats, amenities, pricePerHour, bookings: [] };
  rooms.push(newRoom);
  res.status(201).json({ message: "Room created successfully", room: newRoom });
});

// 2. Book a Room
app.post("/bookings", (req, res) => {
  const { customerName, roomName, date, startTime, endTime } = req.body;

  const room = rooms.find((r) => r.roomName === roomName);
  if (!room) {
    return res.status(404).json({ message: "Room not found!" });
  }

  // Check for time conflict
  const conflict = room.bookings.some(
    (booking) =>
      booking.date === date &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime))
  );

  if (conflict) {
    return res
      .status(400)
      .json({
        message: "Time conflict: Room already booked for the selected time.",
      });
  }

  const newBooking = { customerName, roomName, date, startTime, endTime };
  room.bookings.push(newBooking);
  bookings.push(newBooking);
  res
    .status(201)
    .json({ message: "Room booked successfully", booking: newBooking });
});

// 3. List all Rooms with Booked Data
app.get("/rooms", (req, res) => {
  const roomData = rooms.map((room) => ({
    roomName: room.roomName,
    bookedStatus: room.bookings.length > 0,
    bookings: room.bookings,
  }));
  res.json(roomData);
});

// 4. List all Customers with Booked Data
app.get("/customers", (req, res) => {
  const customerData = bookings.map((booking) => ({
    customerName: booking.customerName,
    roomName: booking.roomName,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
  }));
  res.json(customerData);
});

// 5. Customer Booking History
app.get("/customers/:name/bookings", (req, res) => {
  const customerName = req.params.name;
  const customerBookings = bookings.filter(
    (booking) => booking.customerName === customerName
  );

  if (customerBookings.length === 0) {
    return res
      .status(404)
      .json({ message: "No bookings found for the customer." });
  }

  res.json({
    customerName,
    bookingCount: customerBookings.length,
    bookings: customerBookings,
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
