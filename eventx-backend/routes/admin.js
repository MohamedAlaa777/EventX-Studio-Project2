// routes/admin.js
import express from "express";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Dashboard metrics
router.get("/analytics/summary", protect, isAdmin, async (req, res) => {
  try {
    const events = await Event.find();
    const bookings = await Booking.find();

    const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);
    const ticketsSold = bookings.length;
    const totalAttendees = new Set(bookings.map(b => b.user.toString())).size;

    res.json({ totalRevenue, ticketsSold, totalAttendees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
