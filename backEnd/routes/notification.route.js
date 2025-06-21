import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getNotifications, markAsRead } from "../controllers/notification.controller.js";

const router = express.Router();
router.use(protect);
router.get("/", getNotifications);
router.post("/:id/read", markAsRead);

export default router;
