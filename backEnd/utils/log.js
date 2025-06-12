import Log from "../models/log.model.js";
export const createLog = async (action, userId, details = "") => {
  await Log.create({ action, performedBy: userId, details });
};
