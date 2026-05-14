/**
 * Admin shell access: real admins always; optional demo gate for non-production builds.
 * Set `VITE_ADMIN_UI_DEMO=true` in `.env` for investor demos (never rely on this in production).
 */
export function canAccessAdmin(user) {
  if (!user) return false;
  if (user.role === 'washer') return false;
  if (user.role === 'admin') return true;
  const demoAllowed =
    import.meta.env.VITE_ADMIN_UI_DEMO === 'true' && import.meta.env.MODE !== 'production';
  return demoAllowed;
}

export function isAdminDemoMode(user) {
  return Boolean(user && user.role !== 'admin' && canAccessAdmin(user));
}
