import { test } from 'node:test';
import assert from 'node:assert';
import { getWeather, weatherCache } from '../../src/services/weatherService.ts';
import { UpstreamError } from '../../src/domain/errors.ts';

test('getWeather fetches weather signals and uses caching', async () => {
  weatherCache.clear();

  const mockResponse = {
    ok: true,
    json: async () => ({
      daily: {
        precipitation_sum: [15.2, 30.5, 10.0],
        wind_speed_10m_max: [25.4, 20.1, 15.0],
        weather_code: [3, 95, 3]
      }
    })
  };

  const originalFetch = global.fetch;
  let callCount = 0;

  global.fetch = async (url) => {
    callCount++;
    assert.ok(typeof url === 'string' && url.includes('latitude=19.08'));
    return mockResponse as any;
  };

  try {
    // First call: fetches from mock Open-Meteo
    const signal1 = await getWeather(19.076, 72.877, false);
    assert.strictEqual(signal1.rainfall24h_mm, 15.2);
    assert.strictEqual(signal1.thunderstorm, true);
    assert.strictEqual(callCount, 1);

    // Second call with same coordinates: should hit cache and not trigger fetch
    const signal2 = await getWeather(19.076, 72.877, false);
    assert.strictEqual(signal2.rainfall24h_mm, 15.2);
    assert.strictEqual(callCount, 1);

    // Third call with close coords (should round to same 2 decimals -> 19.08, 72.88)
    const signal3 = await getWeather(19.077, 72.878, false);
    assert.strictEqual(signal3.rainfall24h_mm, 15.2);
    assert.strictEqual(callCount, 1);
  } finally {
    global.fetch = originalFetch;
  }
});

test('getWeather throws UpstreamError when Open-Meteo fails', async () => {
  weatherCache.clear();

  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: false,
    status: 500
  } as any);

  try {
    await assert.rejects(
      getWeather(19.076, 72.877, false),
      UpstreamError
    );
  } finally {
    global.fetch = originalFetch;
  }
});
