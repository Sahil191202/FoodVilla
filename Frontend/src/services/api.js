import axios from "axios";
import { store } from "../app/store.js";
import { logout } from "../features/auth/authSlice.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Send cookies automatically!
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach token to every request
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token expiry globally
api.interceptors.response.use(
  (response) => response.data, // Return data directly — no response.data.data everywhere!
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried — try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data.data.accessToken;

        // Update token in Redux store
        store.dispatch({ type: "auth/updateToken", payload: newToken });

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — logout user
        store.dispatch(logout());
        window.location.href = "/login";
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;