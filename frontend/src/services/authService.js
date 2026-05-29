import { TOKEN_KEY } from '../constants/config';
import { createAuthSessionStorage } from '../lib/authSession';
import { normalizeIndianPhoneDigits } from '../utils/validators';
import { api } from './api';

const TOKEN_EXPIRES_KEY = 'washgo_access_token_expires';
const session = createAuthSessionStorage(TOKEN_KEY, TOKEN_EXPIRES_KEY, TOKEN_KEY);

export const authService = {
  async sendOtp({ email, phone, purpose, roleHint = 'customer' }) {
    const body = { purpose, role_hint: roleHint };
    if (email?.trim()) body.email = email.trim().toLowerCase();
    if (phone?.trim()) body.phone = normalizeIndianPhoneDigits(phone);
    const { data } = await api.post('/auth/otp/send', body);
    return data;
  },
  async signup(body) {
    const { data } = await api.post('/auth/signup', {
      ...body,
      email: body.email.trim().toLowerCase(),
      phone: normalizeIndianPhoneDigits(body.phone),
    });
    return data;
  },
  async login({ phone, password, otpCode }) {
    const payload = {
      phone: normalizeIndianPhoneDigits(phone),
      password,
    };
    if (otpCode) payload.otp_code = otpCode.trim();
    const { data } = await api.post('/auth/login', payload);
    return data;
  },
  async resetPassword({ phone, otp_code, new_password }) {
    const { data } = await api.post('/auth/password/reset', {
      phone: normalizeIndianPhoneDigits(phone),
      otp_code: otp_code.trim(),
      new_password,
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
