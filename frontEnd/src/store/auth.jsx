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

  // ✅ Register
  register: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API}/users/register`, {
        username,
        password,
      });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Registration failed" });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Login
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API}/users/login`, credentials,{ withCredentials: true});
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      set({ user, token });
      return { success: true };
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          "Login failed",
      });
      return { success: false, requireVerification: err.response?.data?.requireVerification, email: err.response?.data?.email, phone: err.response?.data?.phone };
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Logout
  logout: async () => {
    try {
      await axios.post(`${API}/users/logout`, {}, {
        headers: { Authorization: `Bearer ${get().token}` },
      });
    } catch (err) {
      console.log("Logout error:", err.message);
    } finally {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      set({ user: null, token: null });
    }
  },

  // ✅ Get Logged In User
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

  // ✅ Update Password
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

  // ✅ Resend OTP
  resendOTP: async (userId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API}/users/resend-otp`, { userId });
      return res.data;
    } catch (err) {
      set({
        error:
          err.response?.data?.message || "Failed to resend OTP",
      });
      return { success: false };
    } finally {
      set({ loading: false });
    }
  },
}));
