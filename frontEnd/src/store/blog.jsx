import { create } from "zustand";
import axios from "axios";

export const useBlogStore = create((set, get) => ({
  blogs: [],
  loading: false,
  hasMore: true,
  nextCursor: null,
  search: "",
  sortBy: "createdAt",
  order: "desc",

  resetBlogs: () => set({ blogs: [], nextCursor: null, hasMore: true }),

  setSearch: (newSearch) => {
    set({
      search: newSearch,
      blogs: [],
      nextCursor: null,
      hasMore: true,
    });
  },

  setSort: (sortBy, order = "desc") => {
    set({
      sortBy,
      order,
      blogs: [],
      nextCursor: null,
      hasMore: true,
    });
  },

  fetchPaginatedBlogs: async (cursor = null, limit = 6) => {
    const { search, sortBy, order } = get();
    set({ loading: true });

    try {
      const query = {
        limit,
        search,
        sortBy,
        order,
      };
      if (cursor) query.cursor = cursor;

      const res = await axios.get("/api/blogs", { params: query });
      // ป้องกัน result.data ไม่เป็น array
      if (!Array.isArray(res.data.data)) {
        throw new Error("Invalid data format: blogs must be array");
      }

      set((state) => ({
        blogs: cursor ? [...state.blogs, ...res.data.data] : res.data.data,
        loading: false,
        hasMore: res.data.hasMore ?? false,
        nextCursor: res.data.nextCursor ?? null,
      }));
    } catch (err) {
      console.error("Error fetching blogs:", err);
      set({ loading: false });
      throw err;
    }
  },

  createBlog: async (newBlog) => {
    const { title, subtitle, description, image } = newBlog;
    if (!title || !subtitle || !description || !image) {
      return { success: false, message: "Please fill all fields" };
    }

    try {
      const res = await axios.post("/api/blogs", newBlog);

      set((state) => ({
        blogs: [...state.blogs, res.data.data],
      }));

      return { success: true, message: "Created successfully" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Something went wrong.",
      };
    }
  },

  fetchBlogs: async () => {
    try {
      const res = await axios.get("/api/blogs");
      set({ blogs: res.data.data });
    } catch (err) {
      console.error("Error loading all blogs:", err);
    }
  },

  fetchBlogById: async (id) => {
    try {
      const res = await axios.get(`/api/blogs/${id}`);
      return res.data.data;
    } catch (err) {
      console.error("Failed to fetch blog by ID:", err);
      return null;
    }
  },

  deleteBlog: async (id) => {
    try {
      const res = await axios.delete(`/api/blogs/${id}`);
      if (!res.data.success) return { success: false, message: res.data.message };

      set((state) => ({
        blogs: state.blogs.filter((blog) => blog._id !== id),
      }));

      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete blog.",
      };
    }
  },
}));
