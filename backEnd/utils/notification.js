import Notification from "../models/notification.model.js";

export const createNotification = async ({ user, type, content, title }) => {
  try {
    const noti = new Notification({
      user,
      type,
      content,
      title,
    });
    await noti.save();
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
};
