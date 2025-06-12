import express from "express";
import {
  updateUserRole,
  deleteUser,
  createAdmin,
} from "../controllers/superadmin.controller.js";
import { isSuperAdmin, protect } from "../middleware/authMiddleware.js";
import { someAdminController } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, isSuperAdmin);

router.get("/superadmin-only", protect, isSuperAdmin, someAdminController);
router.put("/update-role/:userId", updateUserRole);
router.delete("/delete-user/:userId", deleteUser);
router.post("/create-admin", createAdmin);

export default router;
