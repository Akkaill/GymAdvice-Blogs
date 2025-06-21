import express from "express";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";
import { getDashboardStats, getRecentLogs } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.use(protect, isSuperAdmin); 
router.get("/stats", getDashboardStats);
router.get("/recent-logs", getRecentLogs);

export default router;
