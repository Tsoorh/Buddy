import axios from 'axios';
import HttpService from './HttpService';
import type { User } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const KEYS = {
  TOKEN: 'spear_fresh_fish_auth_token',
  REFRESH: 'spear_fresh_fish_refresh_token',
  USER: 'spear_fresh_fish_user',
  GUEST: 'spear_fresh_fish_guest'
};

export const AuthService = {
  // Storage Helpers
  setToken: (token: string) => localStorage.setItem(KEYS.TOKEN, token),
  getToken: () => localStorage.getItem(KEYS.TOKEN),
  setRefreshToken: (token: string) => localStorage.setItem(KEYS.REFRESH, token),
  getRefreshToken: () => localStorage.getItem(KEYS.REFRESH),
  setUser: (user: User) => localStorage.setItem(KEYS.USER, JSON.stringify(user)),
  getUser: (): User | null => {
    const user = localStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  },
  
  logout: () => Object.values(KEYS).forEach(key => localStorage.removeItem(key)),
  
  isAuthenticated: () => !!localStorage.getItem(KEYS.TOKEN),
  
  logoutEvent: () => window.dispatchEvent(new Event('spear_fresh_fish_logout')),

  // API Calls
  loginApi: async (data: Record<string, string>) => {
    const res = await axios.post(`${API_URL}/auth/login`, data);
    return res.data; // { access_token, refresh_token }
  },

  registerApi: async (data: Record<string, string>) => {
    const res = await axios.post(`${API_URL}/auth/register`, data);
    return res.data;
  },

  forgotPasswordApi: async (email: string) => {
    const res = await HttpService.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPasswordApi: async (data: Record<string, string>) => {
    const res = await HttpService.post('/auth/reset-password', data);
    return res.data;
  },
  
  getUserInfoApi: async (): Promise<User> => {
    const res = await HttpService.get('/user/me');
    return res.data;
  }
};
