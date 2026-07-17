import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankModes } from './co2Rank.js';

test('rankModes sorts travel modes by eco-friendliness', () => {
  const input = ['car', 'walk', 'transit'];
  const ranked = rankModes(input);
  
  assert.strictEqual(ranked.length, 3);
  assert.strictEqual(ranked[0].mode, 'walk');
  assert.strictEqual(ranked[1].mode, 'transit');
  assert.strictEqual(ranked[2].mode, 'car');
});

test('rankModes ignores invalid modes', () => {
  const input = ['rocket', 'walk'];
  const ranked = rankModes(input);
  assert.strictEqual(ranked.length, 1);
  assert.strictEqual(ranked[0].mode, 'walk');
});
