import express from "express";
import {
  getSecuritySettings,
  updateSecuritySettings,
} from "../controllers/security.controller.js";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, isSuperAdmin, getSecuritySettings);
router.put("/", protect, isSuperAdmin, updateSecuritySettings);

export default router;
