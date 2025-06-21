import User from "../models/user.model.js";
import { createLog } from "../utils/log.js";
import Notification from "../models/notification.model.js";

export const updateUserRole = async (req, res) => {
  const { userId } = req.params; // จาก URL
  const { username, role } = req.body; // จาก body เช่น "admin" หรือ "user"

  if (!["admin", "user", "superadmin"].includes(role)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid role value" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await createLog(
      "SuperAdmin Updated role",
      req.user._id,
      `Role updated for user ID: ${username}`
    );
    await Notification.create({
      user: targetUser._id,
      title: `Your role was updated to ${targetUser.role}`,
      type: "role_updated",
      createdBy: req.user._id,
    });
    res.json({ success: true, message: "Role updated", user });
    console.log(
      `[ROLE CHANGE] SuperAdmin: ${req.user.username} changed role of User ID: ${userId} to ${role}`
    );
  } catch (err) {
    console.error("Update Role Error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Server error updating role" });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    await createLog(
      "SuperAdmin deleted role",
      req.user._id,
      ` Deleted for user ID: ${userId}`
    );

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.log("Delete User Error:", err.message);
    res.status(500),
      json({ success: false, message: "Server error deleting user" });
  }
};

export const createAdmin = async (req, res) => {
  const { username, password } = req.body;
  const { userId } = req.params;

  const userExists = await User.findOne({ username });
  if (userExists)
    return res.status(400).json({ success: false, message: "Username exists" });

  const newAdmin = new User({ username, password, role: "admin" });
  await newAdmin.save();
  await createLog(
    "SuperAdmin Created new Admin",
    req.user._id,
    `Admin has created: ${newAdmin.username}`
  );
  await Notification.create({
    user: userId, // ผู้ที่ถูกสร้าง
    title: `Admin ${userId.username} was created`,
    type: "admin_created",
    createdBy: req.userId, // คนที่สร้าง
  });

  res
    .status(201)
    .json({ success: true, message: "SuperAdmin Created", user: newAdmin });
};

export const revoke = async (req, res) => {
  const user = await User.findById(req.params.userId);
  user.tokenVersion += 1;
  await user.save();
  await createLog("SuperAdmin revoked ", req.user._id);
  await Notification.create({
    user: targetUser._id,
    title: "Your account has been revoked",
    type: "account_revoked",
    createdBy: req.user._id,
  });

  res.status(201).json({ success: "true", message: "User has been revoked" });
};
