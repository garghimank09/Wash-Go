/** Must match backend `app.utils.demo_accounts` — OTP is skipped for these emails. */
export const ADMIN_DEMO_EMAIL = 'admin@washgo.demo';

export const DEMO_EMAILS = [
  ADMIN_DEMO_EMAIL,
  'customer@washgo.demo',
  'partner@washgo.demo',
];

export function isDemoEmail(email) {
  return DEMO_EMAILS.includes(String(email || '').trim().toLowerCase());
}

export function isAdminDemoEmail(email) {
  return String(email || '').trim().toLowerCase() === ADMIN_DEMO_EMAIL;
}

export const ADMIN_LOGIN_ONLY_MESSAGE =
  'Administrator accounts must sign in at the admin console (/admin/login), not here.';
