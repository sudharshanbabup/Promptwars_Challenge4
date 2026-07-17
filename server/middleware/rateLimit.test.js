import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TokenBucket } from './rateLimit.js';

test('TokenBucket allows requests up to max capacity', () => {
  const bucket = new TokenBucket(3, 1 / 1000);
  assert.ok(bucket.allowRequest('127.0.0.1'));
  assert.ok(bucket.allowRequest('127.0.0.1'));
  assert.ok(bucket.allowRequest('127.0.0.1'));
});

test('TokenBucket blocks requests beyond capacity', () => {
  const bucket = new TokenBucket(2, 1 / 1000);
  assert.ok(bucket.allowRequest('127.0.0.1'));
  assert.ok(bucket.allowRequest('127.0.0.1'));
  assert.ok(!bucket.allowRequest('127.0.0.1'));
});

test('TokenBucket refleshes tokens over time', () => {
  const bucket = new TokenBucket(2, 1 / 1000);
  const now = Date.now();
  assert.ok(bucket.allowRequest('127.0.0.1', now));
  assert.ok(bucket.allowRequest('127.0.0.1', now));
  assert.ok(!bucket.allowRequest('127.0.0.1', now));

  // Forward time by 1000ms, refills 1 token
  assert.ok(bucket.allowRequest('127.0.0.1', now + 1000));
  assert.ok(!bucket.allowRequest('127.0.0.1', now + 1000));
});
