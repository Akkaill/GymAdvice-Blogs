import express from "express";
import {
  getLogs,
  deleteAllLogs,
  deleteLogById,
} from "../controllers/log.controller.js";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET: ดู log ทั้งหมด + filter
router.get("/", protect, isSuperAdmin, getLogs);

// DELETE: ลบทั้งหมด
router.delete("/", protect, isSuperAdmin, deleteAllLogs);

// DELETE: ลบ log รายตัว
router.delete("/:logId", protect, isSuperAdmin, deleteLogById);

export default router;
