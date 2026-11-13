import assert from 'node:assert/strict';
import { test } from 'node:test';
import { WEBFORM_FIELDS, isWebformSuccess, toWebformBody } from '../src/integrations/zoho-crm/webform.js';

const FORM = { xnQsjsdp: 'tokA', xmIwtLD: 'tokB', returnUrl: 'https://example.com/' };

test('body carries the form tokens, fixed inputs and an empty honeypot', () => {
  const body = toWebformBody({ Company: 'Acme', Last_Name: 'Lee' }, FORM);
  assert.equal(body.get('xnQsjsdp'), 'tokA');
  assert.equal(body.get('xmIwtLD'), 'tokB');
  assert.equal(body.get('returnURL'), 'https://example.com/');
  assert.equal(body.get('actionType'), 'TGVhZHM=');
  assert.equal(body.get('aG9uZXlwb3Q'), '');
  assert.equal(body.get('Company'), 'Acme');
  assert.equal(body.get('Last Name'), 'Lee');
});

test('only fields on the webform are sent, under their webform input names', () => {
  const body = toWebformBody({ Company: 'Acme', Last_Name: 'Lee', Fleet_Size: '5-24', Not_On_Form: 'x' }, FORM);
  const sent = [...body.keys()].filter((k) => !['xnQsjsdp', 'xmIwtLD', 'returnURL', 'actionType', 'zc_gad', 'aG9uZXlwb3Q'].includes(k));
  assert.deepEqual(sent.sort(), ['Company', 'Last Name', WEBFORM_FIELDS.Fleet_Size].sort());
  assert.equal(body.get(WEBFORM_FIELDS.Fleet_Size), '5-24');
});

test('multi-select values repeat the input and true booleans become "on"', () => {
  const body = toWebformBody(
    { Last_Name: 'Lee', Vehicle_Types: ['Trailers', 'Heavy-duty trucks'], Research_Ready: true, Contact_Consent: false },
    FORM
  );
  assert.deepEqual(body.getAll(WEBFORM_FIELDS.Vehicle_Types), ['Trailers', 'Heavy-duty trucks']);
  assert.equal(body.get(WEBFORM_FIELDS.Research_Ready), 'on');
  assert.equal(body.has(WEBFORM_FIELDS.Contact_Consent), false);
});

test('empty values are left out', () => {
  const body = toWebformBody({ Company: '', Last_Name: 'Lee' }, FORM);
  assert.equal(body.has('Company'), false);
});

test('success is the redirect page or a 3xx; anything else fails', () => {
  assert.equal(isWebformSuccess(200, '<script>window.location.assign("https://x/");</script>'), true);
  assert.equal(isWebformSuccess(302, ''), true);
  assert.equal(isWebformSuccess(200, '<html>Invalid webform</html>'), false);
  assert.equal(isWebformSuccess(500, 'error'), false);
});
