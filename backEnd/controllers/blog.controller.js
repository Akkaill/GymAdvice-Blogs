import Blog from "../models/blogs.model.js";
import mongoose from "mongoose";

export const getBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const cursor = req.query.cursor || null; // cursor = last _id จากหน้าก่อน
    const search = req.query.search || "";
    const allowedSortFields = ["createdAt", "title", "updatedAt"];
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";

    const order = req.query.order === "asc" ? 1 : -1;
    // filter search title
    const filter = {
      title: { $regex: search, $options: "i" },
    };

    // ถ้ามี cursor ให้เพิ่ม filter สำหรับ pagination แบบ cursor
    if (cursor) {
      // ต้องแปลง cursor เป็น ObjectId (Mongo)
      const ObjectId = require("mongoose").Types.ObjectId;

      // ใช้ sortBy + order กำหนดเงื่อนไข
      // ถ้า order desc: ต้องหา _id น้อยกว่า cursor
      // สมมติ sortBy เป็น createdAt หรืออื่น ๆ สมมติเราจัดเรียงโดย _id (เรียงตามเวลาสร้าง)

      filter._id = order === 1 
        ? { $gt: ObjectId(cursor) } 
        : { $lt: ObjectId(cursor) };
    }

    // ดึงข้อมูลโดย sort และ limit
    const blogs = await Blog.find(filter)
      .sort({ [sortBy]: order })
      .limit(limit + 1); // +1 เพื่อเช็คว่ามีหน้าต่อไหม

    const hasMore = blogs.length > limit;
    if (hasMore) blogs.pop(); // ลบ item ตัวที่ 7 ออก (เก็บไว้แค่ 6)

    const nextCursor = hasMore ? blogs[blogs.length - 1]._id : null;

    res.status(200).json({
      success: true,
      data: blogs,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error in getBlogs:", error);  
    res.status(500).json({ success: false, message: "Server error" });
}
};


export const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const Blog = await Blog.findById(id);
    res.status(200).json({ success: true, data: Blog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failure to FetchById" });
  }
};

export const createBlog = async (req, res) => {
  const blog = req.body;
  if (!blog.title || !blog.subtitle || !blog.description || !blog.image) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  const newBlog = new Blog(blog);
  try {
    await newBlog.save();
    res.status(201).json({ success: true, data: newBlog });
  } catch (error) {
    console.error("Error in Create blog", error.message);
    res.status(500).json({ seccess: false, message: "Server error to create" });
  }
};

export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const blog = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "InvalidId" });
  }

  try {
    const updateBlog = await Blog.findByIdAndUpdate(id, blog, { new: true });
    res.status(200).json({ success: true, data: updateBlog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error to Update" });
  }
};

export const deleteBlog = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "InvalidId" });
  }
  try {
    await Blog.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "deleted completely" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error to Delete" });
  }
  console.log("deleted", id);
};
