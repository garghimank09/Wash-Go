import { normalizeIndianPhoneDigits } from '../utils/validators';

/** Must match backend `app.utils.demo_accounts`. */
export const ADMIN_DEMO_EMAIL = 'admin@washgo.demo';
export const ADMIN_DEMO_PHONE = '9876543210';

export const DEMO_EMAILS = [ADMIN_DEMO_EMAIL, 'customer@washgo.demo', 'partner@washgo.demo'];

export const DEMO_PHONES = ['9876543210', '9876543211', '9876543212'];

export const DEMO_ACCOUNTS = [
  { label: 'Admin', phone: '9876543210', email: 'admin@washgo.demo', where: '/admin/login' },
  { label: 'Customer', phone: '9876543211', email: 'customer@washgo.demo', where: '/login' },
  { label: 'Partner', phone: '9876543212', email: 'partner@washgo.demo', where: '/partner/login' },
];

export const DEMO_PASSWORD = 'Demo1234';

export function isDemoEmail(email) {
  return DEMO_EMAILS.includes(String(email || '').trim().toLowerCase());
}

export function isAdminDemoEmail(email) {
  return String(email || '').trim().toLowerCase() === ADMIN_DEMO_EMAIL;
}

export function isDemoPhone(phone) {
  return DEMO_PHONES.includes(normalizeIndianPhoneDigits(phone));
}

export function isAdminDemoPhone(phone) {
  return normalizeIndianPhoneDigits(phone) === ADMIN_DEMO_PHONE;
}

export function isDemoAccount({ email, phone } = {}) {
  if (email && isDemoEmail(email)) return true;
  if (phone && isDemoPhone(phone)) return true;
  return false;
}

export const ADMIN_LOGIN_ONLY_MESSAGE =
  'Administrator accounts must sign in at the admin console (/admin/login), not here.';
