import { TOKEN_KEY } from '../constants/config';
import { createAuthSessionStorage } from '../lib/authSession';
import { api } from './api';

const TOKEN_EXPIRES_KEY = 'washgo_access_token_expires';
const session = createAuthSessionStorage(TOKEN_KEY, TOKEN_EXPIRES_KEY, TOKEN_KEY);

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
  saveSession(authResponse) {
    session.saveAuthResponse(authResponse);
  },
  setToken(token) {
    if (token) session.saveAuthResponse({ access_token: token });
    else session.clear();
  },
  getToken() {
    return session.getToken();
  },
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      /* still clear local session */
    }
    session.clear();
  },
  clearSession() {
    session.clear();
  },
  getSessionStorage() {
    return session;
  },
};
