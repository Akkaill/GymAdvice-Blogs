import express from "express";
import {
  updateUserRole,
  deleteUser,
  createAdmin,
  revoke,
} from "../controllers/superadmin.controller.js";
import { isSuperAdmin, protect } from "../middleware/authMiddleware.js";
import { someAdminController } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, isSuperAdmin);

router.get("/superadmin-only", protect, someAdminController);
router.put("/update-role/:userId", updateUserRole);
router.delete("/delete-user/:userId", deleteUser);
router.post("/create-admin", createAdmin);
router.post("/revoke/:userId", revoke);

export default router;
