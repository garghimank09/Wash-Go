import { PARTNER_TOKEN_KEY } from '../constants/config';
import { createAuthSessionStorage } from '../lib/authSession';
import { partnerApi } from './partnerApi';

const PARTNER_TOKEN_EXPIRES_KEY = 'washgo_partner_token_expires';
const session = createAuthSessionStorage(
  PARTNER_TOKEN_KEY,
  PARTNER_TOKEN_EXPIRES_KEY,
  PARTNER_TOKEN_KEY,
);

/** Same `/auth/*` endpoints as customer app — separate token storage. */
export const partnerAuthService = {
  async sendOtp(email, purpose = 'login') {
    const { data } = await partnerApi.post('/auth/otp/send', {
      email: email.trim().toLowerCase(),
      purpose,
      role_hint: 'partner',
    });
    return data;
  },
  async login(email, password, otpCode) {
    const payload = { email: email.trim().toLowerCase(), password };
    if (otpCode) payload.otp_code = otpCode.trim();
    const { data } = await partnerApi.post('/auth/login', payload);
    return data;
  },
  async signup(payload) {
    const { data } = await partnerApi.post('/auth/partner/signup', payload);
    return data;
  },
  async resetPassword(body) {
    const { data } = await partnerApi.post('/auth/password/reset', {
      email: body.email.trim().toLowerCase(),
      otp_code: body.otp_code.trim(),
      new_password: body.new_password,
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
