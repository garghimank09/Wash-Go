/**
 * Client-side session: localStorage + cookie mirror, 1-week JWT lifetime from API.
 */

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

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

function setCookie(name, value, maxAgeSec = SESSION_MAX_AGE_SEC) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; SameSite=Lax${secure}`;
}

function clearCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}

export function createAuthSessionStorage(tokenKey, expiresKey, cookieName = tokenKey) {
  return {
    saveAuthResponse(data) {
      const token = data?.access_token;
      if (!token) {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(expiresKey);
        clearCookie(cookieName);
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

      const maxAge = data.expires_in ?? SESSION_MAX_AGE_SEC;
      setCookie(cookieName, token, maxAge);
    },

    getToken() {
      let token = localStorage.getItem(tokenKey);
      if (!token) token = getCookie(cookieName);
      if (!token) return null;
      const expRaw = localStorage.getItem(expiresKey);
      const expMs = expRaw ? Number(expRaw) : getTokenExpiryMs(token);
      if (isTokenExpired(token, expMs)) {
        this.clear();
        return null;
      }
      if (!localStorage.getItem(tokenKey)) {
        localStorage.setItem(tokenKey, token);
      }
      return token;
    },

    clear() {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(expiresKey);
      clearCookie(cookieName);
    },

    getExpiresAtMs() {
      const expRaw = localStorage.getItem(expiresKey);
      if (expRaw) return Number(expRaw);
      const token = localStorage.getItem(tokenKey) || getCookie(cookieName);
      return getTokenExpiryMs(token);
    },

    msUntilExpiry() {
      const exp = this.getExpiresAtMs();
      if (!exp) return 0;
      return Math.max(0, exp - Date.now());
    },
  };
}

/** Schedule logout when the access token expires (after 1 week). Returns clear function. */
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
