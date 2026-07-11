import { test } from 'node:test';
import assert from 'node:assert';
import { LruTtlCache } from '../../src/services/cache.ts';

test('Cache basic set and get', () => {
  const cache = new LruTtlCache<string, number>();
  cache.set('a', 1);
  assert.strictEqual(cache.get('a'), 1);
  assert.strictEqual(cache.get('b'), undefined);
});

test('Cache LRU eviction order', () => {
  // Max size 3
  const cache = new LruTtlCache<string, number>(3);
  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('c', 3);

  // 'a' is LRU. Accessing 'b' makes 'b' recently used.
  cache.get('b');

  // Insert 'd', triggering eviction. 'a' (LRU) should be evicted.
  cache.set('d', 4);

  assert.strictEqual(cache.get('a'), undefined);
  assert.strictEqual(cache.get('b'), 2);
  assert.strictEqual(cache.get('c'), 3);
  assert.strictEqual(cache.get('d'), 4);
});

test('Cache TTL expiration with mock clock', () => {
  let currentTime = 1000;
  const mockClock = () => currentTime;

  // Max size 10, TTL 500ms
  const cache = new LruTtlCache<string, number>(10, 500, mockClock);

  cache.set('a', 100);

  // Time progresses to 1400 (under TTL 500) -> should be valid
  currentTime = 1400;
  assert.strictEqual(cache.get('a'), 100);

  // Time progresses to 1600 (over TTL 500) -> should be expired
  currentTime = 1600;
  assert.strictEqual(cache.get('a'), undefined);
});

test('Cache hit rate calculation', () => {
  const cache = new LruTtlCache<string, number>();
  
  // No hits/misses yet
  assert.strictEqual(cache.getHitRate(), 0.0);

  cache.set('a', 1);

  // 1 hit, 1 miss
  cache.get('a'); // hit
  cache.get('b'); // miss

  assert.strictEqual(cache.getHitRate(), 0.5);
  
  const metrics = cache.getMetrics();
  assert.strictEqual(metrics.hits, 1);
  assert.strictEqual(metrics.misses, 1);
  assert.strictEqual(metrics.size, 1);
});
