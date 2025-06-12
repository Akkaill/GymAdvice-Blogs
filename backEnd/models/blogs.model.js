import mongoose from "mongoose";

const blogsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model("Blog", blogsSchema);

export default Blog;
