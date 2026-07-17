import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileFallbackPlan } from '../../src/client/lib/fallbackPlan.js';

test('compileFallbackPlan yields correct guidance', () => {
  const assessment = { level: 'Caution', score: 45 };
  const profile = { role: 'fan', zone: 'Zone A (Gates)', accessibility: { wheelchair: true } };

  const plan = compileFallbackPlan(assessment, profile);
  assert.ok(plan.includes('Deterministic Operations Safety Mode'));
  assert.ok(plan.includes('Elevators near Section 106'));
  assert.ok(plan.includes('REDIRECT transit'));
});
