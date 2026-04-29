import express from "express";
import {
  createBooking,
  createPublicBooking,
  getBookingsByDay,
  getAvailability,
  getPublicAvailability,
  getMyBookings,
  getStats,
  cancelBooking,
  rescheduleBooking,
} from "../controllers/bookingController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createBooking);
router.post("/public", createPublicBooking);
router.get("/day", authMiddleware, getBookingsByDay);
router.get("/availability", authMiddleware, getAvailability);
router.get("/public/availability", getPublicAvailability);
router.get("/my", authMiddleware, getMyBookings);
router.get("/stats", authMiddleware, getStats);
router.put("/:id/cancel", authMiddleware, cancelBooking);
router.put("/:id/reschedule", authMiddleware, rescheduleBooking);

export default router;