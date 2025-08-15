import express from "express";
import rateLimit from "express-rate-limit";
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
  isSuperAdmin,
  isSelfOrAdmin,
  otpRateLimit,
} from "../middleware/authMiddleware.js";

const router = express.Router();
const isProd = process.env.NODE_ENV === "production";

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: isProd ? 60 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
});

export const strictLoginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: isProd ? 10 : 1000, // login เอาเข้มหน่อย
  standardHeaders: true,
  legacyHeaders: false,
});
// Public
router.post("/pre-register", preRegister);
router.post("/verify-register", verifyRegister);
router.post("/login", strictLoginLimiter, login);
router.post("/logout", logout);
router.post("/refresh-token", authLimiter, refreshToken);
router.post("/resend-otp", otpRateLimit, resendOTP);
router.post("/resend-temp-otp", resendTempOTP);
router.post("/verify-otp", verifyOTP);
router.post("/check-duplicate", checkDuplicate);

router.get("/me", protect, authLimiter, getMe);

//Admin or General User
router.put("/:id/password", protect, isSelfOrAdmin, updateUserPassword);

// Superadmin only
router.get("/all", protect, isSuperAdmin, getAllUsers);

export default router;
