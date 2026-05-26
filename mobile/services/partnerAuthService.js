import { partnerApiFetch } from './partnerApiClient';
import {
  clearPartnerSession,
  getPartnerToken,
  setPartnerSession,
} from '../lib/partnerSessionStore';

const PARTNER_ROLE = 'washer';

/**
 * Partner auth — same `/auth/*` endpoints as web, isolated token store.
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

  async sendOtp(email, purpose) {
    return partnerApiFetch('/auth/otp/send', {
      method: 'POST',
      body: {
        email: email.trim().toLowerCase(),
        purpose,
        role_hint: 'partner',
      },
      skipUnauthorized: true,
    });
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

  async login(email, password, otpCode) {
    const body = {
      email: email.trim().toLowerCase(),
      password,
    };
    if (otpCode) body.otp_code = otpCode.trim();

    const data = await partnerApiFetch('/auth/login', {
      method: 'POST',
      body,
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
    if (payload.otp_code) body.otp_code = payload.otp_code.trim();

    const data = await partnerApiFetch('/auth/partner/signup', {
      method: 'POST',
      body,
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
        throw new Error('Partner account could not be activated.');
      }
      await setPartnerSession(data.access_token, user);
      return { ...data, user };
    } catch (err) {
      await clearPartnerSession();
      throw err;
    }
  },
};
