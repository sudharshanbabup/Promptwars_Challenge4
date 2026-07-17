import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { assistRouter } from '../../src/server/routes/assist.js';

const app = express();
app.use(express.json());
app.use(assistRouter);

test('POST /api/assess returns valid assessment payload', async () => {
  // Mock request using a simple fetch-like execution context or calling handlers directly
  let jsonResult = null;
  const req = {
    body: {
      role: 'fan',
      zone: 'Zone A (Gates)',
      accessibility: { wheelchair: true },
      language: 'en'
    }
  };
  const res = {
    json: (data) => {
      jsonResult = data;
    }
  };

  // Find POST /api/assess route
  const route = assistRouter.stack.find(s => s.route?.path === '/api/assess');
  await route.route.stack[0].handle(req, res);

  assert.ok(jsonResult);
  assert.ok(jsonResult.assessment);
  assert.strictEqual(typeof jsonResult.assessment.score, 'number');
  assert.ok(jsonResult.plan);
});

test('POST /api/chat returns response', async () => {
  let jsonResult = null;
  const req = {
    body: {
      message: 'Where is section 100?',
      profileDigest: { level: 'Safe', score: 20, vulnerabilities: [], language: 'en' },
      history: []
    }
  };
  const res = {
    json: (data) => {
      jsonResult = data;
    }
  };

  const route = assistRouter.stack.find(s => s.route?.path === '/api/chat');
  await route.route.stack[0].handle(req, res);

  assert.ok(jsonResult);
  assert.ok(jsonResult.text);
});

test('GET /api/alerts returns safety alerts', async () => {
  let jsonResult = null;
  const req = { query: { lat: '40.81', lon: '-74.07' } };
  const res = {
    json: (data) => {
      jsonResult = data;
    }
  };

  const route = assistRouter.stack.find(s => s.route?.path === '/api/alerts');
  await route.route.stack[0].handle(req, res);

  assert.ok(jsonResult);
  assert.strictEqual(typeof jsonResult.score, 'number');
});
