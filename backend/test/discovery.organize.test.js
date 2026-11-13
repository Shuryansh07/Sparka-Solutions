import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

process.env.OPENAI_API_KEY = 'test-key';
process.env.CHAT_MODEL = 'test-model';

const { config } = await import('../src/config/index.js');
const { library, organizeText } = await import('../src/modules/discovery/discovery.service.js');
const { buildSchema, extractLeadFields, leadFieldSpecs } = await import(
  '../src/modules/discovery/lead-extractor.service.js'
);
const { buildLeadFields } = await import('../src/integrations/zoho-crm/lead-fields.js');

const NOTES =
  "We run 40 service vans in the Dallas area and want forward-facing cameras and GPS tracking. Our current trackers are old and drivers don't like the app. Hoping to have something in place next quarter, and we'll need installation.";

const AI_RESULT = {
  interests: ['Cameras & Safety', 'GPS & Telematics'],
  fleetSize: '25-99',
  vehicleTypes: ['Light-duty vans / pickups'],
  timing: '1-3 months',
  installation: 'Yes, please coordinate installation',
  currentSolution: 'Partially',
  objective: 'They want forward-facing cameras and to replace outdated GPS trackers.',
  mustHaves: 'A tracking app drivers are happy to use.',
  budget: '',
  location: 'Dallas area',
};

beforeEach(() => {
  config.chat.enabled = true;
});

test('schema is strict and limits picklists to the CRM values', () => {
  const schema = buildSchema(leadFieldSpecs(library));
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.required.sort(), Object.keys(schema.properties).sort());
  const fleet = library.questions.find((q) => q.id === 'fleetSize').options;
  assert.deepEqual(schema.properties.fleetSize.enum, ['', ...fleet]);
  assert.deepEqual(
    schema.properties.interests.items.enum,
    library.questions.find((q) => q.id === 'interests').options
  );
  assert.ok(schema.properties.installation.enum.includes('Mentioned in my notes'));
  assert.equal(schema.properties.objective.type, 'string');
});

test('extractLeadFields sends the notes with the schema and parses the JSON reply', async () => {
  const calls = [];
  const client = {
    responses: {
      create: async (params) => {
        calls.push(params);
        return { output_text: JSON.stringify(AI_RESULT) };
      },
    },
  };
  const result = await extractLeadFields(NOTES, library, { client, model: 'm' });
  assert.deepEqual(result, AI_RESULT);
  assert.equal(calls[0].model, 'm');
  assert.equal(calls[0].store, false);
  assert.match(calls[0].input, /40 service vans/);
  assert.equal(calls[0].text.format.type, 'json_schema');
  assert.equal(calls[0].text.format.strict, true);
});

test('organizeText returns the AI fields, dropping values that are not CRM options', async () => {
  const extract = async () => ({ ...AI_RESULT, interests: ['Cameras & Safety', 'Rockets'], currentSolution: 'Maybe' });
  const out = await organizeText(NOTES, { extract });
  assert.deepEqual(out.interests, ['Cameras & Safety']);
  assert.equal(out.currentSolution, '');
  assert.equal(out.fleetSize, '25-99');
  assert.equal(out.location, 'Dallas area');
});

test('organizeText falls back to the rule-based organizer when the AI call fails', async () => {
  const extract = async () => {
    throw new Error('boom');
  };
  const out = await organizeText(NOTES, { extract });
  assert.equal(out.fleetSize, '25-99');
  assert.ok(out.interests.includes('GPS & Telematics'));
  assert.deepEqual(out.vehicleTypes, []);
  assert.equal(out.objective, '');
});

test('organizeText skips the AI when chat/OpenAI is disabled', async () => {
  config.chat.enabled = false;
  let called = false;
  const out = await organizeText(NOTES, {
    extract: async () => {
      called = true;
      return AI_RESULT;
    },
  });
  assert.equal(called, false);
  assert.equal(out.timing, '1-3 months');
});

test('organizeText rejects notes that are too short', async () => {
  await assert.rejects(organizeText('hi'), { status: 422 });
});

test('AI-organized values land in the matching CRM Lead fields', () => {
  const fields = buildLeadFields({
    reference: 'SPK-1',
    route: 'describe',
    narrative: NOTES,
    organized: AI_RESULT,
    contact: { name: 'Pat', email: 'pat@example.com' },
  });
  assert.deepEqual(fields.Areas_of_Interest, ['Cameras & Safety', 'GPS & Telematics']);
  assert.equal(fields.Fleet_Size, '25-99');
  assert.deepEqual(fields.Vehicle_Types, ['Light-duty vans / pickups']);
  assert.equal(fields.Timing, '1-3 months');
  assert.equal(fields.Installation_Preference, 'Please coordinate installation');
  assert.equal(fields.Current_Solution, 'Partially');
  assert.match(fields.Objective, /forward-facing cameras/);
  assert.equal(fields.Must_Haves_and_Constraints, 'A tracking app drivers are happy to use.');
  assert.equal(fields.Budget_Range, undefined);
  assert.equal(fields.Vehicle_Location, 'Dallas area');
  assert.equal(fields.Customer_Narrative, NOTES);
  assert.equal(JSON.parse(fields.Discovery_Answers_JSON).organized.currentSolution, 'Partially');
});

test('installation chosen by its CRM label (older Describe page) still reaches the Lead', () => {
  const fields = buildLeadFields({
    route: 'describe',
    narrative: NOTES,
    organized: { installation: 'Please coordinate installation' },
    contact: { name: 'Pat', email: 'pat@example.com' },
  });
  assert.equal(fields.Installation_Preference, 'Please coordinate installation');
});

test('organizeText returns contact details the writer gave, dropping invalid ones', async () => {
  const extract = async () => ({
    ...AI_RESULT,
    contact: { name: 'Pat Lee', company: 'Lee Plumbing', email: 'PAT@LEEPLUMBING.COM', phone: 'call me', location: 'Dallas, TX' },
  });
  const out = await organizeText(NOTES, { extract });
  assert.deepEqual(out.contact, {
    name: 'Pat Lee',
    company: 'Lee Plumbing',
    email: 'pat@leeplumbing.com',
    phone: '',
    location: 'Dallas, TX',
  });
  assert.equal(out.fleetSize, '25-99'); // Lead fields are unaffected
});

test('rule-based fallback still picks out an email and phone number', async () => {
  const extract = async () => {
    throw new Error('boom');
  };
  const out = await organizeText(`${NOTES} Reach me at pat@example.com or (214) 555-0182.`, { extract });
  assert.equal(out.contact.email, 'pat@example.com');
  assert.equal(out.contact.phone, '(214) 555-0182');
  assert.equal(out.contact.name, '');
});

test('the AI schema asks for the writer\'s contact details', () => {
  const schema = buildSchema(leadFieldSpecs(library));
  assert.deepEqual(schema.properties.contact.required, ['name', 'company', 'email', 'phone', 'location']);
  assert.equal(schema.properties.contact.additionalProperties, false);
});
