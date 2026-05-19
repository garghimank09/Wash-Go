import { apiFetch } from './apiClient';
import {
  clearSession,
  getToken,
  getCachedUser,
  setSession,
  migrateLegacyToken,
} from '../lib/sessionStore';

const CUSTOMER_ROLE = 'customer';

export const authService = {
  async getToken() {
    return getToken();
  },

  async getUser() {
    const user = await apiFetch('/auth/me', { auth: true });
    const token = await getToken();
    if (token && user) {
      await setSession(token, user);
    }
    return user;
  },

  async logout() {
    await clearSession();
  },

  /** Validate stored token and return user, or null if unauthenticated. */
  async bootstrap() {
    await migrateLegacyToken();
    const token = await getToken();
    if (!token) {
      return { user: null };
    }

    try {
      const user = await apiFetch('/auth/me', { auth: true, skipUnauthorized: false });
      await setSession(token, user);
      return { user };
    } catch {
      await clearSession();
      return { user: null };
    }
  },

  async login(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: {
        email: email.trim().toLowerCase(),
        password,
      },
      skipUnauthorized: true,
    });

    await setSession(data.access_token, null);
    try {
      const user = await apiFetch('/auth/me', { auth: true, skipUnauthorized: true });
      await setSession(data.access_token, user);
      return { ...data, role: user.role, user };
    } catch (err) {
      await clearSession();
      throw err;
    }
  },

  async customerLogin(email, password) {
    const result = await this.login(email, password);
    const role = result.user?.role ?? result.role;
    if (role !== CUSTOMER_ROLE) {
      await this.logout();
      throw new Error(
        'This account is not a customer account. Partner sign-in is coming soon.'
      );
    }
    return result;
  },

  async partnerLogin(email, password) {
    const result = await this.login(email, password);
    const role = result.user?.role ?? result.role;
    if (role !== 'washer' && role !== 'admin') {
      await this.logout();
      throw new Error('This account is not a partner. Use customer login instead.');
    }
    return result;
  },

  async signup(fullNameOrPayload, email, password, phone) {
    const payload =
      typeof fullNameOrPayload === 'object' && fullNameOrPayload !== null
        ? fullNameOrPayload
        : {
            full_name: fullNameOrPayload,
            email: email?.trim().toLowerCase(),
            password,
            phone: phone?.trim() || null,
          };

    await apiFetch('/auth/signup', {
      method: 'POST',
      body: {
        full_name: payload.full_name,
        email: String(payload.email).trim().toLowerCase(),
        password: payload.password,
        phone: payload.phone || null,
      },
      skipUnauthorized: true,
    });

    return this.customerLogin(payload.email, payload.password);
  },

  async partnerSignup(fullNameOrPayload, email, password, phone, serviceArea) {
    const payload =
      typeof fullNameOrPayload === 'object' && fullNameOrPayload !== null
        ? fullNameOrPayload
        : {
            full_name: fullNameOrPayload,
            email: email?.trim().toLowerCase(),
            password,
            phone: phone?.trim() || null,
            service_area: serviceArea?.trim() || null,
          };

    await apiFetch('/auth/partner/signup', {
      method: 'POST',
      body: {
        full_name: payload.full_name,
        email: String(payload.email).trim().toLowerCase(),
        password: payload.password,
        phone: payload.phone || null,
        service_area: payload.service_area || null,
      },
      skipUnauthorized: true,
    });

    return this.partnerLogin(payload.email, payload.password);
  },

  getCachedUser,
};
