import { authService } from '../services/authService';
import { partnerAuthService } from '../services/partnerAuthService';

/**
 * Partner portal login: washers only. Admin accounts must use /admin/login.
 * @returns {{ kind: 'washer', user: object }}
 */
export async function loginViaPartnerPortal(email, password) {
  const data = await authService.login(email.trim(), password);
  authService.saveSession(data);
  const me = await authService.me();

  if (me.role === 'admin') {
    authService.clearSession();
    partnerAuthService.clearSession();
    const err = new Error('ADMIN_ROLE');
    err.user = me;
    throw err;
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
