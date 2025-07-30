import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createLog } from "../utils/log.js";
import SecuritySettings from "../models/securitySetting.model.js";
import { sendOTP } from "../utils/sendOtp.js";
import TempOtp from "../models/tempOtp.model.js";
import { sendEmailOTP } from "../utils/sendEmailOTP.js";
import { sendSMSOTP } from "../utils/sendSMSOTP.js";

// สร้าง Access Token
const createAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// สร้าง Refresh Token
const createRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

const sendRefreshCookie = (res, token) => {
  res.cookie("jid", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

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

export const preRegister = async (req, res) => {
  const { username, password, email, phone } = req.body;

  if (!username || !password || (!email && !phone)) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }

  console.log("📤 Sending OTP with tempData:", { username, password });
  await sendOTP(null, email, phone, {
    extra: { username, password },
  });

  return res.status(200).json({
    success: true,
    message: "OTP sent. Please verify.",
    contact: email || phone,
  });
};

export const verifyRegister = async (req, res) => {
  const { otp, email, phone } = req.body;
  console.log(">> VerifyRegister Request:", { otp, email, phone });
  const query = email ? { email } : { phone };

  const temp = await TempOtp.findOne(query);
  if (!temp) {
    return res
      .status(400)
      .json({ success: false, message: "No pending registration found" });
  }

  if (temp.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  if (temp.expiresAt < new Date()) {
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  console.log("✅ TempOtp found:", temp);
  if (!temp.tempData?.username || !temp.tempData?.password) {
    return res.status(400).json({
      success: false,
      message: "Invalid data. Please register again.",
    });
  }

  try {
    const newUser = new User({
      username: temp.tempData.username,
      password: temp.tempData.password,
      email: temp.email,
      phone: temp.phone,
    });

    await newUser.save();

    // ลบ TempOtp หลังสร้าง user สำเร็จ
    await TempOtp.deleteOne({ _id: temp._id });

    return res.json({
      success: true,
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (err) {
    console.error(" User creation failed:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password, phone, otp } = req.body;
  const user = await User.findOne({ email });
  const now = new Date();

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const settings = await SecuritySettings.findOne();
  const maxAttempts = settings?.maxLoginAttempts || 5;

  // 1. ตรวจว่า locked ไว้ไหม
  if (
    user.lockedUntil &&
    user.lockedUntil > now &&
    user.failedLoginAttempts >= maxAttempts + 2
  ) {
    user.tempContactInfo = { email, phone, otpRequired: true };
    await user.save();
    await sendOTP(user._id, email, phone);
    return res
      .status(401)
      .json({ success: false, message: `Locked. OTP sent.` });
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
      user.lockedUntil = new Date(Date.now() + 3 * 60 * 1000);
    }
    // 3.2 ถ้าเกิน 3 นาทีแล้ว ยังพลาดอีก 2 รอบ → บังคับยืนยันตัวต

    if (
      user.lockedUntil &&
      user.lockedUntil < new Date() &&
      user.failedLoginAttempts >= maxAttempts + 2
    ) {
      user.tempContactInfo = { email, phone, otpRequired: true };
      await sendOTP(user._id, email, phone);
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

  // 4️. ถ้ารหัสผ่านถูก สร้าง Token Login สำเร็จ
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.tempContactInfo = {};
  await user.save();
  await createLog("login", user._id, `User ${user.username} logged in`);

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  sendRefreshCookie(res, refreshToken);

  return res.json({
    success: true,
    accessToken,
    user: {
      _id: user._id,
      username: user.username,
      role: user.role,
    },
  });
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.jid;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No refresh token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const accessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    sendRefreshCookie(res, newRefreshToken);

    return res.json({ success: true, accessToken });
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

export const getMe = async (req, res) => {
  const user = req.user; // จาก protect
  if (!user) {
    return res.status(401).json({ success: false, message: "No user session" });
  }

  return res.json({
    success: true,
    user: {
      _id: user._id,
      username: user.username,
      role: user.role,
    },
  });
};

export const logout = async (req, res) => {
  try {
    if (!req.user?._id) {
      console.warn("No user found in request");
    } else {
      const user = await User.findById(req.user._id);
      if (user) {
        user.tokenVersion += 1; // revoke tokens
        await user.save();
        await createLog("Logout", req.user._id, "User logged out");
      }
    }
  } catch (err) {
    console.error("Logout Error:", err.message);
  } finally {
    res.clearCookie("jid", {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return res.json({ success: true, message: "Logged out successfully" });
};

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

  const email = user.tempContactInfo?.email;
  const phone = user.tempContactInfo?.phone;

  if (email) {
    await sendEmailOTP(email, otp);
  } else if (phone) {
    await sendSMSOTP(phone, otp);
  } else {
    throw new Error("No contact info available");
  }

  user.tempContactInfo.lastOtpSentAt = now;
  await user.save();
  console.log(`[OTP] Sent OTP ${otp} to ${email || phone}`);

  res.json({ success: true, message: "OTP resent successfully" });
};

export const resendTempOTP = async (req, res) => {
  const { contact } = req.body;

  if (!contact)
    return res
      .status(400)
      .json({ success: false, message: "Contact is required" });

  const query = contact.includes("@") ? { email: contact } : { phone: contact };

  const existingTemp = await TempOtp.findOne(query);
  if (!existingTemp)
    return res
      .status(404)
      .json({ success: false, message: "No pending registration found" });

  const now = new Date();
  const lastSent = existingTemp.updatedAt;

  if (now - lastSent < 30 * 1000) {
    const wait = Math.ceil((30 * 1000 - (now - lastSent)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Please wait ${wait}s before resending OTP`,
    });
  }

  await sendOTP(null, existingTemp.email, existingTemp.phone, {
    extra: {
      username: existingTemp.username,
      password: existingTemp.password,
    },
  });

  res.json({ success: true, message: "OTP resent successfully" });
};

export const verifyOTP = async (req, res) => {
  const { otp } = req.body;
  const record = await TempOtp.findOne({ otp });
  if (!record || record.expiresAt < new Date()) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expire OTP",
    });
  }
  const user = await User.findById(record.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  await TempOtp.deleteMany({ userId: user._id });
  user.tempContactInfo = {};
  user.lockedUntil = null;
  user.failedLoginAttempts = 0;
  await user.save();
  await createLog("otp_verified", user._id, "OTP verified successfully");
  return res.json({ success: true, message: "OTP verified successfully" });
};

export const checkDuplicate = async (req, res) => {
  let { username, email } = req.body;

  if (username) username = username.trim();
  if (email) email = email.trim().toLowerCase();
  const query = [];
  if (username) query.push({ username });
  if (email) query.push({ email });

  if (query.length === 0) {
    return res.status(400).json({ error: "No input provided" });
  }

  const existing = await User.findOne({ $or: query });

  let field = null;
  if (existing) {
    if (username && existing.username === username) field = "username";
    if (email && existing.email === email) field = "email";

    return res.status(200).json({
      exists: true,
      field,
    });
  }

  return res.status(200).json({ exists: false, field: null });
};
