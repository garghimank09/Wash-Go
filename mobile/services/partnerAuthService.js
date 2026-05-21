import { partnerApiFetch } from './partnerApiClient';
import {
  clearPartnerSession,
  getPartnerToken,
  setPartnerSession,
} from '../lib/partnerSessionStore';

const PARTNER_ROLE = 'washer';

/**
 * Thin partner auth service. Talks to the same `/auth/*` endpoints as the
 * customer side but stores the session in the isolated partner store and
 * always validates that the returned user has role `washer`.
 */
export const partnerAuthService = {
  async getToken() {
    return getPartnerToken();
  },

  async me() {
    return partnerApiFetch('/auth/me', { auth: true });
  },

  async logout() {
    await clearPartnerSession();
  },

  /** Boot the partner app: validate token + role. Returns the user or null. */
  async bootstrap() {
    const token = await getPartnerToken();
    if (!token) return { user: null };

    try {
      const user = await partnerApiFetch('/auth/me', {
        auth: true,
        skipUnauthorized: true,
      });
      if (user?.role !== PARTNER_ROLE) {
        await clearPartnerSession();
        return { user: null };
      }
      await setPartnerSession(token, user);
      return { user };
    } catch {
      await clearPartnerSession();
      return { user: null };
    }
  },

  async login(email, password) {
    const data = await partnerApiFetch('/auth/login', {
      method: 'POST',
      body: {
        email: email.trim().toLowerCase(),
        password,
      },
      skipUnauthorized: true,
    });

    await setPartnerSession(data.access_token, null);

    try {
      const user = await partnerApiFetch('/auth/me', {
        auth: true,
        skipUnauthorized: true,
      });
      if (user.role !== PARTNER_ROLE) {
        await clearPartnerSession();
        throw new Error('This account is not a partner. Use customer login instead.');
      }
      await setPartnerSession(data.access_token, user);
      return { ...data, user };
    } catch (err) {
      await clearPartnerSession();
      throw err;
    }
  },

  async signup(payload) {
    const body = {
      full_name: payload.full_name,
      email: String(payload.email).trim().toLowerCase(),
      password: payload.password,
      phone: payload.phone?.trim() || null,
      service_area: payload.service_area?.trim() || null,
    };

    await partnerApiFetch('/auth/partner/signup', {
      method: 'POST',
      body,
      skipUnauthorized: true,
    });

    return this.login(body.email, body.password);
  },
};
