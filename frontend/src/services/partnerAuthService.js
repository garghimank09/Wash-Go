import { PARTNER_TOKEN_KEY } from '../constants/config';
import { partnerApi } from './partnerApi';

/** Same `/auth/*` endpoints as customer app — separate token storage. */
export const partnerAuthService = {
  async signup(body) {
    const { data } = await partnerApi.post('/auth/partner/signup', body);
    return data;
  },
  async login(email, password) {
    const { data } = await partnerApi.post('/auth/login', { email, password });
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
