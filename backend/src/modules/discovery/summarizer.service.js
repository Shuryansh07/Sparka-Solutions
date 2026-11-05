// Rule-based organizer for free-text needs. It only suggests structure; the customer
// confirms or edits everything before it is submitted. A future AI provider can replace
// organize() as long as it returns the same shape and uses only approved categories.

const CATEGORY_KEYWORDS = {
  'Cameras & Safety': ['camera', 'dashcam', 'dash cam', 'video', 'backup', 'collision', 'safety', 'adas', 'mirror'],
  'GPS & Telematics': ['gps', 'telematics', 'tracking', 'tracker', 'eld', 'location', 'fleet data', 'route', 'fuel'],
  'Racks & Storage': ['rack', 'shelving', 'shelf', 'storage', 'bin', 'drawer', 'partition', 'ladder'],
  'Lighting & Electrical': ['light', 'led', 'beacon', 'strobe', 'wiring', 'electrical', 'warning'],
  'Power & Charging': ['inverter', 'battery', 'charging', 'charger', 'power', 'solar', 'ev '],
  'Security & Access': ['security', 'alarm', 'theft', 'lock', 'immobilizer', 'access'],
  Communications: ['radio', 'two-way', 'communication', 'push-to-talk', 'ptt', 'wifi', 'hotspot', 'modem'],
  'Vehicle Upfitting': ['upfit', 'outfit', 'build-out', 'buildout', 'conversion', 'liftgate', 'bed'],
  'Accessories & Supplies': ['accessor', 'supplies', 'mat', 'cover', 'first aid', 'fire extinguisher', 'tool'],
};

const TIMING_PATTERNS = [
  [/\b(asap|immediately|urgent|right away|this week)\b/i, 'Immediately'],
  [/\b(this month|30 days|next month|few weeks)\b/i, 'Within 30 days'],
  [/\b(next quarter|1-3 months|couple of months|q[1-4])\b/i, '1-3 months'],
  [/\b(later this year|next year|6 months)\b/i, '3+ months'],
  [/\b(exploring|researching|just looking|budgeting)\b/i, 'Just exploring'],
];

const FLEET_SIZE =
  /(\d{1,5})\s*\+?\s*(?:[a-z-]+\s+){0,2}(?:vehicles|vans|trucks|units|cars|pickups|buses|trailers|rigs)\b/i;

function bucket(count) {
  if (count < 5) return '1-4';
  if (count < 25) return '5-24';
  if (count < 100) return '25-99';
  if (count < 500) return '100-499';
  return '500+';
}

const CATEGORY_PATTERNS = Object.entries(CATEGORY_KEYWORDS).map(([category, words]) => [
  category,
  words.map((w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')),
]);

export function organize(text) {
  const padded = `${text} `;
  const interests = CATEGORY_PATTERNS.filter(([, patterns]) => patterns.some((re) => re.test(padded))).map(
    ([category]) => category
  );

  const sizeMatch = text.match(FLEET_SIZE);
  const timing = TIMING_PATTERNS.find(([re]) => re.test(text))?.[1] || '';

  return {
    interests: interests.length ? interests : ['Specialty Sourcing'],
    fleetSize: sizeMatch ? bucket(Number(sizeMatch[1])) : '',
    timing,
    installation: /\binstall/i.test(text) ? 'Mentioned in my notes' : '',
  };
}
