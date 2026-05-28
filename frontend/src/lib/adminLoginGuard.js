import { isAdminDemoEmail } from './demoAccounts';

/** Block admin demo / admin-role sign-in on customer and partner login pages. */
export function isBlockedAdminPortalEmail(email) {
  return isAdminDemoEmail(email);
}

export function clearCustomerSession(authService) {
  authService?.clearSession?.();
}
