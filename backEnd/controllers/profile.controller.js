import User from "../models/user.model.js";
import Blog from "../models/blogs.model.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "username email avatar role instagram"
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

export const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, instagram } = req.body;

    if (!username && !instagram) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (instagram) updateData.instagram = instagram;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("username instagram");

    res.json({ message: "User info updated", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update info", error: err.message });
  }
};

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
    console.error("Avatar Upload Error:", err);
    res
      .status(500)
      .json({ message: "Failed to update avatar", error: err.message });
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.avatar?.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    user.avatar = {
      url: "",
      public_id: "",
    };
    await user.save();

    res.json({ message: "Avatar deleted (if existed)" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete avatar", error: err.message });
  }
};
