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

  async sendOtp(email, purpose, roleHint = 'customer') {
    return apiFetch('/auth/otp/send', {
      method: 'POST',
      body: {
        email: email.trim().toLowerCase(),
        purpose,
        role_hint: roleHint,
      },
      skipUnauthorized: true,
    });
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

  async login(email, password, otpCode) {
    const body = {
      email: email.trim().toLowerCase(),
      password,
    };
    if (otpCode) body.otp_code = otpCode.trim();

    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body,
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

  async customerLogin(email, password, otpCode) {
    const result = await this.login(email, password, otpCode);
    const role = result.user?.role ?? result.role;
    if (role !== CUSTOMER_ROLE) {
      await this.logout();
      throw new Error(
        'This account is not a customer account. Use partner sign-in for washer accounts.'
      );
    }
    return result;
  },

  async signup(payload) {
    const body = {
      full_name: payload.full_name,
      email: String(payload.email).trim().toLowerCase(),
      password: payload.password,
      phone: payload.phone?.trim() || null,
    };
    if (payload.otp_code) body.otp_code = payload.otp_code.trim();

    const data = await apiFetch('/auth/signup', {
      method: 'POST',
      body,
      skipUnauthorized: true,
    });

    await setSession(data.access_token, null);
    try {
      const user = await apiFetch('/auth/me', { auth: true, skipUnauthorized: true });
      if (user.role !== CUSTOMER_ROLE) {
        await clearSession();
        throw new Error('Account created with an unexpected role.');
      }
      await setSession(data.access_token, user);
      return { ...data, user };
    } catch (err) {
      await clearSession();
      throw err;
    }
  },

  getCachedUser,
};
