import { useCustomerBookingSync } from '../../hooks/useCustomerBookingSync';

/** Mount inside authenticated customer shell — enables live booking sync polling. */
export default function CustomerBookingSyncBridge() {
  useCustomerBookingSync();
  return null;
}
