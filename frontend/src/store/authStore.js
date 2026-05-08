import { create } from 'zustand';
import api from '../utils/api.js';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('pos_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('pos_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Error al iniciar sesión', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('pos_token');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data });
    } catch {
      localStorage.removeItem('pos_token');
      set({ user: null, token: null });
    }
  }
}));

export default useAuthStore;
