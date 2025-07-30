import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    tokenVersion: { type: Number, default: 0 },
    avatar: {
      url: String,
      public_id: String,
    },
    instagram: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    email: { type: String, unique: true, required: true },
    phone: { type: String },

    tempContactInfo: {
      email: String,
      phone: String,
      otpRequired: { type: Boolean, default: false },
      lastOtpSentAt: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
