import mongoose from "mongoose";
const tempOtpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: String,
    phone: String,
    otp: String,
    expiresAt: Date,
    tempData: {
      username: { type: String, required: false },
      password: { type: String, required: false },
    },
  },
  { timestamps: true }
);


// เช็ก model ซ้ำเพื่อป้องกัน hot-reload ซ้อน
const TempOtp = mongoose.models.TempOtp || mongoose.model("TempOtp", tempOtpSchema);
export default TempOtp;
