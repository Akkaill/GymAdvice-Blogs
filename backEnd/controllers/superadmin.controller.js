import User from "../models/user.model.js";
import { createLog } from "../utils/log.js";

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

  res
    .status(201)
    .json({ success: true, message: "SuperAdmin Created", user: newAdmin });
};
