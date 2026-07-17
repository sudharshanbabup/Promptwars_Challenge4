import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortBySeverity, topN } from './prioritize.js';

test('sortBySeverity places High severity first', () => {
  const input = [
    { id: '1', severity: 'Low' },
    { id: '2', severity: 'High' },
    { id: '3', severity: 'Medium' }
  ];

  const sorted = sortBySeverity(input);
  assert.strictEqual(sorted[0].id, '2');
  assert.strictEqual(sorted[1].id, '3');
  assert.strictEqual(sorted[2].id, '1');
});

test('topN returns correctly truncated array length', () => {
  const input = [
    { id: '1', severity: 'Low' },
    { id: '2', severity: 'High' },
    { id: '3', severity: 'Medium' }
  ];

  const filtered = topN(input, 2);
  assert.strictEqual(filtered.length, 2);
  assert.strictEqual(filtered[0].id, '2');
  assert.strictEqual(filtered[1].id, '3');
});
