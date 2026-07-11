import { test } from 'node:test';
import assert from 'node:assert';

// 1. Establish testing environment variables first.
// Dynamic import prevents ES Module hoisting from loading the server prematurely.
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'mock-test-gemini-key';

const { app } = await import('../../src/server/index.ts');

test('Express GET /api/emergency returns correct static list', async () => {
  const server = app.listen(0);
  const address = server.address() as any;
  const port = address.port;

  try {
    const res = await fetch(`http://localhost:${port}/api/emergency`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.nationalEmergency, '112');
    assert.strictEqual(data.ambulance, '108');
  } finally {
    server.close();
  }
});

test('Express GET /api/alerts checks query boundaries', async () => {
  const server = app.listen(0);
  const address = server.address() as any;
  const port = address.port;

  try {
    const res1 = await fetch(`http://localhost:${port}/api/alerts`);
    assert.strictEqual(res1.status, 400);

    const res2 = await fetch(`http://localhost:${port}/api/alerts?lat=95.0&lon=72.0`);
    assert.strictEqual(res2.status, 400);

    // Set up smart fetch interceptor
    const originalFetch = global.fetch;
    global.fetch = async (url: any, init?: any) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes('open-meteo.com')) {
        return {
          ok: true,
          json: async () => ({
            daily: {
              precipitation_sum: [0.0, 0.0, 0.0],
              wind_speed_10m_max: [0.0, 0.0, 0.0],
              weather_code: [3, 3, 3]
            }
          })
        } as any;
      }
      return originalFetch(url, init);
    };

    try {
      const res3 = await fetch(`http://localhost:${port}/api/alerts?lat=19.08&lon=72.88`);
      assert.strictEqual(res3.status, 200);
      const data = await res3.json();
      assert.strictEqual(data.level, 'safe');
    } finally {
      global.fetch = originalFetch;
    }
  } finally {
    server.close();
  }
});

test('Express GET /api/health returns metrics', async () => {
  const server = app.listen(0);
  const address = server.address() as any;
  const port = address.port;

  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.ok(typeof data.uptime === 'number');
  } finally {
    server.close();
  }
});
