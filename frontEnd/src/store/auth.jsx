import { create } from "zustand";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Register
  register: async ({ email, password, phone, username }) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API}/users/pre-register`, {
        email,
        password,
        phone,
        username,
      });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Registration failed" });
    } finally {
      set({ loading: false });
    }
  },

  verifyRegister: async ({ otp, email, phone }) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API}/users/verify-register`, {
        otp,
        email,
        phone,
      });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "OTP verification failed" });
    } finally {
      set({ loading: false });
    }
  },

  // Login
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(
        `${API}/users/login`,
        { email, password },
        { withCredentials: true }
      );
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      set({ user, token });
      return { success: true };
    } catch (err) {
      set({
        error: err.response?.data?.message || "Login failed",
      });
      return {
        success: false,
        requireVerification: err.response?.data?.requireVerification,
        email: err.response?.data?.email,
        phone: err.response?.data?.phone,
      };
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  logout: async () => {
    try {
      await axios.post(
        `${API}/users/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${get().token}` },
        }
      );
    } catch (err) {
      console.log("Logout error:", err.message);
    } finally {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      set({ user: null, token: null });
    }
  },

  // Get Logged In User
  getUser: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${get().token}` },
      });
      set({ user: res.data.user });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to get user" });
    } finally {
      set({ loading: false });
    }
  },

  // Update Password
  updatePassword: async (userId, username, password) => {
    set({ loading: true });
    try {
      const res = await axios.put(
        `${API}/users/update-password/${userId}`,
        { username, password },
        {
          headers: { Authorization: `Bearer ${get().token}` },
        }
      );
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Password update failed" });
    } finally {
      set({ loading: false });
    }
  },

  // Resend OTP
  resendOTP: async (userId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API}/users/resend-otp`, { userId });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to resend OTP",
      });
      return { success: false };
    } finally {
      set({ loading: false });
    }
  },


checkDuplicate: async (payload) => {
  try {
    const res = await axios.post(`${API}/users/check-duplicate`, payload);
    return {
      exists: res.data.exists,
      field: res.data.field,
      type: Object.keys(payload)[0], // ระบุว่าเรากำลังเช็ค field ไหน
    };
  } catch (err) {
    console.error("Check duplicate failed", err);
    return { exists: false };
  }
},


}));
