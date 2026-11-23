import assert from 'node:assert/strict';
import { test } from 'node:test';
import { US_STATES, formatLocation, joinLocations, parseLocation, splitLocations, stateCode } from './us-locations.js';

test('has the 50 states plus DC', () => {
  assert.equal(US_STATES.length, 51);
  assert.equal(stateCode('tx'), 'TX');
  assert.equal(stateCode('North Carolina'), 'NC');
  assert.equal(stateCode('Narnia'), '');
});

test('parseLocation understands "City, ST", "City, State" and state-only values', () => {
  assert.deepEqual(parseLocation('Dallas, TX'), { state: 'TX', city: 'Dallas' });
  assert.deepEqual(parseLocation('Columbus, Ohio'), { state: 'OH', city: 'Columbus' });
  assert.deepEqual(parseLocation('Texas'), { state: 'TX', city: '' });
  assert.deepEqual(parseLocation('Islamorada, Village of Islands, FL'), {
    state: 'FL',
    city: 'Islamorada, Village of Islands',
  });
});

test('parseLocation keeps unrecognized text as the city so nothing is lost', () => {
  assert.deepEqual(parseLocation('Dallas area'), { state: '', city: 'Dallas area' });
  assert.deepEqual(parseLocation('Midwest'), { state: '', city: 'Midwest' });
  assert.deepEqual(parseLocation(''), { state: '', city: '' });
  assert.deepEqual(parseLocation(null), { state: '', city: '' });
});

test('formatLocation round-trips with parseLocation', () => {
  assert.equal(formatLocation({ state: 'TX', city: 'Dallas' }), 'Dallas, TX');
  assert.equal(formatLocation({ state: 'TX', city: '' }), 'Texas');
  assert.equal(formatLocation({ state: '', city: 'Midwest' }), 'Midwest');
  for (const v of ['Dallas, TX', 'Texas', 'Midwest']) assert.equal(formatLocation(parseLocation(v)), v);
});

test('multiple locations are stored as one "; "-separated string', () => {
  assert.deepEqual(splitLocations('Dallas, TX; Houston, TX;  ; Ohio'), ['Dallas, TX', 'Houston, TX', 'Ohio']);
  assert.equal(joinLocations(['Dallas, TX', 'Ohio']), 'Dallas, TX; Ohio');
  assert.deepEqual(splitLocations(''), []);
});
