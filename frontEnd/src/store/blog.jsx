import { create } from "zustand";

export const useBlogStore = create((set) => ({
  blogs: [],
  setBlog: (blogs) => set({ blogs }),

  createBlog: async (newBlog) => {
    if (
      !newBlog.title ||
      !newBlog.subtitle ||
      !newBlog.description ||
      !newBlog.image
    ) {
      return { success: false, message: "Please fill all fields" };
    }

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBlog),
      });

      const data = await res.json();

      set((state) => ({
        blogs: [...state.blogs, data.data],
      }));

      return { success: true, message: "Created successfully" };
    } catch (error) {
      return { success: false, message: "Something went wrong." };
    }
  },
}));
