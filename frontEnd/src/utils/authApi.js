import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


const authApi = axios.create({
  baseURL: API,
  withCredentials: true,
});

export const refreshToken = () => authApi.post("/users/refresh-token", {});

export const logout = () => authApi.post("/users/logout", {});

export default authApi;