import nodemailer from "nodemailer";

export const sendEmailOTP = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
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
    logger.info("OTP email sent");
  } catch (err) {
    logger.error("Gmail OTP Error", { message: err.message });
    throw new Error("Failed to send OTP email");
  }
};
