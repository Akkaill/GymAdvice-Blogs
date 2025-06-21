import mongoose from "mongoose";
const tempOtpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: String,
  phone: String,
  otp: String,
  expiresAt: Date,
});

const TempOtp = mongoose.model("TempOtp", tempOtpSchema);
export default TempOtp;
