import { create } from "zustand";
import axios from "axios";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unseenCount: 0,
  loading: false,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("/api/noti");
      const data = res.data.data;
      set({
        notifications: data,
        unseenCount: data.filter(n => !n.read).length,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await axios.post(`/api/noti/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        );
        return {
          notifications: updated,
          unseenCount: updated.filter(n => !n.read).length,
        };
      });
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  }
}));
