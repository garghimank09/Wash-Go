/**
 * Client-side Nominatim search for address suggestions (no backend autocomplete API).
 */

const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'WashGo-Mobile/1.0 (booking; contact@washgo.local)';
const DELHI_VIEWBOX = '76.8,28.9,77.6,28.4';

/**
 * @param {string} query
 * @returns {Promise<Array<{ id: string, label: string, lat: number, lng: number }>>}
 */
export async function searchAddresses(query) {
  const q = (query || '').trim();
  if (q.length < 3) return [];

  const params = new URLSearchParams({
    q,
    format: 'json',
    limit: '8',
    addressdetails: '1',
    countrycodes: 'in',
    viewbox: DELHI_VIEWBOX,
    bounded: '0',
  });

  const res = await fetch(`${NOMINATIM_SEARCH}?${params.toString()}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });

  if (!res.ok) return [];

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data
    .filter((item) => item.lat != null && item.lon != null)
    .map((item, index) => ({
      id: String(item.place_id ?? `${item.lat}-${item.lon}-${index}`),
      label: item.display_name || q,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
}
