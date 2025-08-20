import Notification from "../models/notification.model.js";
import logger from "../config/logger.js";
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
    logger.error("Failed to create notification", { message: error.message });
  }
};
