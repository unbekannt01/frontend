// src/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh_token = localStorage.getItem('refresh_token');
        const res = await axios.post(
          'http://localhost:3000/auth/refresh-token',
          { refresh_token },
          { withCredentials: true }
        );
        localStorage.setItem('refresh_token', res.data.refresh_token);
        return api(originalRequest); // Retry original request
      } catch (e) {
        console.error("Refresh token failed", e);
        window.location.href = "/login"; // force logout
      }
    }
    return Promise.reject(error);
  }
);

export default api;
