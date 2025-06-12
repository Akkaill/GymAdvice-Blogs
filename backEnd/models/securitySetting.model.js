import mongoose from "mongoose";

const securitySettingsSchema = new mongoose.Schema({
  registrationEnabled: { type: Boolean, default: true },
  maxLoginAttempts: { type: Number, default: 5 },
}, { timestamps: true });

const SecuritySettings = mongoose.model("SecuritySettings", securitySettingsSchema);
export default SecuritySettings;
