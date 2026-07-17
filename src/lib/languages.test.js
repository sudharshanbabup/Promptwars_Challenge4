import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateLangPair } from './languages.js';

test('validateLangPair permits valid language combinations', () => {
  assert.ok(validateLangPair('EN', 'ES'));
  assert.ok(validateLangPair('JA', 'HI'));
});

test('validateLangPair throws on unsupported languages', () => {
  assert.throws(() => validateLangPair('XX', 'EN'), /Unsupported source language/);
  assert.throws(() => validateLangPair('EN', 'YY'), /Unsupported target language/);
});

test('validateLangPair throws when source equals target', () => {
  assert.throws(() => validateLangPair('EN', 'EN'), /Source and target languages must be different/);
});
