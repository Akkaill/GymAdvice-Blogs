import { create } from "zustand";
import axios from "../utils/axios"; //ใช้ instance ที่มี Interceptor

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  isUserReady: false,
  isAuthenticated: !!localStorage.getItem("token"),

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Register (2 ขั้นตอน)
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

      const { accessToken, user } = res.data;

      localStorage.setItem("token", accessToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      set({ user, token: accessToken });

      return { success: true };
    } catch (err) {
      set({ error: err.response?.data?.message || "Login failed" });
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

  // Fetch User + Auto Refresh if needed

  fetchUser: async () => {
    try {
      const res = await axios.get("/users/me", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${get().token}`,
        },
      });

      set({ user: res.data.user, isUserReady: true, isAuthenticated: true });
      return res.data.user;
    } catch (err) {
      console.error(
        "❌ Fetch user failed:",
        err.response?.data?.message || err.message
      );
      // ถ้า token หมดอายุ → ลอง refresh token
      const newToken = await get().refreshToken();
      if (newToken) return await get().fetchUser();
      set({ isUserReady: true, isAuthenticated: false });
      return null;
    }
  },

  // Refresh Token
  refreshToken: async () => {
    try {
      const res = await axios.post(
        `${API}/users/refresh-token`,
        {},
        { withCredentials: true }
      );
      const accessToken = res.data.accessToken;
      if (accessToken) {
        get().setToken(accessToken);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        return accessToken;
      }
      return null;
    } catch (err) {
      console.error("Refresh Token Failed:", err.message);
      return null;
    }
  },

  // Logout
  logout: async () => {
  try {
    await axios.post(`${API}/users/logout`, {}, { withCredentials: true });
  } catch (err) {
    if (err.response?.status !== 401) {
      console.warn("Logout API error:", err.message);
    }
  } finally {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    set({ user: null, token: null });
  }
}
,

  // Update Password
  updatePassword: async (userId, username, password) => {
    set({ loading: true });
    try {
      const res = await axios.put(
        `${API}/users/update-password/${userId}`,
        { username, password },
        { headers: { Authorization: `Bearer ${get().token}` } }
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
      set({ error: err.response?.data?.message || "Failed to resend OTP" });
      return { success: false };
    } finally {
      set({ loading: false });
    }
  },

  // Check Duplicate (email, username, phone)
  checkDuplicate: async (payload) => {
    try {
      const res = await axios.post(`${API}/users/check-duplicate`, payload);
      return {
        exists: res.data.exists,
        field: res.data.field,
        type: Object.keys(payload)[0],
      };
    } catch (err) {
      console.error("Check duplicate failed", err);
      return { exists: false };
    }
  },

  // Set Token (ใช้งานได้เวลา refresh หรือหลัง login)
  setToken: (token) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    set({ token, isAuthenticated: true });
  },

  setAccessToken: (token) => set({ accessToken: token }),
}));
