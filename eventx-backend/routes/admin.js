import express from "express";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Dashboard metrics
router.get("/analytics/summary", protect, isAdmin, async (req, res) => {
  try {
    const events = await Event.find().populate("tickets.userId", "age gender");
    const tickets = events.flatMap((e) => e.tickets);

    // Total Revenue (price * tickets sold per event)
    const totalRevenue = events.reduce(
      (sum, ev) => sum + ev.price * ev.tickets.length,
      0
    );

    // Tickets Sold
    const ticketsSold = tickets.length;

    // Unique Attendees
    const uniqueUsers = new Set(
      tickets.map((t) => t.userId?._id?.toString())
    );
    const totalAttendees = uniqueUsers.size;

    // Age Groups
    const ageGroups = {
      "Under 18": 0,
      "18-25": 0,
      "26-35": 0,
      "36-50": 0,
      "51+": 0,
    };

    tickets.forEach((t) => {
      const age = t.userId?.age;
      if (age !== undefined && age !== null) {
        if (age < 18) ageGroups["Under 18"]++;
        else if (age <= 25) ageGroups["18-25"]++;
        else if (age <= 35) ageGroups["26-35"]++;
        else if (age <= 50) ageGroups["36-50"]++;
        else ageGroups["51+"]++;
      }
    });

    // Gender distribution
    const gender = { male: 0, female: 0, other: 0 };
    tickets.forEach((t) => {
      const g = t.userId?.gender;
      if (g) gender[g] = (gender[g] || 0) + 1;
    });

    res.json({
      revenue: totalRevenue,
      ticketsSold,
      totalAttendees,
      ageGroups,
      gender,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
