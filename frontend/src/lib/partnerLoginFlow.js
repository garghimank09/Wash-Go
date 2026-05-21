import { authService } from '../services/authService';
import { partnerAuthService } from '../services/partnerAuthService';

/**
 * Partner portal login: washers use partner token; admins use customer token + /admin.
 * @returns {{ kind: 'admin' | 'washer', user: object }}
 */
export async function loginViaPartnerPortal(email, password) {
  const data = await authService.login(email.trim(), password);
  authService.setToken(data.access_token);
  const me = await authService.me();

  if (me.role === 'admin') {
    authService.setToken(data.access_token);
    partnerAuthService.setToken(null);
    return { kind: 'admin', user: me };
  }

  if (me.role === 'washer') {
    authService.setToken(null);
    partnerAuthService.setToken(data.access_token);
    return { kind: 'washer', user: me };
  }

  authService.setToken(null);
  partnerAuthService.setToken(null);
  const err = new Error('PARTNER_ROLE');
  throw err;
}
