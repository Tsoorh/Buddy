import axios from 'axios';
import HttpService from './HttpService';

const TOKEN_KEY = 'spear_fresh_fish_auth_token';
const REFRESH_TOKEN_KEY = 'spear_fresh_fish_refresh_token';
const USER_KEY = 'spear_fresh_fish_user';

export const AuthService = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  setRefreshToken: (token: string) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setUser: (user: any) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
  logoutEvent: () => {
    // Dispatch a custom event to tell React context to log out
    const event = new Event('spear_fresh_fish_logout');
    window.dispatchEvent(event);
  },

  loginApi: async (data: any) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/login`, data);
    return response.data; // { access_token, refresh_token }
  },

  registerApi: async (data: any) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/register`, data);
    return response.data; // User ID
  },

  forgotPasswordApi: async (email: string) => {
    const response = await HttpService.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPasswordApi: async (data: any) => {
    const response = await HttpService.post('/auth/reset-password', data);
    return response.data;
  },
  
  getUserInfoApi: async () => {
    const response = await HttpService.get('/user/me');
    return response.data;
  }
};
