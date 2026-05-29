import { authService } from '../services/authService';
import { partnerAuthService } from '../services/partnerAuthService';
import { normalizeIndianPhoneDigits } from '../utils/validators';

/**
 * Partner portal login: washers only. Admin accounts must use /admin/login.
 */
export async function loginViaPartnerPortal(phone, password) {
  const data = await authService.login({
    phone: normalizeIndianPhoneDigits(phone),
    password,
  });
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
