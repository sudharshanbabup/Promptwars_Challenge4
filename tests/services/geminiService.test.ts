import { test } from 'node:test';
import assert from 'node:assert';
import { GeminiService, RiskDigest, geminiCache } from '../../src/services/geminiService.ts';
import { RiskAssessment } from '../../src/domain/types.ts';

const mockAssessment: RiskAssessment = {
  level: 'watch',
  score: 35,
  drivers: ['heavy_rainfall'],
  vulnerabilityMultiplier: 1.0,
  actions: [
    {
      id: 'flowing_water',
      phase: 'during',
      priority: 5,
      titleKey: 'act_flowing_water_title',
      bodyKey: 'act_flowing_water_body',
      icon: 'droplets',
      timeToComplete_min: 5
    }
  ],
  evacuationRecommended: false
};

const mockDigest: RiskDigest = {
  level: 'watch',
  score: 35,
  topDrivers: ['heavy_rainfall'],
  vulnerabilities: [],
  phase: 'during',
  language: 'en'
};

test('GeminiService happy path parses response successfully', async () => {
  geminiCache.clear();
  const fakeResponse = {
    summary: 'Heavy rain is expected.',
    urgencyLine: 'Stay alert.',
    actions: [{ title: 'Avoid water', why: 'Safety first', howLong: '5 mins' }],
    kit: [],
    doNots: [],
    localisedRiskLabel: 'WATCH'
  };

  const fakeClient = {
    models: {
      generateContent: async () => ({
        text: JSON.stringify(fakeResponse)
      })
    }
  };

  const service = new GeminiService(fakeClient);
  const plan = await service.safeGenerate(mockAssessment, mockDigest);

  assert.strictEqual(plan.summary, 'Heavy rain is expected.');
  assert.strictEqual(plan.actions[0].title, 'Avoid water');
});

test('GeminiService fallback triggers on invalid JSON response', async () => {
  geminiCache.clear();
  const fakeClient = {
    models: {
      generateContent: async () => ({
        text: 'Not a JSON object'
      })
    }
  };

  const service = new GeminiService(fakeClient);
  const plan = await service.safeGenerate(mockAssessment, mockDigest);

  // Should degrade silently to deterministic fallback
  assert.ok(plan.summary.includes('Deterministic Safety Mode'));
  assert.strictEqual(plan.actions[0].title, 'Avoid Flowing Water');
});

test('GeminiService fallback triggers on API error', async () => {
  geminiCache.clear();
  const fakeClient = {
    models: {
      generateContent: async () => {
        throw new Error('Quota exceeded');
      }
    }
  };

  const service = new GeminiService(fakeClient);
  const plan = await service.safeGenerate(mockAssessment, mockDigest);

  assert.ok(plan.summary.includes('Deterministic Safety Mode'));
});

test('GeminiService retries once on 5xx error only', async () => {
  geminiCache.clear();
  let callCount = 0;
  const fakeClient = {
    models: {
      generateContent: async () => {
        callCount++;
        if (callCount === 1) {
          const error: any = new Error('Internal Server Error');
          error.status = 503;
          throw error;
        }
        return { text: JSON.stringify({ summary: 'Success on retry' }) } as any;
      }
    }
  };

  const service = new GeminiService(fakeClient);
  const plan = await service.safeGenerate(mockAssessment, mockDigest);

  assert.strictEqual(plan.summary, 'Success on retry');
  assert.strictEqual(callCount, 2);
});

test('GeminiService does not retry on 400 validation error', async () => {
  geminiCache.clear();
  let callCount = 0;
  const fakeClient = {
    models: {
      generateContent: async () => {
        callCount++;
        const error: any = new Error('Bad Request');
        error.status = 400;
        throw error;
      }
    }
  };

  const service = new GeminiService(fakeClient);
  const plan = await service.safeGenerate(mockAssessment, mockDigest);

  // Should instantly fail closed to fallback without retrying
  assert.strictEqual(callCount, 1);
  assert.ok(plan.summary.includes('Deterministic Safety Mode'));
});
