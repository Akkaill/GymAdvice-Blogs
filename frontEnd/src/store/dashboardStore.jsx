import { create } from "zustand";
import axios from "../utils/axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useDashboardStore = create((set, get) => ({
  stats: null,
  recentLogs: [],
  users: [],
  loadingStats: false,
  loadingLogs: false,
  loadingUsers: false,
  errorStats: null,
  errorLogs: null,
  errorUsers: null,

  // --- ดึงสถิติ ---
  fetchStats: async () => {
    if (get().loadingStats) return;
    set({ loadingStats: true, errorStats: null });
    try {
      const res = await axios.get(`${API}/dashboard/stats`);
      set({ stats: res.data?.message || {}, loadingStats: false });
    } catch (error) {
      set({
        errorStats: error.response?.data?.message || "Failed to load stats",
        loadingStats: false,
      });
    }
  },

  // --- ดึง logs ล่าสุด ---
  fetchRecentLogs: async () => {
    if (get().loadingLogs) return;
    set({ loadingLogs: true, errorLogs: null });
    try {
      const res = await axios.get(`${API}/dashboard/recent-logs`);
      set({ recentLogs: res.data?.data || [], loadingLogs: false });
    } catch (error) {
      set({
        errorLogs: error.response?.data?.message || "Failed to load logs",
        loadingLogs: false,
      });
    }
  },

  // --- ดึง Users (เฉพาะ admin/superadmin) ---
  fetchUsers: async () => {
    if (get().loadingUsers) return;
    set({ loadingUsers: true, errorUsers: null });
    try {
      const res = await axios.get(`${API}/superadmin/get-users`);
      set({ users: res.data?.users || [], loadingUsers: false });
    } catch (error) {
      set({
        errorUsers: error.response?.data?.message || "Failed to load users",
        loadingUsers: false,
      });
    }
  },

  // --- Update Role ---
  updateUserRole: async (userId, role) => {
    try {
      await axios.put(`${API}/superadmin/update-role/${userId}`, { role });
      set((state) => ({
        users: state.users.map((u) =>
          u._id === userId ? { ...u, role } : u
        ),
      }));
    } catch (error) {
      console.error("Failed to update role", error);
    }
  },

  // --- Delete User ---
  deleteUser: async (userId) => {
    try {
      await axios.delete(`${API}/superadmin/delete-user/${userId}`);
      set((state) => ({
        users: state.users.filter((u) => u._id !== userId),
      }));
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  },

  // --- Revoke User ---
  revokeUser: async (userId) => {
    try {
      await axios.post(`${API}/superadmin/revoke/${userId}`);
    } catch (error) {
      console.error("Failed to revoke user", error);
    }
  },

  // --- Create Admin ---
  createAdmin: async (username, password) => {
    try {
      await axios.post(`${API}/superadmin/create-admin`, { username, password });
      // หลังสร้าง admin ให้ fetch users ใหม่
      await get().fetchUsers();
    } catch (error) {
      console.error("Failed to create admin", error);
    }
  },

  // --- Clear Dashboard Data ---
  clearDashboardData: () =>
    set({
      stats: null,
      recentLogs: [],
      users: [],
      errorStats: null,
      errorLogs: null,
      errorUsers: null,
    }),
}));
