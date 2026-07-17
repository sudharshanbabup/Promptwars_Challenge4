import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAIAssessment, generateAIChat } from '../../src/server/lib/geminiClient.js';

test('generateAIAssessment returns fallback text when API key is missing', async () => {
  const telemetry = { queues: {}, zoneDensities: {}, activeIncidents: [] };
  const assessment = { level: 'Safe', score: 20, drivers: [] };
  const profile = { role: 'fan', zone: 'Zone A (Gates)', accessibility: {} };

  const result = await generateAIAssessment(telemetry, assessment, profile);
  assert.ok(result);
  assert.ok(result.includes('Deterministic Operations Safety Mode'));
});

test('generateAIChat returns fallback response when API key is missing', async () => {
  const digest = { level: 'Safe', score: 20, vulnerabilities: [], language: 'en' };
  const result = await generateAIChat('Hello', digest, []);
  assert.ok(result);
  assert.ok(result.includes('stadium steward'));
});
