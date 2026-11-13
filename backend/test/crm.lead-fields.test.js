import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildLeadFields, zohoDateTime } from '../src/integrations/zoho-crm/lead-fields.js';

const ok = (value) => ({ status: 'answered', value });
const base = {
  reference: 'SPK-ABC123',
  createdAt: '2026-11-12T04:05:06.789Z',
  heard: ['Route: Guide Me', 'Contact: Ann'],
  contact: { name: 'Ann', email: 'a@b.co', location: 'Denver', preferredContact: 'email', bestTime: 'Mornings' },
};

test('zohoDateTime drops milliseconds and spells out UTC', () => {
  assert.equal(zohoDateTime('2026-11-12T04:05:06.789Z'), '2026-11-12T04:05:06+00:00');
});

test('guide route maps answers to the CRM picklist values', () => {
  const fields = buildLeadFields({
    ...base,
    route: 'guide',
    readiness: 'Research ready',
    answers: {
      fleetSize: ok('25-99'),
      vehicleTypes: ok(['Trailers', 'Heavy-duty trucks']),
      interests: ok(['Cameras & Safety']),
      objective: ok('Reduce claims'),
      currentSolution: ok('Partially'),
      installation: ok('Yes, please coordinate installation'),
      timing: ok('Within 30 days'),
      geography: ok('Colorado'),
      mustHaves: ok('Driver-facing camera'),
      constraints: ok('No downtime'),
      budget: ok('$10k'),
    },
  });

  assert.deepEqual(fields, {
    Discovery_Reference: 'SPK-ABC123',
    Discovery_Path: 'Guide Me',
    Discovery_Submitted_At: '2026-11-12T04:05:06+00:00',
    Discovery_Status: 'Research Ready',
    Research_Ready: true,
    Fleet_Size: '25-99',
    Vehicle_Types: ['Trailers', 'Heavy-duty trucks'],
    Areas_of_Interest: ['Cameras & Safety'],
    Timing: 'Within 30 days',
    Installation_Preference: 'Please coordinate installation',
    Current_Solution: 'Partially',
    Objective: 'Reduce claims',
    Must_Haves_and_Constraints: 'Driver-facing camera\n\nNo downtime',
    Budget_Range: '$10k',
    Vehicle_Location: 'Colorado',
    Preferred_Contact_Method: 'Email first',
    Best_Time_To_Reach: 'Mornings',
    Heard_Summary: 'Route: Guide Me\nContact: Ann',
    Discovery_Answers_JSON: fields.Discovery_Answers_JSON,
  });
  assert.equal(JSON.parse(fields.Discovery_Answers_JSON).answers.fleetSize.value, '25-99');
});

test('unsure or skipped answers are not written to fields', () => {
  const fields = buildLeadFields({
    ...base,
    route: 'guide',
    readiness: 'Discovery incomplete',
    answers: { fleetSize: { status: 'unsure', value: null }, timing: { status: 'skipped', value: null } },
  });
  assert.equal(fields.Fleet_Size, undefined);
  assert.equal(fields.Timing, undefined);
  assert.equal(fields.Discovery_Status, 'Discovery Incomplete');
  assert.equal(fields.Research_Ready, false);
});

test('guide route with organized: null and unanswered questions does not crash', () => {
  // submitDiscovery stores organized: null for the guide route; optional questions are often skipped.
  const fields = buildLeadFields({
    ...base,
    route: 'guide',
    organized: null,
    answers: { fleetSize: ok('100-499'), objective: ok('Upfit trucks') },
  });
  assert.equal(fields.Fleet_Size, '100-499');
  assert.equal(fields.Timing, undefined);
  assert.equal(fields.Areas_of_Interest, undefined);
  assert.equal(fields.Installation_Preference, undefined);
});

test('describe route uses the organized suggestions and the narrative', () => {
  const fields = buildLeadFields({
    ...base,
    route: 'describe',
    narrative: 'We need cameras on 30 vans asap',
    organized: { interests: ['Cameras & Safety'], fleetSize: '25-99', timing: 'Immediately', installation: 'Mentioned in my notes' },
  });
  assert.equal(fields.Discovery_Path, 'Tell Us What I Need');
  assert.equal(fields.Customer_Narrative, 'We need cameras on 30 vans asap');
  assert.deepEqual(fields.Areas_of_Interest, ['Cameras & Safety']);
  assert.equal(fields.Fleet_Size, '25-99');
  assert.equal(fields.Timing, 'Immediately');
  assert.equal(fields.Installation_Preference, 'Mentioned in notes');
  assert.equal(fields.Vehicle_Location, 'Denver');
});

test('values outside the CRM picklists are left out', () => {
  const fields = buildLeadFields({
    ...base,
    route: 'describe',
    narrative: 'x',
    organized: { interests: ['Made up'], fleetSize: 'lots', timing: 'someday', installation: 'maybe' },
  });
  for (const key of ['Areas_of_Interest', 'Fleet_Size', 'Timing', 'Installation_Preference']) {
    assert.equal(fields[key], undefined, key);
  }
});

test('talk route maps the method and topic', () => {
  const fields = buildLeadFields({ ...base, route: 'talk', talk: { method: 'video', topic: 'Upfit 10 trucks' } });
  assert.equal(fields.Discovery_Path, 'Lets Talk');
  assert.equal(fields.Preferred_Contact_Method, 'Video call');
  assert.equal(fields.Customer_Narrative, 'Upfit 10 trucks');
  assert.equal(fields.Discovery_Status, undefined);
});

test('chat route records consent and products, with no Discovery Path', () => {
  const fields = buildLeadFields({ ...base, route: 'chat', chat: { summary: 'Wants cameras', skus: ['CAM-1'] } });
  assert.equal(fields.Discovery_Path, undefined);
  assert.equal(fields.Contact_Consent, true);
  assert.deepEqual(JSON.parse(fields.Discovery_Answers_JSON), { productsDiscussed: ['CAM-1'] });
});

test('long text is cut to the CRM field length', () => {
  const fields = buildLeadFields({ ...base, route: 'guide', answers: { budget: ok('x'.repeat(400)) } });
  assert.equal(fields.Budget_Range.length, 255);
});
