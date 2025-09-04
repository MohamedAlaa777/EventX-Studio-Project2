import express from "express";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  generateQRCode,
  allocateSeat,
  getUpcomingEvents,
  getEventById,
  bookTicket,
  getMyTickets
} from "../controllers/eventController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ----- Public/User routes -----
router.get("/upcoming", protect, getUpcomingEvents);   // static route
router.get("/my-tickets", protect, getMyTickets);      // static route
router.post("/book", protect, bookTicket);             // static route

// ----- Admin routes -----
router.get("/", protect, getEvents);
router.post("/", protect, isAdmin, createEvent);
router.put("/:id", protect, isAdmin, updateEvent);
router.delete("/:id", protect, isAdmin, deleteEvent);

router.post("/qrcode", protect, isAdmin, generateQRCode);
router.post("/allocate-seat", protect, isAdmin, allocateSeat);

router.get("/analytics/charts", protect, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user");

    const ageGroups = { "18-25": 0, "26-35": 0, "36-45": 0, "46+": 0 };
    const genderCounts = { male: 0, female: 0, other: 0 };
    const interestsCounts = {};
    const locationsCounts = {};

    bookings.forEach(b => {
      const age = b.user.age;
      if (age >= 18 && age <= 25) ageGroups["18-25"]++;
      else if (age <= 35) ageGroups["26-35"]++;
      else if (age <= 45) ageGroups["36-45"]++;
      else ageGroups["46+"]++;

      genderCounts[b.user.gender] = (genderCounts[b.user.gender] || 0) + 1;
      b.user.interests?.forEach(i => interestsCounts[i] = (interestsCounts[i] || 0) + 1);
      locationsCounts[b.user.location] = (locationsCounts[b.user.location] || 0) + 1;
    });

    res.json({ ageGroups, genderCounts, interestsCounts, locationsCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----- Dynamic route (ALWAYS LAST) -----
router.get("/:id", protect, getEventById);

export default router;
