import User from "../models/user.model.js";
import { createLog } from "../utils/log.js";
import Notification from "../models/notification.model.js";


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json({ success: true, users });
  } catch (err) {
    console.error("Get All Users Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["admin", "user", "superadmin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role value" });
  }

  try {
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await createLog("SuperAdmin Updated role", req.user._id, `Role updated for ${user.username}`);
    await Notification.create({
      user: user._id,
      title: `Your role was updated to ${user.role}`,
      type: "role_updated",
      createdBy: req.user._id,
    });

    res.json({ success: true, message: "Role updated", user });
  } catch (err) {
    console.error("Update Role Error:", err.message);
    res.status(500).json({ success: false, message: "Server error updating role" });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return res.status(400).json({ success: false, message: "User not found" });

    await createLog("SuperAdmin deleted user", req.user._id, `Deleted user ID: ${userId}`);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("Delete User Error:", err.message);
    res.status(500).json({ success: false, message: "Server error deleting user" });
  }
};

export const createAdmin = async (req, res) => {
  const { username, password } = req.body;

  const userExists = await User.findOne({ username });
  if (userExists)
    return res.status(400).json({ success: false, message: "Username exists" });

  try {
    const newAdmin = new User({ username, password, role: "admin" });
    await newAdmin.save();
    await createLog("SuperAdmin Created Admin", req.user._id, `Admin created: ${newAdmin.username}`);
    await Notification.create({
      user: newAdmin._id,
      title: `Admin ${newAdmin.username} was created`,
      type: "admin_created",
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, message: "Admin Created", user: newAdmin });
  } catch (err) {
    console.error("Create Admin Error:", err.message);
    res.status(500).json({ success: false, message: "Server error creating admin" });
  }
};

export const revoke = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.tokenVersion += 1;
    await user.save();
    await createLog("SuperAdmin revoked token", req.user._id);
    await Notification.create({
      user: user._id,
      title: "Your account has been revoked",
      type: "account_revoked",
      createdBy: req.user._id,
    });

    res.status(200).json({ success: true, message: "User revoked successfully" });
  } catch (err) {
    console.error("Revoke Error:", err.message);
    res.status(500).json({ success: false, message: "Server error revoking user" });
  }
};
