import axios from "axios";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const instance = axios.create({
  baseURL: API,
  withCredentials: true,
});

instance.interceptors.request.use(
  async (config) => {
    const { useAuthStore } = await import("@/store/auth");
    const { token } = useAuthStore.getState();

    if (token && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.url?.includes("/users/me")) {
      console.debug(
        "[REQ /me] Authorization:",
        config.headers?.Authorization ? "present" : "missing"
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === Single-flight refresh ===
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

    // ไม่ retry/refresh หากเป็น 429 (ป้องกัน retry storm)
    if (err?.response?.status === 429 && !originalRequest._retried429) {
      originalRequest._retried429 = true;
      const header = err.response.headers?.["retry-after"];
      const waitSec = Number(header) || 1; // default 1s ถ้าไม่มี header
      await new Promise((r) => setTimeout(r, waitSec * 1000));
      return instance(originalRequest);
    }

    // ไม่ยุ่งกับ /refresh-token เอง
    if (originalRequest?.url?.includes("/users/refresh-token")) {
      return Promise.reject(err);
    }

  

    // เฉพาะ 401 และยังไม่เคย retry เท่านั้น
    if (err.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(err);
    }
    originalRequest._retry = true;

    // ถ้า refresh กำลังทำ → เข้าคิวรอ
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
      // เรียก refresh จาก store ที่คุณมีอยู่แล้ว (จะยิง axios ตัว authApi)
      const { useAuthStore } = await import("@/store/auth");
      const auth = useAuthStore.getState();
      const newToken = await auth.refreshToken();
      if (!newToken) throw new Error("Refresh failed");

      // ใส่ token กลับเข้า instance + request ที่ค้างไว้
      instance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);
      return instance(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      try {
        const { useAuthStore } = await import("@/store/auth");
        await useAuthStore.getState().logout();
      } catch {}
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default instance;
