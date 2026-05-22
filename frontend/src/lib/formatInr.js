/** Format paise (price_cents) as Indian Rupees per month label. */
export function formatInrPerMonth(priceCents, currency = 'INR') {
  if (currency !== 'INR') {
    const amount = priceCents / 100;
    return `${currency} ${amount.toLocaleString()}`;
  }
  const rupees = priceCents / 100;
  return `₹${rupees.toLocaleString('en-IN')}`;
}
