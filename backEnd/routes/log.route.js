import express from "express";
import {
  getLogs,
  deleteAllLogs,
  deleteLogById,
} from "../controllers/log.controller.js";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", protect, isSuperAdmin, getLogs);

router.delete("/", protect, isSuperAdmin, deleteAllLogs);

router.delete("/:logId", protect, isSuperAdmin, deleteLogById);

export default router;
