import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getStadiumWeather } from '../../src/server/lib/weatherService.js';

test('getStadiumWeather fetches successfully or returns defaults', async () => {
  const result = await getStadiumWeather(40.81, -74.07);
  assert.ok(result);
  assert.strictEqual(typeof result.temp, 'number');
  assert.strictEqual(typeof result.rain, 'number');
  assert.strictEqual(typeof result.windSpeed, 'number');
});
