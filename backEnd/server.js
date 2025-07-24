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
import commentRoutes from './routes/comment.route.js';
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createLog } from "./utils/log.js";
import cors from "cors";
import cookieParser from "cookie-parser";



dotenv.config();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 100,
  message: "Too many requests from this IP, please try again later",
});
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use("/api/", limiter);

app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/comments', commentRoutes);
app.use("/api/noti", notificationRoutes);


app.use((err, req, res, next) => {
  console.log(err.stack);
  createLog("server_Error", req.user?._id || null, err.message);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

app.listen(PORT, "::", () => {
  connectDB();
  console.log("Sever started at http://localhost:" + PORT);
});
