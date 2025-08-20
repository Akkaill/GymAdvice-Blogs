import Log from "../models/log.model.js";
export const createLog = async (
  action,
  userId,
  details = "",
  maxRetries = 1
) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await Log.create({ action, performedBy: userId, details });
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error("Failed to create log:", error.message);
      }
    }
  }
};
