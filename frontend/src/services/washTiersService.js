import { api } from './api';

export const washTiersService = {
  list: () => api.get('/wash-tiers').then((r) => r.data),
};

/** Map API tier row to customer UI package shape. */
export function tierToPackage(tier) {
  return {
    id: tier.slug,
    slug: tier.slug,
    label: tier.name,
    desc: tier.description ?? '',
    badge: tier.badge ?? null,
    features: tier.features ?? [],
    icon: tier.icon ?? 'sparkles',
    price_cents: tier.price_cents,
    sort_order: tier.sort_order,
  };
}
