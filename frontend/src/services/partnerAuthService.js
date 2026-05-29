import { PARTNER_TOKEN_KEY } from '../constants/config';
import { createAuthSessionStorage } from '../lib/authSession';
import { normalizeIndianPhoneDigits } from '../utils/validators';
import { partnerApi } from './partnerApi';

const PARTNER_TOKEN_EXPIRES_KEY = 'washgo_partner_token_expires';
const session = createAuthSessionStorage(
  PARTNER_TOKEN_KEY,
  PARTNER_TOKEN_EXPIRES_KEY,
  PARTNER_TOKEN_KEY,
);

export const partnerAuthService = {
  async sendOtp({ email, phone, purpose = 'login' }) {
    const body = { purpose, role_hint: 'partner' };
    if (email?.trim()) body.email = email.trim().toLowerCase();
    if (phone?.trim()) body.phone = normalizeIndianPhoneDigits(phone);
    const { data } = await partnerApi.post('/auth/otp/send', body);
    return data;
  },
  async login({ phone, password, otpCode }) {
    const payload = {
      phone: normalizeIndianPhoneDigits(phone),
      password,
    };
    if (otpCode) payload.otp_code = otpCode.trim();
    const { data } = await partnerApi.post('/auth/login', payload);
    return data;
  },
  async signup(payload) {
    const { data } = await partnerApi.post('/auth/partner/signup', {
      ...payload,
      email: payload.email.trim().toLowerCase(),
      phone: normalizeIndianPhoneDigits(payload.phone),
    });
    return data;
  },
  async resetPassword({ phone, otp_code, new_password }) {
    const { data } = await partnerApi.post('/auth/password/reset', {
      phone: normalizeIndianPhoneDigits(phone),
      otp_code: otp_code.trim(),
      new_password,
    });
    return data;
  },
  async me() {
    const { data } = await partnerApi.get('/auth/me');
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
      await partnerApi.post('/auth/logout');
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
