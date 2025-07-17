import axios from "axios";
import { useAuthStore } from "@/store/auth";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const instance = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Refresh Token Interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const auth = useAuthStore.getState();

    if (err.response?.status === 401 && !originalRequest._retry && auth.token) {
      const { isAuthenticated } = auth;
      if (!isAuthenticated) {
        return Promise.reject(err); // skip if already logged out
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const newToken = await auth.refreshToken();
        if (!newToken) throw new Error("Refresh failed");

        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return instance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await auth.logout(true); // ✅ Force logout
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default instance;
