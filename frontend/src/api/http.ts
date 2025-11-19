import axios from 'axios';
import type { AuthResponse } from './auth';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as any;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post<AuthResponse>('/auth/login', {
          // In a real app we would use a refresh endpoint; for now, just propagate the error.
        });
        localStorage.setItem('authToken', data.token);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch {
        // fall through
      }
    }
    return Promise.reject(error);
  }
);

export default api;
