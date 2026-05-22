import { TOKEN_KEY } from '../constants/config';
import { api } from './api';

export const authService = {
  async sendOtp(email, purpose, roleHint = 'customer') {
    const { data } = await api.post('/auth/otp/send', {
      email: email.trim().toLowerCase(),
      purpose,
      role_hint: roleHint,
    });
    return data;
  },
  async signup(body) {
    const { data } = await api.post('/auth/signup', body);
    return data;
  },
  async login(email, password, otpCode) {
    const payload = { email: email.trim().toLowerCase(), password };
    if (otpCode) payload.otp_code = otpCode.trim();
    const { data } = await api.post('/auth/login', payload);
    return data;
  },
  async resetPassword(body) {
    const { data } = await api.post('/auth/password/reset', {
      email: body.email.trim().toLowerCase(),
      otp_code: body.otp_code.trim(),
      new_password: body.new_password,
    });
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
