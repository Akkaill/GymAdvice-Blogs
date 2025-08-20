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
import {
  createBlogValidation,
  updateBlogValidation,
} from "../validators/blog.validator.js";
import { validate } from "../middleware/validationResult.js";

const router = express.Router();

router.get("/", getBlogs);
router.get("/top", getTopBlogs);
router.get("/favorites-list", protect, getFavoriteBlogs);
router.post("/", protect, createBlogValidation, validate, createBlog);
router.get("/:id", getBlogById);
router.post("/:id/favorite", protect, toggleFavorite);
router.put("/:id", protect, updateBlogValidation, validate, updateBlog);
router.delete("/:id", protect, isBlogOwner, deleteBlog);

export default router;
