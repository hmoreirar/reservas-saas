import express from "express";
import { getStaff, addStaff, updateStaff, deleteStaff, assignBookingToStaff } from "../controllers/staffController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getStaff);
router.post("/", authMiddleware, addStaff);
router.put("/:id", authMiddleware, updateStaff);
router.delete("/:id", authMiddleware, deleteStaff);
router.put("/assign/:bookingId", authMiddleware, assignBookingToStaff);

export default router;