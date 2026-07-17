import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapTogglesToPrefs } from '../../src/client/lib/profileToPrefs.js';

test('mapTogglesToPrefs calculates correct access flags and alerts', () => {
  const toggles = {
    wheelchair: true,
    lowVision: false,
    hardOfHearing: false,
    sensorySensitive: true,
    serviceAnimal: false
  };

  const result = mapTogglesToPrefs(toggles);
  assert.strictEqual(result.stepFreeRequired, true);
  assert.strictEqual(result.sensoryFriendlyRequired, true);
  assert.strictEqual(result.assistanceRequired, true);
  assert.ok(result.alerts.includes('Step-free route and elevators mandatory.'));
  assert.ok(result.alerts.includes('Avoid main concourse pyrotechnics; sensory room near Section 112 is open.'));
});

test('mapTogglesToPrefs returns default settings on null toggles', () => {
  const result = mapTogglesToPrefs(null);
  assert.strictEqual(result.stepFreeRequired, false);
  assert.strictEqual(result.alerts.length, 0);
});
