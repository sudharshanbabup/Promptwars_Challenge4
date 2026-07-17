import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextIndex, prevIndex, firstIndex, lastIndex } from '../../src/client/lib/tablist.js';

test('tablist nextIndex handles normal and boundary cases', () => {
  assert.strictEqual(nextIndex(0, 4), 1);
  assert.strictEqual(nextIndex(3, 4), 0);
  assert.strictEqual(nextIndex(0, 0), 0);
});

test('tablist prevIndex handles normal and boundary cases', () => {
  assert.strictEqual(prevIndex(2, 4), 1);
  assert.strictEqual(prevIndex(0, 4), 3);
  assert.strictEqual(prevIndex(0, 0), 0);
});

test('tablist firstIndex and lastIndex are correct', () => {
  assert.strictEqual(firstIndex(), 0);
  assert.strictEqual(lastIndex(4), 3);
  assert.strictEqual(lastIndex(0), 0);
});
