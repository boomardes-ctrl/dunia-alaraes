import { create } from 'zustand';
import { api } from '../lib/api';

interface AdminStore {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  init: () => void;
}

const storedToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

export const useAdminStore = create<AdminStore>((set) => ({
  token: storedToken,
  isAuthenticated: !!storedToken,
  login: async (_username: string, password: string) => {
    const res = await api.login('', password);
    localStorage.setItem('admin_token', res.token);
    set({ token: res.token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('admin_token');
    set({ token: null, isAuthenticated: false });
  },
  init: () => {
    const token = localStorage.getItem('admin_token');
    set({ token, isAuthenticated: !!token });
  },
}));
