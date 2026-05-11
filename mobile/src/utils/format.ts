export function formatCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
}

export function toIsoUtc(d: Date): string {
  return d.toISOString();
}
