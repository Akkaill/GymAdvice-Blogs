import twilio from "twilio";
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMSOTP = async (toPhone, otp) => {
  if(!toPhone) throw new Error("Phone number is required")
  try {
    await client.messages.create({
      body: `This is your OTP Code from GymAdvice-Blogs : ${otp}. It will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    console.log(`OTP sent to ${toPhone}`);
  } catch (err) {
    console.log("Twilio Error:", err.message);
    throw new Error("Failed to send OTP via SMS");
  }
};
