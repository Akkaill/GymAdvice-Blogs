import Blog from "../models/blogs.model.js";
import mongoose from "mongoose";


export const getBlogs = async (req, res) => {
  try {
    // ค่าที่ใช้ในการควบคุมการ paginate / filter / sort
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";

    // กำหนด field ที่สามารถ sort ได้เท่านั้น เพื่อความปลอดภัย
    const allowedSortFields = ["createdAt", "updatedAt", "title"];
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";

    // ถ้าไม่ส่งมา หรือผิด format → default เป็น desc (-1)
    const order = req.query.order === "asc" ? 1 : -1;

    // ตัวระบุตำแหน่งของหน้า (ใช้สำหรับ paginate ถัดไป)
    const cursor = req.query.cursor;

    // เริ่มต้น filter จาก search
    const filter = {
      title: { $regex: search, $options: "i" }, // insensitive regex search
    };

    //ถ้ามี cursor เพิ่ม filter ตามทิศทางของ order
    if (cursor) {
      if (!mongoose.Types.ObjectId.isValid(cursor)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cursor format",
        });
      }

      const cursorObjId = new mongoose.Types.ObjectId(cursor);

      //เลือกเงื่อนไข filter ให้สอดคล้องกับ order
      filter._id = order === 1 ? { $gt: cursorObjId } : { $lt: cursorObjId };
    }

    // ดึงข้อมูลเกินมา 1 ชิ้น เพื่อเช็คว่ายังมีต่อหรือไม่
    const results = await Blog.find(filter)
      .sort({ [sortBy]: order })
      .limit(limit + 1);
    // ตรวจสอบว่าเรามี "หน้าใหม่" หรือไม่
    const hasMore = results.length > limit;

    // ตัดทิ้งตัวที่เกิน limit (ตัวที่เอาไว้ดูเฉย ๆ ว่ามีต่อหรือเปล่า)
    if (hasMore) results.pop();

    // เอา _id ตัวสุดท้าย (เรียงตามที่เรากำหนด) มาใช้เป็น nextCursor
    const nextCursor = hasMore ? results[results.length - 1]._id.toString() : null;

    // ส่งกลับ frontend
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
    const blog = await Blog.findById(id);
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
