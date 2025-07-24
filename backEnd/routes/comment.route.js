import express from "express";
import {
  createComment,
  getCommentsByBlogId,
  deleteComment,
} from "../controllers/comment.controller.js";
import { protect, isCommentOwner } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/blog/:blogId", getCommentsByBlogId);
router.post("/:blogId", protect, createComment);
router.delete("/:id", protect, isCommentOwner, deleteComment);

export default router;
