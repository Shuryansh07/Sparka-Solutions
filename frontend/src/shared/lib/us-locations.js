// US states and helpers for "City, ST" location strings (see LocationPicker).

export const US_STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
  ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
  ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
  ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
].map(([code, name]) => ({ code, name }));

const BY_CODE = new Map(US_STATES.map((s) => [s.code, s]));
const BY_NAME = new Map(US_STATES.map((s) => [s.name.toLowerCase(), s]));

/** "TX", "tx" or "Texas" -> "TX"; anything else -> "". */
export function stateCode(text = '') {
  const t = text.trim();
  return BY_CODE.get(t.toUpperCase())?.code || BY_NAME.get(t.toLowerCase())?.code || '';
}

export const stateName = (code) => BY_CODE.get(code)?.name || '';

/**
 * Reads one location string into { state, city }. Understands "Dallas, TX", "Columbus, Ohio",
 * "Texas" and "TX". Unrecognized text stays in `city` with no state, so nothing typed is lost.
 */
export function parseLocation(value = '') {
  const text = String(value || '').trim();
  if (!text) return { state: '', city: '' };
  const whole = stateCode(text);
  if (whole) return { state: whole, city: '' };
  const comma = text.lastIndexOf(',');
  if (comma > 0) {
    const code = stateCode(text.slice(comma + 1));
    if (code) return { state: code, city: text.slice(0, comma).trim() };
  }
  return { state: '', city: text };
}

/** { state, city } -> "Dallas, TX" | "Texas" | "Dallas" | "". */
export function formatLocation({ state = '', city = '' } = {}) {
  const c = city.trim();
  if (state && c) return `${c}, ${state}`;
  if (state) return stateName(state);
  return c;
}

/** Multiple locations are stored as one string separated by "; ". */
export const splitLocations = (value = '') =>
  String(value || '')
    .split(/\s*;\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

export const joinLocations = (items) => items.join('; ');
