import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmailOTP = async (to, otp) => {
  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject: "This is your OTP Code from GymAdvice-Blogs",
    html: `
      <div style="font-family:sans-serif; padding:20px;">
        <h2 style="color:#4F46E5;">Login Verification</h2>
        <p>Your OTP code is:</p>
        <div style="font-size:28px; font-weight:bold; letter-spacing:4px; color:#111;">${otp}</div>
        <p style="margin-top:20px;">This code will expire in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr/>
        <small>Powered by Your App Name</small>
      </div>
    `,
  };
  try{
    await sgMail.send(msg)
    console.log(`OTP sent to ${to}`)
  }catch(err){
    console.log("SendGrid Error:", err.response?.body || err.message)
    throw new Error("Failed to send OTP Email")
  }
};
