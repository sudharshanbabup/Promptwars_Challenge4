import { test } from 'node:test';
import assert from 'node:assert';
import { buildDeterministicPlan } from '../../src/domain/fallbackPlan.ts';
import { RiskAssessment } from '../../src/domain/types.ts';
import { LANGUAGES } from '../../src/config/languages.ts';

const mockAssessment: RiskAssessment = {
  level: 'warning',
  score: 65,
  drivers: ['heavy_rainfall'],
  vulnerabilityMultiplier: 1.3,
  actions: [
    {
      id: 'flowing_water',
      phase: 'during',
      priority: 5,
      titleKey: 'act_flowing_water_title',
      bodyKey: 'act_flowing_water_body',
      icon: 'droplets',
      timeToComplete_min: 5
    },
    {
      id: 'electrocution',
      phase: 'during',
      priority: 5,
      titleKey: 'act_electrocution_title',
      bodyKey: 'act_electrocution_body',
      icon: 'zap',
      timeToComplete_min: 10
    }
  ],
  evacuationRecommended: false
};

test('FallbackPlan compiles output structure for all supported languages', () => {
  for (const langObj of LANGUAGES) {
    const plan = buildDeterministicPlan(mockAssessment, langObj.code);
    
    assert.ok(plan.summary);
    assert.ok(plan.urgencyLine);
    assert.strictEqual(plan.actions.length, 2);
    assert.ok(plan.actions[0].title);
    assert.ok(plan.actions[0].why);
    assert.ok(plan.actions[0].howLong);
    assert.ok(plan.kit.length > 0);
    assert.ok(plan.doNots.length > 0);
    assert.ok(plan.localisedRiskLabel);
  }
});
