const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email) {
  return EMAIL_RE.test(String(email || '').trim());
}

/** @param {string} value @param {{ required?: boolean }} opts */
export function validateEmail(value, { required = false } = {}) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return required ? 'Email is required' : null;
  if (trimmed.length > 254) return 'Email is too long';
  if (!EMAIL_RE.test(trimmed)) return 'Enter a valid email (e.g. name@company.com)';
  const [local, domain] = trimmed.split('@');
  if (!local || !domain || domain.startsWith('.') || domain.endsWith('.')) {
    return 'Enter a valid email (e.g. name@company.com)';
  }
  return null;
}

export function validatePassword(password) {
  if (!password || password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include at least one letter and one number';
  }
  return null;
}

/** Strip to digits; drop leading 91 when 12 digits. */
export function normalizeIndianPhoneDigits(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  return digits.slice(0, 10);
}

export function validateFullName(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return 'Full name is required';
  if (trimmed.length < 2) return 'Enter at least 2 characters';
  return null;
}

/** @param {string} value @param {{ required?: boolean }} opts */
export function validateIndianPhone10(value, { required = false } = {}) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return required ? 'Phone number is required' : null;
  const digits = normalizeIndianPhoneDigits(trimmed);
  if (digits.length !== 10) return 'Enter a valid 10-digit mobile number';
  if (!/^[6-9]\d{9}$/.test(digits)) return 'Enter a valid Indian mobile number (starts with 6–9)';
  return null;
}

export function validateOtpCode(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return 'Verification code is required';
  if (!/^\d{6}$/.test(trimmed)) return 'Enter the 6-digit code from your email';
  return null;
}

export function validateServiceArea(value, { required = false } = {}) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return required ? 'Service area is required' : null;
  if (trimmed.length < 3) return 'Enter a valid city or locality';
  return null;
}
