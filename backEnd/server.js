import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import blogRoutes from "./routes/blog.route.js";
import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import logRoutes from "./routes/log.route.js";
import superadminRoutes from "./routes/superadmin.route.js";
import securityRoutes from "./routes/security.route.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/security",securityRoutes)

app.listen(PORT, "::", () => {
  connectDB();
  console.log("Sever started at http://localhost:" + PORT);
});
