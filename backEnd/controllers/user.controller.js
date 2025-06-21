import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createLog } from "../utils/log.js";
import SecuritySettings from "../models/securitySetting.model.js";
import { sendOTP } from "../utils/sendOtp.js";
import TempOtp from "../models/tempOtp.model.js";
import { sendEmailOTP } from "../utils/sendEmailOTP.js";
import { sendSMSOTP } from "../utils/sendSMSOTP.js";
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
  const now = new Date();
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const settings = await SecuritySettings.findOne();
  const maxAttempts = settings?.maxLoginAttempts || 5;

  // 1. ตรวจว่า locked ไว้ไหม
  if (
    user.lockedUntil &&
    user.lockedUntil > now &&
    user.failedLoginAttempts >= maxAttempts + 2
  ) {
    user.tempContactInfo = {
      email: email || "",
      phone: phone || "",
      otpRequired: true,
    };

    await user.save();

    await sendOTP(user._id, email, phone);
    return res.status(401).json({
      success: false,
      message: `Locked. OTP sent.`,
    });
  }

  // 2.ถ้า otpRequired แล้ว ยังไม่ส่ง otp เเละ เช็ค OTP จากฐานข้อมูล (ถ้าถูกล็อกไว้แล้ว)
  if (user.tempContactInfo?.otpRequired) {
    if (!otp) {
      return res.status(401).json({
        success: false,
        message: "OTP required",
        requireVerification: true,
      });
    }

    const record = await TempOtp.findOne({ userId: user._id });

    if (!record || record.otp !== otp || record.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // OTP ถูกต้อง → clear
    await TempOtp.deleteMany({ userId: user._id });
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.tempContactInfo = {};
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

      await sendOTP(user._id, email || phone); // mock function

      await user.save();

      return res.status(401).json({
        success: false,
        message: "Verification required. Please enter OTP",
        requireVerification: true,
      });
    }

    await user.save();
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // 4️. ถ้ารหัสผ่านถูก สร้าง Token
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.tempContactInfo = {};
  await user.save();
  await createLog("login", user._id, `User ${user.username} logged in`);
  const token = jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
    },
  });
};

export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.tokenVersion += 1;
    await user.save();
    await createLog("Logout", req.user._id, "User logged out");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err.message);
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

export const resendOTP = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const lastSent = user.tempContactInfo?.lastOtpSentAt;
  const now = new Date();

  //เช็ค delay 30 วินาที
  if (lastSent && now - lastSent < 30 * 1000) {
    const wait = Math.ceil((30 * 1000 - (now - lastSent)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Please wait ${wait} seconds before requesting OTP again.`,
      retryAfter: wait,
    });
  }

  // สร้างใหม่และส่ง
  const otp = generateOTP(); // random 6 digit
  await TempOtp.deleteMany({ userId }); // ล้างเก่า

  await TempOtp.create({
    userId,
    email: user.tempContactInfo.email || null,
    phone: user.tempContactInfo.phone || null,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  if (email) {
    await sendEmailOTP(user.tempContactInfo.email, otp);
  } else if (phone) {
    await sendSMSOTP(user.tempContactInfo.phone, otp);
  } else {
    throw new Error("No contact info available");
  }

  user.tempContactInfo.lastOtpSentAt = now;
  await user.save();

  res.json({ success: true, message: "OTP resent successfully" });
};
