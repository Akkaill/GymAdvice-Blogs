import axios from "axios";
import { useAuthStore } from "@/store/auth";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const instance = axios.create({
  baseURL: API,
  withCredentials: true, 
});


instance.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const auth = useAuthStore.getState();

    // ถ้าไม่ได้ 401 หรือ request เคย retry แล้ว → ส่ง error ปกติ
    if (err.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(err);
    }

    // mark เพื่อกันวนลูป
    originalRequest._retry = true;

    // ถ้ามี refresh กำลังรัน -> เข้าคิว
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return instance(originalRequest);
        })
        .catch((queueErr) => Promise.reject(queueErr));
    }

    isRefreshing = true;
    try {
      const newToken = await auth.refreshToken();
      if (!newToken) throw new Error("Refresh failed");

      // ใส่ token ทั้ง instance + request
      instance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      return instance(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      await auth.logout(); // force logout
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default instance;
