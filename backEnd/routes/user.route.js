import express from "express";
import {
  register,
  login,
  getAllUsers,
  updateUserPassword,
  logout,
} from "../controllers/user.controller.js";
import {
  protect,
  isAdmin,
  isSelfOrAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);

//Admin or General User
router.put("/:id/password", protect, isSelfOrAdmin, updateUserPassword);

// Admin only
router.get("/users", protect, isAdmin, getAllUsers);

export default router;
