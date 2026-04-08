import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { AuthService } from './AuthService';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const HttpService: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
HttpService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle 401s and token refreshing
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

HttpService.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return HttpService(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = AuthService.getRefreshToken();
        if (!refreshToken) {
            AuthService.logoutEvent();
            return Promise.reject(error);
        }

        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refresh_token: refreshToken });
        
        AuthService.setToken(data.access_token);
        AuthService.setRefreshToken(data.refresh_token);
        
        HttpService.defaults.headers.common['Authorization'] = 'Bearer ' + data.access_token;
        originalRequest.headers.Authorization = 'Bearer ' + data.access_token;
        
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
