import Blog from "../models/blogs.model.js";
import mongoose from "mongoose";
import { createNotification } from "../utils/notification.js";

export const getBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";

    const allowedSortFields = ["createdAt", "updatedAt", "title"];
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";

    const order = req.query.order === "asc" ? 1 : -1;

    const cursor = req.query.cursor;

    const filter = {
      title: { $regex: search, $options: "i" },
    };

    if (cursor) {
      if (!mongoose.Types.ObjectId.isValid(cursor)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cursor format",
        });
      }

      const cursorObjId = new mongoose.Types.ObjectId(cursor);

      filter._id = order === 1 ? { $gt: cursorObjId } : { $lt: cursorObjId };
    }

    const results = await Blog.find(filter)
      .sort({ [sortBy]: order })
      .limit(limit + 1)
      .populate({
        path: "favoritedBy",
        select: "_id",
        options: { lean: true },
      }) //
      .lean();

    const hasMore = results.length > limit;

    if (hasMore) results.pop();

    const nextCursor = hasMore
      ? results[results.length - 1]._id.toString()
      : null;

    res.status(200).json({
      success: true,
      data: results,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error in getBlogs:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findById(id)
      .populate("authorName", "username _id role avatar")
      .populate({
        path: "favoritedBy",
        select: "_id",
        options: { lean: true },
      })
      .lean();

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error("Error in getBlogById:", error);
    res.status(500).json({ success: false, message: "Failure to FetchById" });
  }
};

export const createBlog = async (req, res) => {
  const { title, subtitle, description, image } = req.body;

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!title || !subtitle || !description || !image) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  const newBlog = new Blog({
    title,
    subtitle,
    description,
    image,
    user: req.user._id,
    authorName: req.user._id,
  });

  try {
    await newBlog.save();
    res
      .status(201)
      .json({ success: true, message: "Blog created", data: newBlog });
  } catch (error) {
    console.error("Error in Create blog", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error: Failed to create blog" });
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const updates = req.body;

    const blog = await Blog.findById(blogId);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    if (
      !blog.user.equals(req.user._id) &&
      !["admin", "superadmin"].includes(req.user.role)
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    Object.assign(blog, updates);
    await blog.save();

    res.json({ success: true, data: blog });
  } catch (err) {
    if (next) {
      next(err);
    } else {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};

export const deleteBlog = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "InvalidId" });
  }
  try {
    const blog = await Blog.findByIdAndDelete(id);

    await createNotification({
      user: blog.user,
      type: "delete",
      title: `${blog.title} was deleted by Superadmin.`,
      content: `Your blog "${blog.title}" was deleted by Superadmin.`,
    });

    res
      .status(200)
      .json({ success: true, message: "deleted completely", data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error to Delete" });
  }
  console.log("deleted", id);
};

export const toggleFavorite = async (req, res) => {
  const blogId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    return res.status(400).json({ success: false, message: "Invalid blog ID" });
  }

  if (!req.user || !req.user._id) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: missing user" });
  }

  const blog = await Blog.findById(blogId);
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }

  const userId = req.user._id;
  if (!Array.isArray(blog.favoritedBy)) blog.favoritedBy = [];

  const index = blog.favoritedBy.findIndex((id) => id.equals(userId));
  let action = "";
  if (index === -1) {
    blog.favoritedBy.push(userId);
    action = "added";

    if (!req.user._id.equals(blog.authorName._id)) {
      await createNotification({
        user: blog.user,
        type: "favorite",
        title: `${blog.title} was favorited.`,
        content: `${req.user.username || "Someone"} favorited your blog "${
          blog.title
        }"`,
        link: `/blogs/${blog._id}`,
      });
    }
  } else {
    blog.favoritedBy.splice(index, 1);
    action = "removed";
  }

  blog.updatedAt = new Date();
  await blog.save();
  const updatedBlog = await Blog.findById(blogId)
    .populate({ path: "favoritedBy", select: "_id" })
    .lean();
  res.json({ success: true, data: updatedBlog });
};

export const getTopBlogs = async (req, res) => {
  try {
    const topBlogs = await Blog.aggregate([
      {
        $addFields: {
          favoriteCount: { $size: { $ifNull: ["$favoritedBy", []] } },
        },
      },
      {
        $sort: { favoriteCount: -1, createdAt: -1 },
      },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      {
        $project: {
          title: 1,
          subtitle: 1,
          description: 1,
          image: 1,
          createdAt: 1,
          favoritedBy: 1,
          favoriteCount: 1,
          author: { _id: "$author._id", username: "$author.username" },
        },
      },
    ]);

    res.json({ success: true, blogs: topBlogs });
  } catch (err) {
    console.error("Error in getTopBlogs:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch top blogs" });
  }
};

export const getFavoriteBlogs = async (req, res) => {
  try {
    console.log("🔐 USER FROM TOKEN:", req.user);
    const userId = req.user._id;

    const blogs = await Blog.find({ favoritedBy: userId })
      .populate({ path: "favoritedBy", select: "_id", options: { lean: true } })
      .lean();

    res.status(200).json({ success: true, data: blogs });
  } catch (err) {
    console.error("Error in getFavoriteBlogs:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch favorite blogs",
    });
  }
};
