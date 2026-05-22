/** Must match backend `app.utils.demo_accounts` — OTP is skipped for these emails. */
export const DEMO_EMAILS = [
  'admin@washgo.demo',
  'customer@washgo.demo',
  'partner@washgo.demo',
];

export function isDemoEmail(email) {
  return DEMO_EMAILS.includes(String(email || '').trim().toLowerCase());
}
