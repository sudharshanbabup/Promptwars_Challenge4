import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assistHandler } from '../../src/server/routes/assist.js';

// Configure test environment variable
process.env.NODE_ENV = 'test';

test('assistHandler succeeds with valid parameters', async () => {
  const req = {
    body: {
      feature: 'navigation',
      role: 'fan',
      payload: { query: 'Find Section 112' }
    }
  };

  let jsonResult = null;
  const res = {
    json: (data) => {
      jsonResult = data;
    },
    status: () => res
  };

  await assistHandler(req, res);
  assert.ok(jsonResult);
  assert.strictEqual(jsonResult.text, 'Mocked AI response for feature navigation and role fan');
});

test('assistHandler rejects invalid choice parameters', async () => {
  const req = {
    body: {
      feature: 'hacker-feature',
      role: 'fan',
      payload: { query: 'test' }
    }
  };

  let statusCode = null;
  let jsonResult = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResult = data;
    }
  };

  await assistHandler(req, res);
  assert.strictEqual(statusCode, 400);
  assert.ok(jsonResult.error.includes('Validation failed'));
});

test('assistHandler rejects invalid payload parameter', async () => {
  const req = {
    body: {
      feature: 'navigation',
      role: 'fan',
      payload: 'invalid-payload-string'
    }
  };

  let statusCode = null;
  let jsonResult = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResult = data;
    }
  };

  await assistHandler(req, res);
  assert.strictEqual(statusCode, 400);
  assert.strictEqual(jsonResult.error, 'Payload must be a valid JSON object');
});
