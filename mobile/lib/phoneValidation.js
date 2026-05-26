/** Strip to digits; drop leading 91 when 12 digits (matches web). */
export function normalizeIndianPhoneDigits(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  return digits.slice(0, 10);
}

export function validateIndianPhone10(value, { required = false } = {}) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return required ? 'Phone number is required' : null;
  const digits = normalizeIndianPhoneDigits(trimmed);
  if (digits.length !== 10) return 'Enter a valid 10-digit mobile number';
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return 'Enter a valid Indian mobile number (starts with 6–9)';
  }
  return null;
}

/** Live input sanitizer — numeric only, max 10 digits. */
export function formatPhoneInput(value) {
  return normalizeIndianPhoneDigits(value);
}
