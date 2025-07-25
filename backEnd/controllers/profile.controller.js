import User from "../models/user.model.js";
import Blog from "../models/blogs.model.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

// GET /profile → ดึงข้อมูล user + blogs ของตัวเอง
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "username email avatar role"
    );
    const blogs = await Blog.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "username");

    res.json({
      success: true,
      user,
      blogs,
    });
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /profile/username → แก้ไข username
export const updateUsername = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username } = req.body;

    if (!username)
      return res.status(400).json({ message: "Username is required" });

    const user = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    ).select("username");
    res.json({ message: "Username updated", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update username", error: err.message });
  }
};

// PUT /profile/avatar → อัปโหลด / เปลี่ยน avatar
export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No image uploaded" });

    const user = await User.findById(userId);
    if (user.avatar?.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "avatars",
    });

    fs.unlinkSync(file.path);

    user.avatar = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await user.save();

    res.json({ message: "Avatar updated", avatar: user.avatar });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update avatar", error: err.message });
  }
};

// DELETE /profile/avatar → ลบ avatar
export const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.avatar?.public_id)
      return res.status(400).json({ message: "No avatar to delete" });

    await cloudinary.uploader.destroy(user.avatar.public_id);
    user.avatar = null;
    await user.save();

    res.json({ message: "Avatar deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete avatar", error: err.message });
  }
};
