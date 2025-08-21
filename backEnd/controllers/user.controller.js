import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createLog } from "../utils/log.js";
import SecuritySettings from "../models/securitySetting.model.js";
import { sendOTP } from "../utils/sendOtp.js";
import TempOtp from "../models/tempOtp.model.js";
import { sendEmailOTP } from "../utils/sendEmailOTP.js";
import { sendSMSOTP } from "../utils/sendSMSOTP.js";
import logger from "../config/logger.js";

const isProd = process.env.NODE_ENV === "production";
const createAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const createRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

export const sendRefreshCookie = (res, token) => {
  res.cookie("jid", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/api/users/refresh-token",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const getAllUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const query = search ? { username: { $regex: search, $options: "i" } } : {};

    const users = await User.find(query)
      .select("-password")
      .sort({ [sortBy]: order });

    res.status(200).json({ success: true, data: users });
  } catch (err) {
    logger.error("Get Users Error", { message: err.message })
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

  logger.info("Sending OTP for registration");
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
  logger.debug("VerifyRegister request received")
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

  logger.debug("Temporary OTP record found")
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
    await TempOtp.deleteOne({ _id: temp._id });

    return res.json({
      success: true,
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (err) {
     logger.error("User creation failed", err);
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

  // 1. ตรวจรหัสผ่านก่อน
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    // ถ้าพลาดเกิน maxAttempts → ล็อค 3 นาที
    if (user.failedLoginAttempts >= maxAttempts) {
      user.lockedUntil = new Date(Date.now() + 3 * 60 * 1000);
    }

    await user.save();
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // 2. ถ้ารหัสถูก แต่ถูกล็อคเกินรอบ → OTP
  if (
    user.lockedUntil &&
    user.lockedUntil > now &&
    user.failedLoginAttempts >= maxAttempts + 2
  ) {
    user.tempContactInfo = { email, phone, otpRequired: true };
    await user.save();
    await sendOTP(user._id, email, phone);
    return res.status(401).json({
      success: false,
      message: "Verification required. Please enter OTP",
      requireVerification: true,
    });
  }

  // 3. ถ้าต้องการ OTP อยู่แล้ว
  if (user.tempContactInfo?.otpRequired) {
    if (!otp) {
      const existingOtp = await TempOtp.findOne({ userId: user._id });
      if (!existingOtp) {
        await sendOTP(user._id, email, phone);
      }

      return res.status(401).json({
        success: false,
        message: "OTP required",
        requireVerification: true,
      });
    }

    const record = await await TempOtp.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        email,
        phone,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    if (
      !record ||
      record.otp !== String(otp) ||
      record.expiresAt < new Date()
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await TempOtp.deleteMany({ userId: user._id });
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.tempContactInfo = {};
    await user.save();
  }

  // 4. Login สำเร็จ
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
    return res.json({ success: false, message: "No refresh token" });
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
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: "No user session" });
  }

  return res.json({
    success: true,
    user: {
      _id: user._id,
      username: user.username,
      role: user.role,
      avatar: user.avatar?.url || null,
    },
  });
};

export const logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  try {
    let userId = req.user?._id;

    if (!userId && req.cookies?.jid) {
      try {
        const payload = jwt.verify(
          req.cookies.jid,
          process.env.JWT_REFRESH_SECRET
        );
        userId = payload?.id;
      } catch (e) {}
    }

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.tokenVersion = (user.tokenVersion || 0) + 1; 
        await user.save();
        await createLog("Logout", user._id, "User logged out");
      }
    } else {
        logger.warn("Logout: no user resolvable (no req.user and bad cookie)");
    }
  } catch (err) {
   logger.error("Logout Error", { message: err.message });
  } finally {
    res.clearCookie("jid", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/api/users/refresh-token",
    });
    return res.json({ success: true, message: "Logged out successfully" });
  }
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
     logger.error("Password Update Error", { message: err.message });
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

  if (lastSent && now - lastSent < 30 * 1000) {
    const wait = Math.ceil((30 * 1000 - (now - lastSent)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Please wait ${wait} seconds before requesting OTP again.`,
      retryAfter: wait,
    });
  }

  const otp = generateOTP();
  await TempOtp.deleteMany({ userId });

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
   logger.info("OTP sent to user");

  res.json({ success: true, message: "OTP resent successfully" });
};

export const resendTempOTP = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone)
      return res.status(400).json({ message: "email or phone required" });

    const existingTemp = await TempOtp.findOne(email ? { email } : { phone });
    if (!existingTemp)
      return res.status(404).json({ message: "No pre-register found" });

    const { otp, expiresAt } = await upsertTempOtp({
      email,
      phone,
      tempData: existingTemp.tempData,
    });

    await sendOTP({
      email,
      phone,
      otp,
      extra: {
        username: existingTemp.tempData?.username,
      },
    });

    res.json({ message: "OTP resent" });
  } catch (err) {
    next(err);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { otp, email, phone, userId } = req.body;
    if (!otp || (!email && !phone && !userId))
      return res
        .status(400)
        .json({ message: "otp + (email|phone|userId) required" });

    const query = {};
    if (userId) query.userId = userId;
    if (email) query.email = email;
    if (phone) query.phone = phone;
    query.otp = otp;

    const record = await TempOtp.findOne(query);
    if (!record) return res.status(400).json({ message: "Invalid OTP" });
    if (record.expiresAt < new Date()) {
      await record.deleteOne();
      return res.status(400).json({ message: "OTP expired" });
    }

    const targetUserId = record.userId;
    if (!targetUserId)
      return res.status(400).json({ message: "OTP not linked to user" });

    await User.findByIdAndUpdate(targetUserId, {
      $set: { failedLoginAttempts: 0, lockedUntil: null },
    });

    await record.deleteOne();
    return res.json({ message: "OTP verified" });
  } catch (err) {
    next(err);
  }
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
