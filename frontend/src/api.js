import axios from "axios";
import toast from "react-hot-toast";

/**
 * Centralized Axios instance — Task 1.9
 * - Base URL from environment variable
 * - Auto-injects Authorization + id headers from localStorage
 * - Handles 401/403 token expiry globally
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Crucial for sending httpOnly cookies
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const { status } = error.response;

      // Token expired — try to refresh silently
      if ((status === 401 || status === 403) && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt refresh
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/v1/refresh`,
            {},
            { withCredentials: true }
          );

          // Success - set new token
          localStorage.setItem("token", res.data.token);
          
          // Retry original request with new token
          originalRequest.headers["authorization"] = `Bearer ${res.data.token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clean logout
          localStorage.clear();
          const isAuthPage =
            window.location.pathname.includes("/LogIn") ||
            window.location.pathname.includes("/SignUp");

          if (!isAuthPage) {
            toast.error("Session expired. Please sign in again.");
            setTimeout(() => {
              window.location.href = "/LogIn";
            }, 1500);
          }
          return Promise.reject(refreshError);
        }
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default api;
