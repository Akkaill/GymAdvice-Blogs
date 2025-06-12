import jwt from "jsonwebtoken";
import Blog from "../models/blogs.model.js";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    req.user = user; // แนบ user ทั้งคน ไม่ใช่แค่ id
    next();
  } catch (error) {
    console.log("JWT ERROR", error.message);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const isBlogOwner = async (req, res, next) => {
  const blogId = req.params.blogId;
  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    //เจ้าของ หรือ admin/superadmin
    if (
      blog.user.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    req.blog = blog;
    next();
  } catch (error) {
    console.log("Authorization Error", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ success: false, message: "Admin only" });
  }
  next();
};

export const isSelfOrAdmin = (req, res, next) => {
  // เจ้าของหรือ admin
  if (
    req.user.role === "admin" ||
    req.user._id.toString() === req.params.userId
  ) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Not authorized" });
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ success: false, message: "SuperAdmin only" });
  }
  next();
};
