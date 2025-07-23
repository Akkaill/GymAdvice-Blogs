import express from "express";
import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogs,
  updateBlog,
  toggleFavorite,
  getTopBlogs,
  getFavoriteBlogs,
} from "../controllers/blog.controller.js";
import { protect, isBlogOwner } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/top", getTopBlogs);
router.get("/favorites-list", protect, getFavoriteBlogs);
router.post("/", protect, createBlog);
router.get("/:id", getBlogById);
router.post("/:id/favorite", protect, toggleFavorite);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, isBlogOwner, deleteBlog);

console.log(process.env.MONGO_URI);
export default router;
