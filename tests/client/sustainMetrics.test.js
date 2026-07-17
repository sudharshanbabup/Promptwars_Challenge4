import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMetrics } from '../../src/client/lib/sustainMetrics.js';

test('getMetrics computes expected percentage ranges', () => {
  const metrics = getMetrics(12);
  assert.ok(metrics.wasteDivertedPercent >= 0 && metrics.wasteDivertedPercent <= 100);
  assert.ok(metrics.waterSavedPercent >= 0 && metrics.waterSavedPercent <= 100);
  assert.ok(metrics.renewableEnergyPercent >= 0 && metrics.renewableEnergyPercent <= 100);
  assert.ok(metrics.transitSharePercent >= 0 && metrics.transitSharePercent <= 100);
});
