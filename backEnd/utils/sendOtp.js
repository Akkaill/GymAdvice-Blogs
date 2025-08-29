import TempOtp from "../models/tempOtp.model.js";
import { sendEmailOTP } from "./sendEmailOTP.js";
import logger from "../config/logger.js";

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (userId, email, phone, options = {}) => {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const query = {};
    if (userId) query.userId = userId;
    if (email) query.email = email;
    if (phone) query.phone = phone;

    if (Object.keys(query).length === 0) {
      throw new Error("sendOTP requires at least one of userId/email/phone");
    }

    await TempOtp.deleteMany(query);

    await TempOtp.create({
      userId: userId || null,
      email: email || null,
      phone: phone || null,
      otp,
      expiresAt,
      tempData: options.extra || {},
    });

    const mode = process.env.OTP_MODE || "live";
    if (mode === "log") {
      logger.info("MOCK OTP (no send)", { to: email || phone, otp });
    } else {
      if (email) await sendEmailOTP(email, otp);
    }

    if (process.env.NODE_ENV !== "production") {
      logger.info(`Sending OTP ${otp} to ${email || phone}`);
    } else {
      logger.info(`Sending OTP to ${email || phone}`);
    }
  } catch (err) {
    logger.error("sendOTP failed", { message: err.message });
    throw err;
  }
};
