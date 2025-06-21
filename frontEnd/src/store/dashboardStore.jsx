import { create } from "zustand";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useDashboardStore = create((set) => ({
  stats: null,      // เก็บข้อมูลสถิติ เช่น users, admins, blogs, logs
  recentLogs: [],   // เก็บ logs ล่าสุด 10 รายการ
  loadingStats: false,
  loadingLogs: false,
  errorStats: null,
  errorLogs: null,

  // ดึงสถิติจาก backend /dashboard/stats
  fetchStats: async () => {
    set({ loadingStats: true, errorStats: null });
    try {
      const res = await axios.get(`${API}/dashboard/stats`);
      set({ stats: res.data.message, loadingStats: false });
    } catch (error) {
      set({ errorStats: error.response?.data?.message || "Failed to load stats", loadingStats: false });
    }
  },

  // ดึง logs ล่าสุดจาก backend /dashboard/recent-logs
  fetchRecentLogs: async () => {
    set({ loadingLogs: true, errorLogs: null });
    try {
      const res = await axios.get(`${API}/dashboard/recent-logs`);
      set({ recentLogs: res.data.data || [], loadingLogs: false });
    } catch (error) {
      set({ errorLogs: error.response?.data?.message || "Failed to load logs", loadingLogs: false });
    }
  },

  // เคลียร์ข้อมูล (ถ้าต้องการ logout หรือ reset state)
  clearDashboardData: () => set({ stats: null, recentLogs: [], errorStats: null, errorLogs: null }),
}));
