import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { someAdminController } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/admin-only", protect, isAdmin, someAdminController);

export default router;
