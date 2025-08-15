import User from "../models/user.model.js";
import Blog from "../models/blogs.model.js";
import Log from "../models/log.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: "user" });
    const adminCount = await User.countDocuments({ role: "admin" });
    const superadmin = await User.countDocuments({ role: "superadmin" });
    const blogCount = await Blog.countDocuments();
    const logCount = await Log.countDocuments();

    res.json({
      success: true,
      message: {
        users: userCount,
        admins: adminCount,
        superadmin: superadmin,
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
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("performedBy", "username role");

    res.json({ success: true, data: logs });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};


export const getBlogsPerDay = async (req, res) => {
  try {
    const result = await Blog.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const data = result.map(r => ({ date: r._id, count: r.count }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error", error: err.message });
  }
};


export const getLoginsPerDay = async (req, res) => {
  try {
    const result = await Log.aggregate([
      { $match: { action: "login" } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const data = result.map(r => ({ date: r._id, count: r.count }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error", error: err.message });
  }
};
