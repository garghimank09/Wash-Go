import { authService } from '../services/authService';
import { partnerAuthService } from '../services/partnerAuthService';

/**
 * Partner portal login: washers use partner token; admins use customer token + /admin.
 * @returns {{ kind: 'admin' | 'washer', user: object }}
 */
export async function loginViaPartnerPortal(email, password) {
  const data = await authService.login(email.trim(), password);
  authService.saveSession(data);
  const me = await authService.me();

  if (me.role === 'admin') {
    partnerAuthService.clearSession();
    return { kind: 'admin', user: me };
  }

  if (me.role === 'washer') {
    authService.clearSession();
    partnerAuthService.saveSession(data);
    return { kind: 'washer', user: me };
  }

  authService.clearSession();
  partnerAuthService.clearSession();
  const err = new Error('PARTNER_ROLE');
  throw err;
}
