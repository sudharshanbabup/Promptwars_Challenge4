import { test } from 'node:test';
import assert from 'node:assert';
import { assessRisk, calculateVulnerabilityMultiplier } from '../../src/domain/riskEngine.ts';
import { WeatherSignal, HouseholdProfile } from '../../src/domain/types.ts';

// Baseline entities for testing
const baseSignal: WeatherSignal = {
  rainfall24h_mm: 0,
  rainfallForecast72h_mm: 0,
  windSpeed_kmph: 0,
  imdAlert: 'none',
  isCoastal: false,
  thunderstorm: false
};

const baseProfile: HouseholdProfile = {
  location: { lat: 19.076, lon: 72.877 },
  dwelling: 'upper_floor',
  members: {
    infants: 0,
    children: 0,
    adults: 2,
    seniors: 0,
    pregnant: 0,
    disabled: 0,
    chronicIllness: []
  },
  assets: {
    hasVehicle: false,
    pets: 0,
    livestock: 0,
    hasGenerator: false
  },
  connectivity: {
    hasSmartphone: true,
    hasPowerBackup: true
  },
  language: 'en'
};

test('Vulnerability Multiplier calculation cases', () => {
  // Base case: multiplier should be 1.0
  assert.strictEqual(calculateVulnerabilityMultiplier(baseProfile), 1.0);

  // Infant-only: 1 infant -> +0.15 = 1.15
  const infantProfile: HouseholdProfile = {
    ...baseProfile,
    members: { ...baseProfile.members, infants: 1 }
  };
  assert.strictEqual(calculateVulnerabilityMultiplier(infantProfile), 1.15);

  // Senior + Disabled: 1 senior (+0.15) + 1 disabled (+0.20) = 1.35
  const seniorDisabledProfile: HouseholdProfile = {
    ...baseProfile,
    members: { ...baseProfile.members, seniors: 1, disabled: 1 }
  };
  assert.strictEqual(calculateVulnerabilityMultiplier(seniorDisabledProfile), 1.35);

  // Kutcha dwelling (+0.15) + Pregnant member (+0.20) = 1.35
  const kutchaPregnantProfile: HouseholdProfile = {
    ...baseProfile,
    dwelling: 'kutcha',
    members: { ...baseProfile.members, pregnant: 1 }
  };
  assert.strictEqual(calculateVulnerabilityMultiplier(kutchaPregnantProfile), 1.35);

  // Generator discount: base 1.35 - generator 0.05 = 1.30
  const generatorDiscountProfile: HouseholdProfile = {
    ...kutchaPregnantProfile,
    assets: { ...baseProfile.assets, hasGenerator: true }
  };
  assert.strictEqual(calculateVulnerabilityMultiplier(generatorDiscountProfile), 1.30);

  // Cap test: multiplier should cap at 2.0
  const maxVulnerabilityProfile: HouseholdProfile = {
    ...baseProfile,
    dwelling: 'kutcha',
    members: {
      infants: 4,
      children: 2,
      adults: 2,
      seniors: 4,
      pregnant: 1,
      disabled: 4,
      chronicIllness: ['dialysis']
    }
  };
  assert.strictEqual(calculateVulnerabilityMultiplier(maxVulnerabilityProfile), 2.0);
});

test('Boundary value tests for rainfall, alerts, and wind speed', () => {
  // Heavy rainfall boundaries
  // 64.4 mm (no rule) vs 64.5 mm (+18)
  const signalRain64_4: WeatherSignal = { ...baseSignal, rainfall24h_mm: 64.4 };
  const signalRain64_5: WeatherSignal = { ...baseSignal, rainfall24h_mm: 64.5 };
  assert.strictEqual(assessRisk(signalRain64_4, baseProfile).score, 0);
  assert.strictEqual(assessRisk(signalRain64_5, baseProfile).score, 18);

  // 115.5 mm (+18) vs 115.6 mm (+30)
  const signalRain115_5: WeatherSignal = { ...baseSignal, rainfall24h_mm: 115.5 };
  const signalRain115_6: WeatherSignal = { ...baseSignal, rainfall24h_mm: 115.6 };
  assert.strictEqual(assessRisk(signalRain115_5, baseProfile).score, 18);
  assert.strictEqual(assessRisk(signalRain115_6, baseProfile).score, 30);

  // 204.4 mm (+30) vs 204.5 mm (+40)
  const signalRain204_4: WeatherSignal = { ...baseSignal, rainfall24h_mm: 204.4 };
  const signalRain204_5: WeatherSignal = { ...baseSignal, rainfall24h_mm: 204.5 };
  assert.strictEqual(assessRisk(signalRain204_4, baseProfile).score, 30);
  assert.strictEqual(assessRisk(signalRain204_5, baseProfile).score, 40);

  // IMD Alert level boundaries
  const alertNone: WeatherSignal = { ...baseSignal, imdAlert: 'none' };
  const alertYellow: WeatherSignal = { ...baseSignal, imdAlert: 'yellow' };
  const alertOrange: WeatherSignal = { ...baseSignal, imdAlert: 'orange' };
  const alertRed: WeatherSignal = { ...baseSignal, imdAlert: 'red' };
  assert.strictEqual(assessRisk(alertNone, baseProfile).score, 0);
  assert.strictEqual(assessRisk(alertYellow, baseProfile).score, 8);
  assert.strictEqual(assessRisk(alertOrange, baseProfile).score, 20);
  assert.strictEqual(assessRisk(alertRed, baseProfile).score, 35);

  // Wind speed boundaries
  // 61 kmph (no rule) vs 62 kmph (+15)
  const wind61: WeatherSignal = { ...baseSignal, windSpeed_kmph: 61 };
  const wind62: WeatherSignal = { ...baseSignal, windSpeed_kmph: 62 };
  assert.strictEqual(assessRisk(wind61, baseProfile).score, 0);
  assert.strictEqual(assessRisk(wind62, baseProfile).score, 15);
});

test('Score cap and evacuation recommendations', () => {
  // Evacuation Recommended truth table cases
  // Safe score (0) -> evacuation false
  assert.strictEqual(assessRisk(baseSignal, baseProfile).evacuationRecommended, false);

  // Emergency level (extreme rain 40 + imd red 35 = 75)
  // ground_floor dwelling -> evacuation recommended true
  const emergencySignal: WeatherSignal = { ...baseSignal, rainfall24h_mm: 204.5, imdAlert: 'red' };
  const groundFloorProfile: HouseholdProfile = { ...baseProfile, dwelling: 'ground_floor' };
  assert.strictEqual(assessRisk(emergencySignal, groundFloorProfile).evacuationRecommended, true);

  // Emergency level, upper_floor dwelling -> evacuation recommended false
  assert.strictEqual(assessRisk(emergencySignal, baseProfile).evacuationRecommended, false);

  // Emergency level, upper_floor, but river level 90% -> evacuation recommended true
  const riverSignal: WeatherSignal = { ...emergencySignal, riverLevelPct: 90 };
  assert.strictEqual(assessRisk(riverSignal, baseProfile).evacuationRecommended, true);
});

test('Property-based testing: Risk score is monotonic', () => {
  // Increasing rainfall should never decrease the risk score
  let lastScore = 0;
  for (let rain = 0; rain <= 300; rain += 5) {
    const signal: WeatherSignal = { ...baseSignal, rainfall24h_mm: rain };
    const currentScore = assessRisk(signal, baseProfile).score;
    assert.ok(currentScore >= lastScore, `Rainfall increase decreased score from ${lastScore} to ${currentScore} at rain ${rain}mm`);
    lastScore = currentScore;
  }
});
