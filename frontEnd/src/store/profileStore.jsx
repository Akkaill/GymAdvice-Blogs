import { create } from "zustand";
import axios from "../utils/axios";

export const useProfileStore = create((set, get) => ({
  user: null,
  blogs: [],
  loading: false,
  error: null,

  // โหลดข้อมูล profile (user + blogs)
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/profile", { withCredentials: true });
      set({
        user: res.data.user || null,
        blogs: res.data.blogs || [],
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },
 fetchProfileById : async (userId) => {
  try {
    setLoading(true);
    const res = await axios.get(`/users/${userId}`);
    setUser(res.data);
    await fetchUserBlogs(userId);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
},


  updateUserInfo: async ({ username, instagram }) => {
    if ((!username || !username.trim()) && (!instagram || !instagram.trim())) {
      set({ error: "Please provide at least one field to update" });
      return false;
    }
    set({ loading: true, error: null });
    try {
      const payload = {};
      if (username && username.trim()) payload.username = username.trim();
      if (instagram && instagram.trim()) payload.instagram = instagram.trim();

      const res = await axios.put("/profile/update-info", payload, {
        withCredentials: true,
      });

      // อัปเดต user state ใหม่ด้วยข้อมูลที่ได้จาก response หรือที่ส่งไป
      set((state) => ({
        user: {
          ...state.user,
          ...payload,
        },
        loading: false,
      }));

      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
      return false;
    }
  },

  // อัปโหลด avatar
  uploadAvatar: async (file) => {
    if (!file) {
      set({ error: "No file provided" });
      return false;
    }
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await axios.put("/profile/avatar", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      // โหลดข้อมูล user ใหม่ (avatar update)
      await get().fetchProfile();
      set({ loading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
      return false;
    }
  },

  updateBlog: async (id, updatedFields) => {
    try {
      const res = await axios.put(`/blogs/${id}`, updatedFields, {
        withCredentials: true,
      });
      const updated = res.data.data;
      set((state) => ({
        blogs: state.blogs.map((b) => (b._id === id ? updated : b)),
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Update failed",
      };
    }
  },

  // ลบ avatar
  deleteAvatar: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.delete("/profile/avatar", {
        withCredentials: true,
      });
      await get().fetchProfile();
      set({ loading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
