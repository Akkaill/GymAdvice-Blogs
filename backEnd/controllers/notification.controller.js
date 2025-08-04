import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  const notis = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5);
  res.json({ success: true, data: notis });
};
export const markAsRead = async (req, res) => {
  const { id } = req.params;
  await Notification.findByIdAndUpdate(id, { read: true });
  res.json({ success: true });
};
