import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLiveTelemetry } from '../../src/server/lib/telemetryService.js';

test('getLiveTelemetry generates valid operations stats', () => {
  const data = getLiveTelemetry();
  assert.ok(data);
  assert.ok(data.queues);
  assert.ok(data.zoneDensities);
  assert.ok(Array.isArray(data.activeIncidents));
});
