import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createLog } from "../utils/log.js";
import SecuritySettings from "../models/securitySetting.model.js";
import { sendOTP } from "../utils/sendOtp.js"; // สมมติว่าคุณจะมีระบบส่ง OTP

// ดึงผู้ใช้ทั้งหมด (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // ไม่คืน password
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Get Users Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const register = async (req, res) => {
  const { username, password } = req.body;
  const settings = await SecuritySettings.findOne();
  if (settings && !settings.registrationEnabled) {
    return res
      .status(403)
      .json({ success: "false", message: "Registration is disabled" });
  }
  try {
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ success: true, message: "User Created" });
  } catch (error) {
    console.log("Error in Create User", error.message);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};


export const login = async (req, res) => {
  const { username, password, email, phone, otp } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const settings = await SecuritySettings.findOne();
  const maxAttempts = settings?.maxLoginAttempts || 5;

  // 1. ตรวจว่า locked ไว้ไหม
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return res.status(403).json({
      success: false,
      message: `Account temporarily locked. Try again later.`,
    });
  }

  // 2.ถ้า otpRequired แล้ว ยังไม่ส่ง otp
  if (user.tempContactInfo.otpRequired) {
    if (!otp) {
      // ยังไม่ได้ยืนยัน
      return res.status(401).json({
        success: false,
        message: "OTP verification required",
        requireVerification: true,
        email: user.tempContactInfo.email,
        phone: user.tempContactInfo.phone,
      });
    }

    // TODO: ตรวจสอบ OTP ที่รับเข้ามา (mock ไปก่อน)
    if (otp !== "123456") {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    // ยืนยัน OTP สำเร็จ → ปล่อยให้เข้า login ได้
    user.tempContactInfo = {}; // clear
    user.failedLoginAttempts = 0;
    await user.save();
  }

  // 3.ตรวจรหัสผ่าน
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    // 3.1 ล็อค 3 นาที ถ้าเกิน maxAttempts
    if (user.failedLoginAttempts >= maxAttempts) {
      user.lockedUntil = new Date(Date.now() + 3 * 60 * 1000); // ล็อค 3 นาที
    }

    // 3.2 ถ้าเกิน 3 นาทีแล้ว ยังพลาดอีก 2 รอบ → บังคับยืนยันตัวตน
    if (
      user.lockedUntil &&
      user.lockedUntil < new Date() &&
      user.failedLoginAttempts >= maxAttempts + 2
    ) {
      user.tempContactInfo = {
        email: email || "",
        phone: phone || "",
        otpRequired: true,
      };

      // จำลองส่ง OTP
      if (email || phone) {
        await sendOTP(email || phone); // mock function
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message: "Verification required. Please enter OTP",
        requireVerification: true,
      });
    }

    await user.save();
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // 4️. ถ้ารหัสผ่านถูก
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.tempContactInfo = {};
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ success: true, token });
};


export const logout = async (req, res) => {
  try {
    await createLog("Logout", req.user._id, "User logged out");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};
// เปลี่ยนรหัสผ่าน
export const updateUserPassword = async (req, res) => {
  const { userId } = req.params;
  const { username, password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(
      userId,
      { password: hashed },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await createLog(
      "User Updated Password",
      req.user._id,
      `Password updated for user ID: ${username}`
    );

    res.json({ success: true, message: "Password updated", user });
  } catch (err) {
    console.error("Password Update Error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Server error updating password" });
  }
};
