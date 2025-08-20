import twilio from "twilio";
import logger from "../config/logger.js";
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMSOTP = async (toPhone, otp) => {
  if (!toPhone) throw new Error("Phone number is required");
  try {
    await client.messages.create({
      body: `This is your OTP Code from GymAdvice-Blogs : ${otp}. It will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    logger.info("OTP SMS sent");
  } catch (err) {
    logger.error("Twilio Error", { message: err.message });
    throw new Error("Failed to send OTP via SMS");
  }
};
