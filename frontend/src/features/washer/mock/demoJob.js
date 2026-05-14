import { PACKAGES } from '../../../constants/config';

export const DEMO_JOB = {
  id: 'demo',
  status: 'confirmed',
  customerName: 'Alex Rivera',
  customerPhone: '(415) 555-0192',
  vehicle: 'Tesla Model Y · Midnight silver',
  packageLabel: PACKAGES.find((p) => p.id === 'premium')?.label ?? 'Premium',
  service_address: '555 California St, San Francisco, CA',
  scheduled_at: new Date(Date.now() + 45 * 60000).toISOString(),
  price_cents: 8900,
  currency: 'USD',
  etaMinutes: 18,
  notes: 'Customer prefers microfiber only on glass.',
  repeatCustomer: true,
  loyaltyTier: 'Gold',
  vehicleConditionWarning: 'Light brake dust on fronts — pre-rinse wheels before body.',
  specialHandlingTags: ['Ceramic-safe soap', 'Soft-close doors', 'Panoramic roof · light pressure'],
};
