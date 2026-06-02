import { CUSTOMER_DEMO_PHONE, isCustomerDemoPhone } from './demoAccounts';
import { normalizeIndianPhoneDigits } from '../utils/validators';

/** Block customer demo sign-in on partner login page. */
export function isBlockedCustomerOnPartnerPortal(phone) {
  return isCustomerDemoPhone(phone) || normalizeIndianPhoneDigits(phone) === CUSTOMER_DEMO_PHONE;
}
