/** Haversine distance in km */
export function haversineKm(a, b) {
  const r = 6371;
  const p1 = (a.lat * Math.PI) / 180;
  const p2 = (b.lat * Math.PI) / 180;
  const dlat = ((b.lat - a.lat) * Math.PI) / 180;
  const dlng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dlat / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dlng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(x)));
}

/** Bearing in degrees (0 = north) from a → b */
export function bearingDeg(a, b) {
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export const DELHI_CENTER = { lat: 28.6139, lng: 77.209 };
