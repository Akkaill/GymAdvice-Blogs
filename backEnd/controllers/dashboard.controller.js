import User from "../models/user.model.js";
import Blog from "../models/blogs.model.js";
import Log from "../models/log.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: "admin" });
    const blogCount = await Blog.countDocuments();
    const logCount = await Log.countDocuments();

    res.json({
      success: true,
      message: {
        users: userCount,
        admins: adminCount,
        blogs: blogCount,
        logs: logCount,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

export const getRecentLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("performedBy", "username role");

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};
