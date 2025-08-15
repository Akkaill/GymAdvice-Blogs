import Comment from "../models/comment.model.js";
import Blog from "../models/blogs.model.js"
import { createNotification } from "../utils/notification.js";

export const createComment = async (req, res) => {
  const { content } = req.body;
  const { blogId } = req.params;
  const userId = req.user._id;

  if (!content?.trim()) {
    return res.status(400).json({ message: "Comment is empty" });
  }

  try {
    const created = await Comment.create({ blogId, userId, content });
    try {
      const blog = await Blog.findById(blogId).select("author title");
      if (blog && blog.author?.toString() !== userId.toString()) {
        await createNotification({
          user: blog.author,
          type: "comment",
          title: `New comment on ${blog.title}`,
          content: `${req.user.username} commented on your blog "${blog.title}".`,
        });
      }
    } catch {}


    const populated = await Comment.findById(created._id)
      .populate("userId", "username role avatar") 
      .lean();

    return res.status(201).json(populated);
  } catch (e) {
    return res.status(500).json({ message: "Failed to create comment" });
  }
};

export const getCommentsByBlogId = async (req, res) => {
  const { blogId } = req.params;
  try {
    const comments = await Comment.find({ blogId })
      .populate("userId", "username role avatar")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, comments });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = comment.userId.toString() === user._id.toString();
    const isAdmin = ["admin", "superadmin"].includes(user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(id);
    return res.status(200).json({ message: "Comment deleted" });
  } catch (e) {
    return res.status(500).json({ message: "Failed to delete comment" });
  }
};
