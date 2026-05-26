/**
 * User-facing copy for washer job advance / status PATCH failures.
 */
export function formatJobAdvanceError(err) {
  const raw = err?.message || '';
  if (!raw) return 'Could not update job status. Try again.';

  if (/status code 500|Request failed \(500\)/i.test(raw)) {
    return 'Something went wrong on the server. Pull to refresh and try again.';
  }

  if (/Cannot change status from/i.test(raw)) {
    return 'This status change is not allowed for this booking. Pull to refresh.';
  }

  if (/validation_error|422|not allowed/i.test(raw)) {
    return 'This step cannot be applied right now. Pull to refresh and retry.';
  }

  if (/Session expired|sign in again/i.test(raw)) {
    return raw;
  }

  if (/Request failed \(\d+\)/.test(raw)) {
    return 'Could not sync this step. Check your connection and try again.';
  }

  return raw.length > 120 ? 'Could not update job status. Try again.' : raw;
}
