// src/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to add authorization header
api.interceptors.request.use(
  (config) => {
    const access_token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];

    if (access_token) {
      config.headers['Authorization'] = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh_token = localStorage.getItem('refresh_token');
        const res = await axios.post(
          'http://localhost:3001/auth/refresh-token',
          { refresh_token },
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Set new tokens
        localStorage.setItem('refresh_token', res.data.refresh_token);
        document.cookie = `access_token=${res.data.access_token}; path=/; secure; samesite=lax`;
        
        // Update the original request's authorization header
        originalRequest.headers['Authorization'] = `Bearer ${res.data.access_token}`;
        
        return api(originalRequest);
      } catch (e) {
        console.error("Refresh token failed", e);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
