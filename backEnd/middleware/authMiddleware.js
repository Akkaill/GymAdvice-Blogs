import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import rateLimit from "express-rate-limit";
import Comment from "../models/comment.model.js";


export const isCommentOwner = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).lean();
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    
    if (
      typeof decoded.tokenVersion === "number" &&
      decoded.tokenVersion !== user.tokenVersion
    ) {
      return res.status(401).json({ success: false, message: "Token revoked" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

// ------------------------------------------
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ success: false, message: "Admin only" });
  }
  next();
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ success: false, message: "SuperAdmin only" });
  }
  next();
};

export const isSelfOrAdmin = (req, res, next) => {
  if (
    req.user.role === "admin" ||
    req.user._id.toString() === req.params.userId
  ) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Not authorized" });
};

// (คงไว้ถ้าต้องใช้สำหรับ blog owner)
export const isBlogOwner = async (req, res, next) => {
  // ... (เหมือนเดิม; omitted ที่นี่เพื่อย่อ) ...
  next();
};

// Rate limit OTP
export const otpRateLimit = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 3,
  message: "Too many OTP requests, please try again later.",
});

