import { create } from "zustand";
import axios from "../utils/axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useDashboardStore = create((set, get) => ({
  stats: null,
  recentLogs: [],
  blogsPerDay: [],
  loginsPerDay: [],
  logs: [],
  users: [],
  loadingStats: false,
  loadingLogs: false,
  loadingUsers: false,
  errorStats: null,
  errorLogs: null,
  errorUsers: null,
  hasMoreLogs: true,
  skip: 0,
  limit: 10,


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

  fetchChartStats: async () => {
    try {
      set({ isLoadingStats: true, errorStats: null });

      const [blogsRes, loginsRes] = await Promise.all([
        axios.get("/dashboard/blogs-per-day"),
        axios.get("/dashboard/logins-per-day"),
      ]);
      if (blogsRes.status === "fulfilled") {
        console.log(blogsRes.value.data);
      }
      if (loginsRes.status === "fulfilled") {
        console.log(loginsRes.value.data);
      }

      set({
        blogsPerDay: blogsRes.data.data,
        loginsPerDay: loginsRes.data.data,
        isLoadingStats: false,
      });
    } catch (err) {
      set({
        errorStats: err?.response?.data?.message || "Error loading stats",
        isLoadingStats: false,
      });
    }
  },

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

 
  updateUserRole: async (userId, role) => {
    try {
      await axios.put(`${API}/superadmin/update-role/${userId}`, { role });
      set((state) => ({
        users: state.users.map((u) => (u._id === userId ? { ...u, role } : u)),
      }));
    } catch (error) {
      console.error("Failed to update role", error);
    }
  },

  
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

  // // --- Revoke User ---
  // revokeUser: async (userId) => {
  //   try {
  //     await axios.post(`${API}/superadmin/revoke/${userId}`);
  //   } catch (error) {
  //     console.error("Failed to revoke user", error);
  //   }
  // },

  // --- Create Admin ---
  createAdmin: async (username, password) => {
    try {
      await axios.post(`${API}/superadmin/create-admin`, {
        username,
        password,
      });
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
