import SecuritySettings from "../models/securitySetting.model.js";
import { createLog } from "../utils/log.js";


export const getSecuritySettings = async (req, res) => {
  const settings = await SecuritySettings.findOne();
  res.json({ success: true, settings });
};


export const updateSecuritySettings = async (req, res) => {
  const { registrationEnabled, maxLoginAttempts } = req.body;

  try {
    const settings = await SecuritySettings.findOneAndUpdate(
      {},
      { registrationEnabled, maxLoginAttempts },
      { new: true, upsert: true }
    );

    await createLog("update_security", req.user._id, "Updated security settings");

    res.json({ success: true, message: "Settings updated", settings });
  } catch (err) {
    console.error("Update Security Error:", err.message);
    res.status(500).json({ success: false, message: "Server error updating settings" });
  }
};
