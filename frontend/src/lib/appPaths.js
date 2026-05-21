/** Marketing landing — used after logout / sign out from any app shell. */
export function redirectToMarketingHome() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/') return;
  window.location.replace('/');
}

/** Default home route after auth, by role. */
export function defaultAppPathForRole(user) {
  if (!user) return '/dashboard';
  if (user.role === 'washer') return '/partner';
  return '/dashboard';
}

/**
 * Where to send the user right after login/signup.
 * @param {object | null} user
 * @param {string} [from] pathname from location.state
 */
export function resolvePostLoginPath(user, from) {
  if (!user) return '/dashboard';
  const safeFrom = typeof from === 'string' && from.startsWith('/') && from !== '/login' ? from : null;
  if (safeFrom) {
    if (user.role === 'washer' && !safeFrom.startsWith('/partner')) return '/partner';
    if (user.role === 'customer' && safeFrom.startsWith('/partner')) return '/dashboard';
    if (user.role !== 'admin' && safeFrom.startsWith('/admin')) return defaultAppPathForRole(user);
    return safeFrom;
  }
  return defaultAppPathForRole(user);
}
