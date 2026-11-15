const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateQuote } = require('../quote-engine');
const live = require('../quote-config');
const input = { vehicleYear: '2010', make: 'Ford', model: 'Ranger', service: 'spare', keyType: 'transponder', workingKeys: 'yes', location: 'windsor' };
// Synthetic rates test arithmetic only; these are not customer prices.
const config = { validUntil: '2099-01-01', rules: [{ enabled: true, service: 'spare', keyType: 'transponder', workingKeys: 'yes', make: 'Ford', model: 'Ranger', yearMin: 2008, yearMax: 2011, price: { min: 100, max: 150 }, includes: 'Synthetic test service' }], travel: { windsor: 20 }, taxRate: 0.13 };
const run = (i = input, c = config) => calculateQuote(i, c, '2026-11-15');
test('unconfigured public rates never invent a price', () => assert.equal(run(input, live).status, 'review'));
test('matching rule calculates travel, tax and total', () => { const q = run(); assert.equal(q.status, 'estimate'); assert.deepEqual(q.subtotal, { min: 120, max: 170 }); assert.deepEqual(q.total, { min: 135.6, max: 192.1 }); });
test('unknown tax stays explicit and excludes tax from total', () => { const q = run(input, { ...config, taxRate: null }); assert.equal(q.tax, null); assert.deepEqual(q.total, q.subtotal); });
test('normalizes make/model without fuzzy guessing', () => { assert.equal(run({ ...input, make: ' FORD ', model: 'ranger ' }).status, 'estimate'); assert.equal(run({ ...input, model: 'Ranger XL' }).status, 'review'); });
test('unmatched, out of year range, incomplete and inconsistent jobs require review', () => {
 for (const change of [{ make: 'Toyota' }, { vehicleYear: '2020' }, { vehicleYear: '2010.5' }, { model: '' }, { keyType: 'unknown' }, { workingKeys: 'no' }, { workingKeys: 'unknown' }, { service: 'lost' }, { service: 'module' }, { service: 'tuning' }, { location: 'other' }]) assert.equal(run({ ...input, ...change }).status, 'review', JSON.stringify(change));
});
test('expired, disabled, duplicate or malformed rules cannot price', () => {
 for (const change of [{ validUntil: null }, { validUntil: '2026-01-01' }, { rules: [config.rules[0], config.rules[0]] }, { rules: [{ ...config.rules[0], enabled: false }] }, { rules: [{ ...config.rules[0], price: { min: -1, max: 10 } }] }, { rules: [{ ...config.rules[0], includes: '' }] }, { travel: { windsor: null } }, { taxRate: -1 }]) assert.equal(run(input, { ...config, ...change }).status, 'review');
});
test('all-keys-lost needs its own matching rule and no working key', () => {
 const c = { ...config, rules: [{ ...config.rules[0], service: 'lost', workingKeys: 'no' }] };
 assert.equal(run({ ...input, service: 'lost', workingKeys: 'no' }, c).status, 'estimate');
 assert.equal(run({ ...input, service: 'lost', workingKeys: 'yes' }, c).status, 'review');
});
