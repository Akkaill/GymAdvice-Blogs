import nodemailer from "nodemailer";

export const sendEmailOTP = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,        // myemail@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD // app password 16 ตัว
      }
    });

    const mailOptions = {
      from: `"GymAdvice OTP" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Your OTP Code for GymAdvice",
      html: `
        <div style="font-family:sans-serif; padding:20px;">
          <h2 style="color:#4F46E5;">Your OTP Code</h2>
          <p>Use the code below to verify your account:</p>
          <h1 style="font-size:32px; color:#111;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[OTP] Sent email to ${to}`);
  } catch (err) {
    console.error("Gmail OTP Error:", err.message);
    throw new Error("Failed to send OTP email");
  }
};
