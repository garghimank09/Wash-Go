import { isAdminDemoPhone } from './demoAccounts';

/** Block admin demo sign-in on customer and partner login pages. */
export function isBlockedAdminPortalPhone(phone) {
  return isAdminDemoPhone(phone);
}

export function clearCustomerSession(authService) {
  authService?.clearSession?.();
}
