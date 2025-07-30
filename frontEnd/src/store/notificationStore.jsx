import { create } from "zustand";
import axios from "../utils/axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unseenCount: 0,
  loading: false,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const res = await axios.get(`${API}/noti`, {
        withCredentials: true,
      });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      set({
        notifications: data,
        unseenCount: data.filter((n) => !n.read).length,
        loading: false,
      });
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err?.response?.data || err.message);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await axios.post(`${API}/noti/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        );
        return {
          notifications: updated,
          unseenCount: updated.filter((n) => !n.read).length,
        };
      });
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  },
}));
