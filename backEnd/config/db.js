import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./logger.js";


dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    logger.info("MongoDB connected", { host: conn.connection.host });
  } catch (err) {
    logger.error("MongoDB connection error", { message: err.message });
    process.exit(1); 
  }
};
