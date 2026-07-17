import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../../src/client/lib/routeFormat.js';

test('parseRoute handles empty and structured lines', () => {
  const text = `
    1. Proceed to Gate C
    2. Enter step-free lane
    Advice: Congestion is high at Gate A.
  `;
  const result = parseRoute(text);
  assert.deepEqual(result.steps, ['Proceed to Gate C', 'Enter step-free lane']);
  assert.strictEqual(result.tip, 'Advice: Congestion is high at Gate A.');
});

test('parseRoute defaults to generic warning if no advice found', () => {
  const text = 'Direct route open.';
  const result = parseRoute(text);
  assert.deepEqual(result.steps, ['Direct route open.']);
  assert.strictEqual(result.tip, 'Follow dynamic stadium signage for latest flow changes.');
});
