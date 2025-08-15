import { create } from "zustand";
import axios from "../utils/axios";
import {
  refreshToken as refreshTokenApi,
  logout as logoutApi,
} from "../utils/authApi";

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
  users: [],
  searchUser: "",
  sortUserBy: "createdAt",
  sortUserOrder: "desc",
  loadingUsers: false,
  fetchUserPromise: null,
  refreshPromise: null,

  setSearchUser: (term) => set({ searchUser: term }),
  setSortUser: (sortBy, order) =>
    set({ sortUserBy: sortBy, sortUserOrder: order }),
  resetUsers: () => set({ users: [] }),
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchAllUsers: async () => {
    const { searchUser, sortUserBy, sortUserOrder } = get();
    set({ loadingUsers: true });
    try {
      const res = await axios.get(`${API}/users/all`, {
        params: {
          search: searchUser,
          sortBy: sortUserBy,
          order: sortUserOrder,
        },
        withCredentials: true,
      });
      set({
        users: Array.isArray(res.data?.data) ? res.data.data : [],
        loadingUsers: false,
      });
    } catch (err) {
      console.error(
        "❌ Failed to fetch users:",
        err?.response?.data || err.message
      );
      set({ loadingUsers: false });
    }
  },

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

  login: async (email, password, otp) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(
        `${API}/users/login`,
        { email, password, otp },
        { withCredentials: true }
      );

      if (res.requireVerification) {
        return {
          success: false, 
          requireVerification: true,
          message: res.data.message,
        };
      }

      if (!res.data.success) {
        return {
          success: false,
          message: res.data.message || "Email or password is invalid",
        };
      }

      const { accessToken, user } = res.data;
      if (accessToken && user) {
        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }
      localStorage.setItem("hasRefreshToken", "true");
      set({
        user,
        token: accessToken,
        isAuthenticated: true,
      });

      return { success: true, user };
    } catch (err) {
      if (err.response?.data?.requireVerification) {
        return {
          success: false,
          requireVerification: true,
          message: err.response?.data?.message,
        };
      }
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    } finally {
      set({ loading: false });
    }
  },

  fetchUser: async () => {
    const { fetchUserPromise } = get();
    if (fetchUserPromise) return fetchUserPromise;

    const p = (async () => {
      try {
        const res = await axios.get("/users/me", { withCredentials: true });
        const user = res?.data?.user || null;
        set({ user, isUserReady: true, isAuthenticated: !!user });
        return user;
      } catch (err) {
        console.error("Fetch user failed:", err?.response?.data || err.message);
        set({ isUserReady: true, isAuthenticated: false, user: null });
        return null;
      } finally {
        set({ fetchUserPromise: null });
      }
    })();

    set({ fetchUserPromise: p });
    return p;
  },

  refreshToken: async () => {
    const { refreshPromise } = get();
    try {
      if (refreshPromise) {
        const res = await refreshPromise;
        return res?.data?.accessToken || null;
      }

      const p = refreshTokenApi();
      set({ refreshPromise: p });

      const res = await p;
      set({ refreshPromise: null });

      if (!res.data?.success) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isUserReady: true,
          hasAttemptedAuth: true,
        });
        delete axios.defaults.headers.common.Authorization;
        return null;
      }

      const accessToken = res.data?.accessToken;
      if (accessToken) {
        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        set({
          token: accessToken,
          isAuthenticated: true,
          isUserReady: true,
          hasAttemptedAuth: true,
        });
        return accessToken;
      }

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isUserReady: true,
        hasAttemptedAuth: true,
      });
      delete axios.defaults.headers.common.Authorization;
      return null;
    } catch (err) {
      set({ refreshPromise: null });
      console.warn(
        "🟠 refreshToken failed:",
        err?.response?.data?.message || err.message
      );
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isUserReady: true,
        hasAttemptedAuth: true,
      });
      delete axios.defaults.headers.common.Authorization;
      return null;
    }
  },

  logout: async () => {
    try {
      await logoutApi();
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
