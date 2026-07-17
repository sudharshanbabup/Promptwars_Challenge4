import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeText, sanitizeChoice } from '../../src/server/lib/sanitize.js';

test('sanitizeText throws on non-string', () => {
  assert.throws(() => sanitizeText(123), /Input must be a string/);
  assert.throws(() => sanitizeText(null), /Input must be a string/);
  assert.throws(() => sanitizeText(undefined), /Input must be a string/);
  assert.throws(() => sanitizeText({}), /Input must be a string/);
});

test('sanitizeText strips control characters and collapses whitespace', () => {
  const input = 'Hello\u0000 World!\r\n\tThis   is a   test.';
  const output = sanitizeText(input);
  assert.strictEqual(output, 'Hello World! This is a test.');
});

test('sanitizeText truncates to maxLen', () => {
  const input = 'a'.repeat(2100);
  const output = sanitizeText(input, { maxLen: 2000 });
  assert.strictEqual(output.length, 2000);
  assert.strictEqual(output, 'a'.repeat(2000));
});

test('sanitizeChoice validates correct choices', () => {
  const allowed = ['fan', 'organizer', 'volunteer', 'staff'];
  assert.strictEqual(sanitizeChoice('fan', allowed), 'fan');
  assert.strictEqual(sanitizeChoice('staff', allowed), 'staff');
});

test('sanitizeChoice throws on invalid choice', () => {
  const allowed = ['fan', 'organizer', 'volunteer', 'staff'];
  assert.throws(() => sanitizeChoice('attacker', allowed), /Invalid choice: attacker/);
  assert.throws(() => sanitizeChoice(123, allowed), /Invalid choice: 123/);
});
