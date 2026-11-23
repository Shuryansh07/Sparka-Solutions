// Maps a website submission onto the existing custom fields of the Zoho CRM Leads module.
// Picklist values must match the CRM exactly, so every picklist value is translated or
// checked against the CRM's options; anything that does not match is left out (it is still
// in Heard_Summary and the Note).

const PATH = { guide: 'Guide Me', describe: 'Tell Us What I Need', talk: 'Lets Talk' };
const CONTACT_METHOD = { phone: 'Phone call', video: 'Video call', email: 'Email first' };
const STATUS = { 'Research ready': 'Research Ready', 'Discovery incomplete': 'Discovery Incomplete' };
const INSTALLATION = {
  'Yes, please coordinate installation': 'Please coordinate installation',
  'We have our own installer': 'We have our own installer',
  'No installation needed': 'No installation needed',
  'Mentioned in my notes': 'Mentioned in notes',
};
const FLEET_SIZES = ['1-4', '5-24', '25-99', '100-499', '500+'];
const TIMINGS = ['Immediately', 'Within 30 days', '1-3 months', '3+ months', 'Just exploring'];
const CURRENT_SOLUTIONS = ['Yes', 'Partially', 'No'];
const VEHICLE_TYPES = [
  'Light-duty vans / pickups',
  'Medium-duty trucks',
  'Heavy-duty trucks',
  'Trailers',
  'Specialty / service vehicles',
  'Passenger / transit',
  'Equipment / off-road',
];
const INTERESTS = [
  'Cameras & Safety',
  'GPS & Telematics',
  'Racks & Storage',
  'Lighting & Electrical',
  'Power & Charging',
  'Security & Access',
  'Communications',
  'Vehicle Upfitting',
  'Accessories & Supplies',
  'Specialty Sourcing',
];

const TEXT_MAX = 255;
const TEXTAREA_MAX = 32000;

const answered = (answers, id) => (answers?.[id]?.status === 'answered' ? answers[id].value : undefined);
const oneOf = (value, allowed) => (allowed.includes(value) ? value : undefined);
const someOf = (values, allowed) => {
  const kept = (Array.isArray(values) ? values : []).filter((v) => allowed.includes(v));
  return kept.length ? kept : undefined;
};
const text = (value, max) => (typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined);

// Zoho datetime fields reject milliseconds: 2026-11-12T04:05:06.789Z -> 2026-11-12T04:05:06+00:00
export const zohoDateTime = (iso) => iso.replace(/\.\d+/, '').replace(/Z$/, '+00:00');

export function buildLeadFields(submission) {
  const { route, talk, chat, narrative, readiness } = submission;
  // Stored submissions use null (not undefined) for parts a route does not have, e.g. organized on guide.
  const answers = submission.answers || {};
  const organized = submission.organized || {};
  const contact = submission.contact || {};

  const mustHaves = [answered(answers, 'mustHaves'), answered(answers, 'constraints')].filter(Boolean);
  const discoveryData = {
    ...(Object.keys(answers).length ? { answers } : {}),
    ...(route === 'describe' ? { organized } : {}),
    ...(chat?.skus?.length ? { productsDiscussed: chat.skus } : {}),
  };

  const fields = {
    Discovery_Reference: submission.reference,
    Discovery_Path: PATH[route],
    Discovery_Submitted_At: submission.createdAt ? zohoDateTime(submission.createdAt) : undefined,
    Discovery_Status: STATUS[readiness],
    Research_Ready: readiness ? readiness === 'Research ready' : undefined,
    Fleet_Size: oneOf(answered(answers, 'fleetSize') ?? organized.fleetSize, FLEET_SIZES),
    Vehicle_Types: someOf(answered(answers, 'vehicleTypes'), VEHICLE_TYPES),
    Areas_of_Interest: someOf(answered(answers, 'interests') ?? organized.interests, INTERESTS),
    Timing: oneOf(answered(answers, 'timing') ?? organized.timing, TIMINGS),
    Installation_Preference: INSTALLATION[answered(answers, 'installation') ?? organized.installation],
    Current_Solution: oneOf(answered(answers, 'currentSolution'), CURRENT_SOLUTIONS),
    Objective: text(answered(answers, 'objective'), TEXTAREA_MAX),
    Must_Haves_and_Constraints: text(mustHaves.join('\n\n'), TEXTAREA_MAX),
    Budget_Range: text(answered(answers, 'budget'), TEXT_MAX),
    Vehicle_Location: text(answered(answers, 'geography') || contact.location, TEXT_MAX),
    Customer_Narrative: text(route === 'talk' ? talk?.topic : narrative, TEXTAREA_MAX),
    Preferred_Contact_Method: CONTACT_METHOD[talk?.method || contact.preferredContact],
    Best_Time_To_Reach: text(contact.bestTime, TEXT_MAX),
    Heard_Summary: text((submission.heard || []).join('\n'), TEXTAREA_MAX),
    Discovery_Answers_JSON: Object.keys(discoveryData).length
      ? JSON.stringify(discoveryData).slice(0, TEXTAREA_MAX)
      : undefined,
    // The chat assistant only hands a visitor over after they explicitly agree to be contacted.
    Contact_Consent: route === 'chat' ? true : undefined,
  };

  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
}
