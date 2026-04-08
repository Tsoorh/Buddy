import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { AuthService } from './AuthService';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const HttpService: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: Attach Token
HttpService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = AuthService.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor: Handle 401 & Token Refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

HttpService.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return HttpService(originalRequest);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = AuthService.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refresh_token: refreshToken });
        
        AuthService.setToken(data.access_token);
        AuthService.setRefreshToken(data.refresh_token);
        
        HttpService.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        processQueue(null, data.access_token);
        return HttpService(originalRequest);
      } catch (err) {
        processQueue(err as AxiosError, null);
        AuthService.logoutEvent();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default HttpService;
