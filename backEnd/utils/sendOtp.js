import TempOtp from "../models/tempOtp.model.js";
import { sendEmailOTP } from "./sendEmailOTP.js";
// import { sendSMSOTP } from "./sendSMSOTP.js";
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (userId, email, phone, options = {}) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // กำหนด query ลบเดิม
  const query = userId ? { userId } : { email };

  await TempOtp.deleteMany(query);

  // สร้าง TempOtp ใหม่ (รองรับ username, password)
  await TempOtp.create({
    userId,
    email,
    phone,
    otp,
    expiresAt,
    tempData: options.extra ||{},
  });

  if (email) await sendEmailOTP(email, otp);
  // if (phone) await sendSMSOTP(phone, otp);

  console.log(`Sending OTP ${otp} to ${email || phone}`);
};


