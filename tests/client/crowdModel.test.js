import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCongestion } from '../../src/client/lib/crowdModel.js';

test('getCongestion yields correct outputs based on hours and zones', () => {
  // Peak hour
  assert.strictEqual(getCongestion('Zone A (Gates)', 19), 'High');
  assert.strictEqual(getCongestion('Zone B (Concourse)', 19), 'Medium');
  
  // Non-peak hour
  assert.strictEqual(getCongestion('Zone A (Gates)', 8), 'Low');
  
  // Invalid zone fallback
  assert.strictEqual(getCongestion('Invalid Zone', 19), 'Low');
});
