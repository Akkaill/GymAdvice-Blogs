import { create } from "zustand";
import axios from "../utils/axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  isUserReady: false,
  isAuthenticated: false,
  isLoggingOut: false,
  hasAttemptedAuth: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

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
      return { success: false };
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
      return { success: false };
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(
        `${API}/users/login`,
        { email, password },
        { withCredentials: true }
      );

      const { accessToken, user } = res.data;

      if (accessToken) {
        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }
 localStorage.setItem("hasRefreshToken", "true");
      set({
        user,
        token: accessToken,
        isAuthenticated: true,
      });

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

  fetchUser: async () => {
    try {
      const res = await axios.get("/users/me", { withCredentials: true });
      const user = res.data?.user || null;
      set({
        user,
        isUserReady: true,
        isAuthenticated: !!user,
      });
      return user;
    } catch (err) {
      console.error(
        "Fetch user failed:",
        err.response?.data?.message || err.message
      );
      // ไม่เรียก refreshToken อีก → axios interceptor จะดูแลให้
      set({ isUserReady: true, isAuthenticated: false, user: null });
      return null;
    }
  },

  refreshToken: async () => {
  try {
    const res = await axios.post(
      `${API}/users/refresh-token`,
      {},
      { withCredentials: true }
    );

    const accessToken = res.data?.accessToken;

    if (accessToken) {
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      set({ token: accessToken, isAuthenticated: true });
      return accessToken;
    }

    // ⚠️ ไม่มี accessToken แปลว่า refresh ไม่สำเร็จ
    set({ user: null, token: null, isAuthenticated: false });
    delete axios.defaults.headers.common.Authorization;
    return null;

  } catch (err) {
    // 🧠 แบบ soft-fail: ไม่ได้ถือว่า error รุนแรง ถ้ายังไม่มี jid
    console.warn("🟠 refreshToken failed (may be no jid):", err.response?.data?.message || err.message);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isUserReady: true, // สำคัญมาก! เพื่อให้หน้าหยุดหมุน
      hasAttemptedAuth: true,
    });
    delete axios.defaults.headers.common.Authorization;
    return null;
  }
},

  logout: async () => {
    try {
      await axios.post(`${API}/users/logout`, {}, { withCredentials: true });
      localStorage.removeItem("hasRefreshToken");
    } catch (err) {
      console.warn("Logout API error:", err.message);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isUserReady: true,
      });
      delete axios.defaults.headers.common.Authorization;
    }
  },

  updatePassword: async (userId, username, password) => {
    set({ loading: true });
    try {
      const res = await axios.put(`${API}/users/update-password/${userId}`, {
        username,
        password,
      });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Password update failed" });
      return { success: false };
    } finally {
      set({ loading: false });
    }
  },

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

  // ตรวจซ้ำ (email, username, phone)

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

  setToken: (token) => {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    set({ token, isAuthenticated: true });
  },

  setAccessToken: (token) =>
    set({
      token,
      isAuthenticated: !!token,
    }),
}));
