/**
 * Client-side session storage for JWT access tokens with expiry.
 */

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(token) {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (payload?.exp) return payload.exp * 1000;
  return null;
}

export function isTokenExpired(token, expiresAtMs = null) {
  const exp = expiresAtMs ?? getTokenExpiryMs(token);
  if (!exp) return true;
  return Date.now() >= exp - 5000;
}

export function createAuthSessionStorage(tokenKey, expiresKey) {
  return {
    saveAuthResponse(data) {
      const token = data?.access_token;
      if (!token) {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(expiresKey);
        return;
      }
      localStorage.setItem(tokenKey, token);
      let expMs = null;
      if (data.expires_at) {
        expMs = new Date(data.expires_at).getTime();
      } else if (data.expires_in) {
        expMs = Date.now() + data.expires_in * 1000;
      } else {
        expMs = getTokenExpiryMs(token);
      }
      if (expMs) localStorage.setItem(expiresKey, String(expMs));
      else localStorage.removeItem(expiresKey);
    },

    getToken() {
      const token = localStorage.getItem(tokenKey);
      if (!token) return null;
      const expRaw = localStorage.getItem(expiresKey);
      const expMs = expRaw ? Number(expRaw) : getTokenExpiryMs(token);
      if (isTokenExpired(token, expMs)) {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(expiresKey);
        return null;
      }
      return token;
    },

    clear() {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(expiresKey);
    },

    getExpiresAtMs() {
      const expRaw = localStorage.getItem(expiresKey);
      if (expRaw) return Number(expRaw);
      const token = localStorage.getItem(tokenKey);
      return getTokenExpiryMs(token);
    },

    msUntilExpiry() {
      const exp = this.getExpiresAtMs();
      if (!exp) return 0;
      return Math.max(0, exp - Date.now());
    },
  };
}

/** Schedule logout when the access token expires. Returns clear function. */
export function scheduleTokenExpiryLogout(storage, onExpire) {
  const ms = storage.msUntilExpiry();
  if (!ms || ms <= 0) {
    onExpire();
    return () => {};
  }
  const id = window.setTimeout(() => {
    storage.clear();
    onExpire();
  }, ms + 250);
  return () => window.clearTimeout(id);
}
