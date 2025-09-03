import mongoose from "mongoose";
import Event from "../models/Event.js";
import QRCode from "qrcode";

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create event
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate QR code for a ticket
export const generateQRCode = async (req, res) => {
  try {
    const { ticketInfo } = req.body; // e.g., {userId, eventId, seatNumber}
    const qr = await QRCode.toDataURL(JSON.stringify(ticketInfo));
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Allocate seat and generate ticket QR code
export const allocateSeat = async (req, res) => {
  try {
    const { eventId, userId: bodyUserId } = req.body;
    const userId = bodyUserId || req.user._id; // admin can pass userId, users use token

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get already booked seats
    const bookedSeatNumbers = event.tickets.map(t => t.seatNumber);

    // Find first available seat
    let availableSeat = null;
    for (let i = 1; i <= event.seats; i++) {
      if (!bookedSeatNumbers.includes(i)) {
        availableSeat = i;
        break;
      }
    }

    if (!availableSeat) {
        console.log("req.user:", req.user);
console.log("body.userId:", bodyUserId);
      return res.status(400).json({ message: "No seats available" });
    }

    // Generate QR Code
    const qrCode = await QRCode.toDataURL(
      JSON.stringify({ eventId: event._id, userId, seatNumber: availableSeat })
    );

    // Add ticket
    event.tickets.push({ seatNumber: availableSeat, userId, qrCode });
    event.bookedSeats += 1;
    await event.save();

    res.status(201).json({ seatNumber: availableSeat, userId, qrCode });
  } catch (err) {
    console.error("Error allocating seat:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// Get all upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const bookTicket = async (req, res) => {
  const { eventId, seatNumber } = req.body;
  const userId = req.user?._id;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.tickets.some(t => t.seatNumber === seatNumber)) {
      return res.status(400).json({ message: "Seat already booked" });
    }

    // Dummy payment simulation
    const paymentSuccess = true; // replace with real payment gateway later
    if (!paymentSuccess) return res.status(400).json({ message: "Payment failed" });

    const ticketInfo = { eventId, userId, seatNumber };
    const qrCode = await QRCode.toDataURL(JSON.stringify(ticketInfo));

    event.tickets.push({ seatNumber, userId, qrCode });
    event.bookedSeats += 1;
    await event.save();

    res.json({
  ticketId: event.tickets[event.tickets.length - 1]._id, // the last pushed ticket
  seatNumber,
  qrCodeData: qrCode,
});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - user not found" });
    }

    const userId = req.user?._id || req.user?._id?.toString();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID in token" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const events = await Event.find({ "tickets.userId": userObjectId });

    const tickets = [];

    events.forEach(event => {
      event.tickets.forEach(t => {
        if (t.userId.toString() === userId) {
          tickets.push({
            _id: t._id,
            event: {
              title: event.title,
              date: event.date,
              venue: event.venue,
            },
            seat: t.seatNumber,
            qrCodeData: t.qrCode,
          });
        }
      });
    });

    res.json(tickets);
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ message: "Server error fetching tickets" });
  }
};
