import { TOKEN_KEY } from '../constants/config';
import { api } from './api';

export const authService = {
  async signup(body) {
    const { data } = await api.post('/auth/signup', body);
    return data;
  },
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  },
  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
};
