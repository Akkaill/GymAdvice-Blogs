import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import blogRoutes from "./routes/blog.route.js";
import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import logRoutes from "./routes/log.route.js";
import superadminRoutes from "./routes/superadmin.route.js";
import securityRoutes from "./routes/security.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import notificationRoutes from "./routes/notification.route.js";
import commentRoutes from "./routes/comment.route.js";
import profileRoutes from "./routes/profile.route.js";

import logger from "./config/logger.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createLog } from "./utils/log.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

const allowList = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const allowRegex = [
  /^https?:\/\/(www\.)?gymadviceik\.com$/i,
  /^https?:\/\/[^/]+\.onrender\.com$/i,
];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const ok =
      allowList.includes(origin) || allowRegex.some((rx) => rx.test(origin));
    cb(null, ok);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Cookie",
  ],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(helmet());

const isProd = process.env.NODE_ENV === "production";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 120 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  skip: (req) => !isProd || req.method === "OPTIONS",
  message: "Too many requests from this IP, please try again later",
});
app.use("/api", limiter);

const mount = (path, router) => {
  console.log("🔌 Mounting:", path);
  app.use(path, router);
  console.log("✅ Mounted:", path);
};

mount("/api/blogs", blogRoutes);
mount("/api/admin", adminRoutes);
mount("/api/users", userRoutes);
mount("/api/logs", logRoutes);
mount("/api/superadmin", superadminRoutes);
mount("/api/security", securityRoutes);
mount("/api/dashboard", dashboardRoutes);
mount("/api/comments", commentRoutes);
mount("/api/profile", profileRoutes);
mount("/api/noti", notificationRoutes);

app.get("/health", (_, res) => res.send("ok"));
app.get("/", (_, res) => res.send("GymAdvice API is running"));

app.use((req, res) => {
  return res.status(404).json({ success: false, message: "Not Found" });
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  try {
    createLog("server_Error", req.user?._id || null, err.message);
  } catch {}
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Boot
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server started on port ${PORT}`);
    });
  })
  .catch((e) => {
    logger.error("DB connect failed", { message: e.message });
    process.exit(1);
  });
