import {
  formatPhoneInput,
  validateIndianPhone10,
} from './phoneValidation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  const trimmed = (email || '').trim();
  if (!trimmed) return 'Email is required';
  if (!EMAIL_RE.test(trimmed)) return 'Enter a valid email address';
  return null;
}

export function validatePassword(password, { forSignup = false } = {}) {
  if (!password) return 'Password is required';
  if (forSignup) {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password.length > 128) return 'Password must be at most 128 characters';
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return 'Password must contain at least one letter and one number';
    }
  }
  return null;
}

export function validateLogin({ email, password }) {
  const errors = {};
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  if (!password) errors.password = 'Password is required';
  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateSignup({ full_name, email, password, phone, phoneRequired = false }) {
  const errors = {};
  if (!full_name?.trim()) errors.full_name = 'Full name is required';
  else if (full_name.trim().length > 200) errors.full_name = 'Name is too long';

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const phoneErr = validateIndianPhone10(phone, { required: phoneRequired });
  if (phoneErr) errors.phone = phoneErr;

  const passErr = validatePassword(password, { forSignup: true });
  if (passErr) errors.password = passErr;

  return { ok: Object.keys(errors).length === 0, errors };
}

export { formatPhoneInput, validateIndianPhone10 };

export function validateOtpCode(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return 'Verification code is required';
  if (!/^\d{6}$/.test(trimmed)) return 'Enter the 6-digit code from your email';
  return null;
}
