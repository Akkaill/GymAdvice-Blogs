import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    details: String,
  },
  { timestamps: true } // ✅ creates createdAt and updatedAt
);

const Log = mongoose.model("Log", logSchema);
export default Log;
