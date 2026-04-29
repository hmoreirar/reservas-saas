import express from "express";
import { register, login, me } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔐 Auth
router.post("/register", register);
router.post("/login", login);


// 🔒 protegida
router.get("/me", authMiddleware, me);

export default router;