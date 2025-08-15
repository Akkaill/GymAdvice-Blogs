import { create } from "zustand";
import axios from "@/utils/axios";
import { useAuthStore } from "@/store/auth";


const stringId = (v) => (v?._id ? String(v._id) : String(v));

const normalizeFavoritedBy = (blog) => ({
  ...blog,
  favoritedBy: (blog.favoritedBy || []).map(stringId),
});

/*ดึง id ผู้ใช้ล่าสุด (string) */
const getUserId = () => {
  const u = useAuthStore.getState().user;
  return u ? String(u._id || u.id) : null;
};

export const useBlogStore = create((set, get) => ({
  blogs: [],
  topBlogs: [],
  favoriteBlogs: [],
  loading: false,
  hasMore: true,
  nextCursor: null,
  search: "",
  sortBy: "createdAt",
  order: "desc",

  //reset paging 
  resetBlogs: () => set({ blogs: [], nextCursor: null, hasMore: true }),

  setSearch: (newSearch) =>
    set({ search: newSearch, blogs: [], nextCursor: null, hasMore: true }),

  setSort: (sortBy, order = "desc") =>
    set({ sortBy, order, blogs: [], nextCursor: null, hasMore: true }),

 
  fetchPaginatedBlogs: async (cursor = null, limit = 6) => {
    const { search, sortBy, order } = get();
    set({ loading: true });
    try {
      const query = { limit, search, sortBy, order };
      if (cursor) query.cursor = cursor;

      const res = await axios.get("/blogs", {
        params: query,
        withCredentials: true,
      });
      const newBlogs = res.data.data.map(normalizeFavoritedBy);

      set((state) => {
        const mergedBlogs = cursor
          ? [
              ...state.blogs,
              ...newBlogs.filter(
                (newBlog) => !state.blogs.some((b) => b._id === newBlog._id)
              ),
            ]
          : newBlogs;

        return {
          blogs: mergedBlogs,
          hasMore: res.data.hasMore ?? false,
          nextCursor: res.data.nextCursor ?? null,
          loading: false,
        };
      });
    } catch (err) {
      console.error("Error fetching blogs:", err);
      set({ loading: false });
    }
  },

  updateFavoriteStateLocally: (id, favoritedByRaw) => {
    const userId = getUserId();
    const favoritedBy = (favoritedByRaw || []).map(String);

    set((state) => {
      // update in blogs
      const updatedBlogs = state.blogs.map((b) =>
        b._id === id ? { ...b, favoritedBy } : b
      );

   
      const src =
        updatedBlogs.find((b) => b._id === id) ||
        state.favoriteBlogs.find((b) => b._id === id) ||
        null;

      const isFav = userId ? favoritedBy.includes(userId) : false;
      let updatedFavorites = state.favoriteBlogs;

      if (isFav) {
        if (src) {
          const exists = state.favoriteBlogs.some((b) => b._id === id);
          updatedFavorites = exists
            ? state.favoriteBlogs.map((b) => (b._id === id ? src : b))
            : [...state.favoriteBlogs, src];
        }
      } else {
        updatedFavorites = state.favoriteBlogs.filter((b) => b._id !== id);
      }

      return { blogs: updatedBlogs, favoriteBlogs: updatedFavorites };
    });
  },


  toggleFavoriteBlog: async (id) => {
    const userId = getUserId();
    if (!userId) {
      console.warn("toggleFavoriteBlog: user not logged in");
      return { success: false, message: "Not logged in" };
    }

    // หา blog ล่าสุดในลิสต์
    const state = get();
    const blog =
      state.blogs.find((b) => b._id === id) ||
      state.favoriteBlogs.find((b) => b._id === id);
    if (!blog) {
      console.warn("toggleFavoriteBlog: blog not found in state", id);
      return { success: false, message: "Blog not found" };
    }

    const current = Array.isArray(blog.favoritedBy) ? blog.favoritedBy : [];
    const isFav = current.includes(userId);
    const optimistic = isFav
      ? current.filter((v) => v !== userId)
      : [...current, userId];

 
    get().updateFavoriteStateLocally(id, optimistic);

    try {
      const res = await axios.post(
        `/blogs/${id}/favorite`,
        {},
        { withCredentials: true }
      );
      const updatedBlog = normalizeFavoritedBy(res.data.data);
      get().updateFavoriteStateLocally(id, updatedBlog.favoritedBy);
      return { success: true };
    } catch (err) {
      console.error("Toggle Favorite Error:", err);
      get().updateFavoriteStateLocally(id, current);
      return {
        success: false,
        message: err?.response?.data?.message || "Favorite failed",
      };
    }
  },

  
  createBlog: async (newBlog) => {
    const { title, subtitle, description, image } = newBlog;
    if (!title || !subtitle || !description || !image) {
      return { success: false, message: "Please fill all fields" };
    }

    try {
      const res = await axios.post("/blogs", newBlog);
      set((state) => ({
        blogs: [...state.blogs, normalizeFavoritedBy(res.data.data)],
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
      const res = await axios.get("/blogs", { withCredentials: true });
      set({
        blogs: res.data.data.map(normalizeFavoritedBy),
      });
    } catch (err) {
      console.error("Error loading all blogs:", err);
    }
  },

  fetchBlogById: async (id) => {
    try {
      const res = await axios.get(`/blogs/${id}`, { withCredentials: true });
      return normalizeFavoritedBy(res.data.data);
    } catch (err) {
      console.error("Failed to fetch blog by ID:", err);
      return null;
    }
  },

  deleteBlog: async (id) => {
    try {
      const res = await axios.delete(`/blogs/${id}`);
      if (!res.data.success) {
        return { success: false, message: res.data.message };
      }
      set((state) => ({
        blogs: state.blogs.filter((blog) => blog._id !== id),
        favoriteBlogs: state.favoriteBlogs.filter((blog) => blog._id !== id),
      }));
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete blog.",
      };
    }
  },

  updateBlog: async (id, updatedFields) => {
    try {
      const res = await axios.put(`/blogs/${id}`, updatedFields, {
        withCredentials: true,
      });
      const updated = normalizeFavoritedBy(res.data.data);
      set((state) => ({
        blogs: state.blogs.map((b) => (b._id === id ? updated : b)),
        favoriteBlogs: state.favoriteBlogs.map((b) =>
          b._id === id ? updated : b
        ),
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Update failed",
      };
    }
  },

  fetchTopBlogs: async () => {
    try {
      const res = await axios.get(`/blogs/top`, { withCredentials: true });
      set({
        topBlogs: (res.data.blogs || []).map(normalizeFavoritedBy),
      });
    } catch (err) {
      console.error("Failed to load top blogs", err);
    }
  },

  fetchFavoriteBlogs: async () => {
    try {
      const res = await axios.get("/blogs/favorites-list", {
        withCredentials: true,
      });
      const favorites = res.data.data.map(normalizeFavoritedBy);
      set({ favoriteBlogs: favorites });
      console.log("📥 favoriteBlogs loaded:", favorites);
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  },
}));
