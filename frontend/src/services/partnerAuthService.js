import { PARTNER_TOKEN_KEY } from '../constants/config';
import { partnerApi } from './partnerApi';

/** Same `/auth/*` endpoints as customer app — separate token storage. */
export const partnerAuthService = {
  async sendOtp(email, purpose) {
    const { data } = await partnerApi.post('/auth/otp/send', {
      email: email.trim().toLowerCase(),
      purpose,
      role_hint: 'partner',
    });
    return data;
  },
  async signup(body) {
    const { data } = await partnerApi.post('/auth/partner/signup', body);
    return data;
  },
  async login(email, password, otpCode) {
    const payload = { email: email.trim().toLowerCase(), password };
    if (otpCode) payload.otp_code = otpCode.trim();
    const { data } = await partnerApi.post('/auth/login', payload);
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
  setToken(token) {
    if (token) localStorage.setItem(PARTNER_TOKEN_KEY, token);
    else localStorage.removeItem(PARTNER_TOKEN_KEY);
  },
  getToken() {
    return localStorage.getItem(PARTNER_TOKEN_KEY);
  },
};
