import nodemailer from "nodemailer";
import logger from "../config/logger.js";

export async function sendEmailOTP(to, otp) {
  // ตรวจ env ให้ครบก่อน
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmail credentials are not configured");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // 465 = TLS
    auth: {
      user: process.env.GMAIL_USER,        
      pass: process.env.GMAIL_APP_PASSWORD 
    },
    pool: true, 
  });

  const mailOptions = {
    from: `"GymAdvice OTP" <${process.env.GMAIL_USER}>`, 
    to,
    subject: "Your OTP Code for GymAdvice",
    html: `
      <div style="font-family:sans-serif; padding:20px;">
        <h2 style="color:#4F46E5;margin:0 0 8px;">Your OTP Code</h2>
        <p>Use the code below to verify your account:</p>
        <h1 style="font-size:32px; color:#111; letter-spacing:4px;">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info("OTP email sent", { messageId: info.messageId });
  } catch (err) {
    logger.error("Gmail OTP Error", { code: err.code, response: err.response, message: err.message });
    throw new Error("Failed to send OTP email");
  }
}
