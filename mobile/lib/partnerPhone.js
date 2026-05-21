/**
 * Dial-ready phone helpers for partner job flows.
 */

/**
 * Strip to characters valid inside a tel: URI (digits and leading +).
 * @returns {string} normalized dial string, or '' if unusable
 */
export function normalizeForTel(raw) {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';

  const hasPlus = s.startsWith('+');
  const digits = s.replace(/\D/g, '');
  if (!digits || digits.length < 7) return '';

  if (hasPlus) return `+${digits}`;
  return digits;
}

export function canDialPhone(raw) {
  return normalizeForTel(raw).length >= 7;
}
