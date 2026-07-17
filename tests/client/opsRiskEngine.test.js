import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessStadiumRisk } from '../../src/client/lib/opsRiskEngine.js';

test('assessStadiumRisk calculates correct hazard level', () => {
  const telemetry = {
    zoneDensities: { 'Zone A (Gates)': 'High' },
    queues: { 'Gate A': 25 }
  };
  const weather = { rain: 5, windSpeed: 10 };
  const profile = { zone: 'Zone A (Gates)', accessibility: { wheelchair: true } };

  const result = assessStadiumRisk(telemetry, weather, profile);
  assert.ok(result.score > 50);
  assert.strictEqual(result.level, 'Emergency');
  assert.ok(result.drivers.includes('High density congestion in your zone: Zone A (Gates)'));
});
