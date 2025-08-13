import express from "express";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getRecentLogs,
  getBlogsPerDay,
  getLoginsPerDay,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.use(protect, isSuperAdmin);
router.get("/stats", getDashboardStats);
router.get("/recent-logs", getRecentLogs);
router.get("/blogs-per-day", getBlogsPerDay);
router.get("/logins-per-day", getLoginsPerDay);

export default router;
