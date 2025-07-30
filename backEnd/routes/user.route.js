import express from "express";
import {
  preRegister,
  verifyRegister,
  login,
  getAllUsers,
  updateUserPassword,
  logout,
  resendOTP,
  verifyOTP,
  resendTempOTP,
  checkDuplicate,
  refreshToken,
  getMe,
} from "../controllers/user.controller.js";
import {
  protect,
  isAdmin,
  isSelfOrAdmin,
  otpRateLimit,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/pre-register", preRegister);
router.post("/verify-register", verifyRegister);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/resend-otp", otpRateLimit, resendOTP);
router.post("/resend-temp-otp", resendTempOTP);
router.post("/verify-otp", verifyOTP);
router.post("/check-duplicate", checkDuplicate);

router.get("/me", protect, getMe);

//Admin or General User
router.put("/:id/password", protect, isSelfOrAdmin, updateUserPassword);

// Admin only
router.get("/users", protect, isAdmin, getAllUsers);

export default router;
