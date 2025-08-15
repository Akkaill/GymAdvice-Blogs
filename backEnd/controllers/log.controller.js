import Log from "../models/log.model.js";


export const getLogs = async (req, res) => {
  const { action, userId } = req.query;
  const filter = {};

  if (action) filter.action = new RegExp(action, "i"); // case-insensitive
  if (userId) filter.performedBy = userId;

  try {
    const logs = await Log.find(filter)
      .populate("performedBy", "username role")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching logs" });
  }
};


export const deleteAllLogs = async (req, res) => {
  try {
    await Log.deleteMany();
    res.json({ success: true, message: "All logs deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting logs" });
  }
};


export const deleteLogById = async (req, res) => {
  const { logId } = req.params;

  try {
    const log = await Log.findByIdAndDelete(logId);

    if (!log) {
      return res.status(404).json({ success: false, message: "Log not found" });
    }

    res.json({ success: true, message: "Log deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting log" });
  }
};
