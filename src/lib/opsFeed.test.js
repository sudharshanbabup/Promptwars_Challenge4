import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSignals } from './opsFeed.js';

test('getSignals yields standard alerts', () => {
  const alerts = getSignals(12);
  assert.ok(alerts.length >= 4);
  assert.strictEqual(alerts[0].id, 'sig1');
});
