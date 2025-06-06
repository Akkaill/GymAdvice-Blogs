import { create } from "zustand";

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
    console.log("💾 setSort called with:", sortBy, order);
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
    console.log(
      "FETCHING blogs with sortBy:",
      get().sortBy,
      "order:",
      get().order
    );
    console.log("🔥 FETCHING blogs with:", { search, sortBy, order, cursor });
    set({ loading: true });

    try {
      const query = new URLSearchParams({
        limit: String(limit),
        search,
        sortBy,
        order,
      });
      if (cursor) query.append("cursor", cursor);

      const res = await fetch(`/api/blogs?${query.toString()}`);

      // เช็กว่า API ตอบ 2xx หรือไม่
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error: ${res.status} - ${errorText}`);
      }
      const result = await res.json();
      // ป้องกัน result.data ไม่เป็น array
      if (!Array.isArray(result.data)) {
        console.error("❌ Invalid data format from API:", result.data);
        throw new Error("Invalid data format from API: data is not an array");
      }

      set((state) => ({
        blogs: cursor ? [...state.blogs, ...result.data] : result.data,
        loading: false,
        hasMore: result.hasMore ?? false,
        nextCursor: result.nextCursor ?? null,
      }));
    } catch (error) {
      console.error("Error fetching blogs:", error);
      set({ loading: false });
      throw error;
    }
  },
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
  fetchBlogs: async () => {
    const res = await fetch("/api/blogs");
    const data = await res.json();
    set({ blogs: data.data });
  },
  fetchBlogById: async (id) => {
    try {
      const res = await fetch(`/api/blogs/${id}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    } catch (error) {
      console.error("Failed to fetch blog by ID:", error);
      return null;
    }
  },

  deleteBlog: async (id) => {
    const res = await fetch(`/api/blogs/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };

    //update ui immediatly without needing a refresh
    set((state) => ({ blogs: state.blogs.filter((blog) => blog._id !== id) }));
    return { success: true, message: data.message };
  },
}));
