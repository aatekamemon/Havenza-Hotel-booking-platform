import axios from "axios";

const apiBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const adminApi = axios.create({
  baseURL: `${apiBase}/api/admin`,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminApi;


