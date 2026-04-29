import express from "express";
import { createService, getServices, getServiceBySlug, updateService, deleteService } from "../controllers/serviceController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createService);
router.get("/", authMiddleware, getServices);
router.get("/:slug", getServiceBySlug);
router.put("/:id", authMiddleware, updateService);
router.delete("/:id", authMiddleware, deleteService);

export default router;