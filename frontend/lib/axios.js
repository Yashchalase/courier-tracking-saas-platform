import axios from "axios";

import { getAuthTokenFromStorage } from "@/lib/get-auth-token";
import { useAuthStore } from "@/store/auth";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      useAuthStore.getState().token ?? getAuthTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
