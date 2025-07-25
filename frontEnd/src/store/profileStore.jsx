import {create} from "zustand";
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

  // อัปเดต username
  updateUsername: async (username) => {
    if (!username?.trim()) {
      set({ error: "Username cannot be empty" });
      return false;
    }
    set({ loading: true, error: null });
    try {
      const res = await axios.put(
        "/profile/username",
        { username: username.trim() },
        { withCredentials: true }
      );
      // อัปเดต user state ใหม่
      set((state) => ({
        user: { ...state.user, username: username.trim() },
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

  // ลบ avatar
  deleteAvatar: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.delete("/profile/avatar", { withCredentials: true });
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
