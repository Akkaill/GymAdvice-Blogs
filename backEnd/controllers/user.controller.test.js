import request from "supertest";
import express from "express";
import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.JWT_SECRET = "test";
process.env.JWT_REFRESH_SECRET = "test";

let role = "user";

vi.mock("../models/user.model.js", () => ({
  default: {
    findOne: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("../models/securitySetting.model.js", () => ({
  default: { findOne: vi.fn() },
}));

vi.mock("bcrypt", () => ({
  default: { compare: vi.fn() },
}));

vi.mock("../middleware/authMiddleware.js", () => ({
  protect: (req, res, next) => {
    req.user = { _id: "u1", role };
    next();
  },
  isSuperAdmin: (req, res, next) => {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  },
  isSelfOrAdmin: (req, res, next) => next(),
  otpRateLimit: (req, res, next) => next(),
}));

vi.mock("../utils/log.js", () => ({
  createLog: vi.fn(),
}));

import userRoutes from "../routes/user.route.js";
import User from "../models/user.model.js";
import SecuritySettings from "../models/securitySetting.model.js";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);

beforeEach(() => {
  vi.clearAllMocks();
  role = "user";
});

describe("Authentication and Authorization", () => {
  it("logs in successfully with valid credentials", async () => {
    User.findOne.mockResolvedValue({
      _id: "1",
      username: "john",
      role: "user",
      password: "hashed",
      failedLoginAttempts: 0,
      lockedUntil: null,
      tempContactInfo: {},
      save: vi.fn().mockResolvedValue(),
    });
    SecuritySettings.findOne.mockResolvedValue({ maxLoginAttempts: 5 });
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "john@example.com", password: "secret" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe("john");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("fails to login with unknown email", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "no@example.com", password: "secret" });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("allows superadmin to access all users", async () => {
    role = "superadmin";
    User.find.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue([{ _id: "1", username: "john" }]),
    });

    const res = await request(app).get("/api/users/all");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("blocks non-superadmin from accessing all users", async () => {
    role = "user";
    const res = await request(app).get("/api/users/all");
    expect(res.statusCode).toBe(403);
  });
});
