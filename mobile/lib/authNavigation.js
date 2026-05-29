/**
 * Safe back navigation from auth screens when the stack may be empty
 * (e.g. PartnerAuthGate used router.replace to partner-login).
 */
export function goBackToRoleSelection(router) {
  if (typeof router.canGoBack === 'function' && router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/(auth)/welcome');
}
