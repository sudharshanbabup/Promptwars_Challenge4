import { HouseholdProfile, WeatherSignal, RiskAssessment, Rule, Action, RiskDriver } from './types.ts';
import { ACTIONS_MAP } from './actions.ts';
import { HAZARD_WEIGHTS, VULNERABILITY_WEIGHTS, RISK_THRESHOLDS } from '../config/constants.ts';

// Declarative hazard rules
export const RULES: Rule[] = [
  {
    id: 'rain_extreme',
    when: (s) => s.rainfall24h_mm >= 204.5,
    weight: HAZARD_WEIGHTS.RAINFALL_24H_EXTREME,
    driver: 'heavy_rainfall',
    actions: ['flowing_water', 'electrocution', 'gas_cylinder', 'documents']
  },
  {
    id: 'rain_very_heavy',
    when: (s) => s.rainfall24h_mm >= 115.6 && s.rainfall24h_mm < 204.5,
    weight: HAZARD_WEIGHTS.RAINFALL_24H_VERY_HEAVY,
    driver: 'heavy_rainfall',
    actions: ['flowing_water', 'electrocution', 'documents']
  },
  {
    id: 'rain_heavy',
    when: (s) => s.rainfall24h_mm >= 64.5 && s.rainfall24h_mm < 115.6,
    weight: HAZARD_WEIGHTS.RAINFALL_24H_HEAVY,
    driver: 'heavy_rainfall',
    actions: ['flowing_water']
  },
  {
    id: 'forecast_heavy',
    when: (s) => s.rainfallForecast72h_mm >= 200,
    weight: HAZARD_WEIGHTS.RAINFALL_FORECAST_72H,
    driver: 'forecast_rainfall',
    actions: ['documents']
  },
  {
    id: 'imd_red',
    when: (s) => s.imdAlert === 'red',
    weight: HAZARD_WEIGHTS.IMD_ALERT_RED,
    driver: 'imd_alert',
    actions: ['flowing_water', 'electrocution']
  },
  {
    id: 'imd_orange',
    when: (s) => s.imdAlert === 'orange',
    weight: HAZARD_WEIGHTS.IMD_ALERT_ORANGE,
    driver: 'imd_alert',
    actions: ['flowing_water']
  },
  {
    id: 'imd_yellow',
    when: (s) => s.imdAlert === 'yellow',
    weight: HAZARD_WEIGHTS.IMD_ALERT_YELLOW,
    driver: 'imd_alert',
    actions: []
  },
  {
    id: 'wind_cyclonic',
    when: (s) => s.windSpeed_kmph >= 62,
    weight: HAZARD_WEIGHTS.WIND_SPEED_CYCLONIC,
    driver: 'high_winds',
    actions: ['documents']
  },
  {
    id: 'thunderstorm_active',
    when: (s) => s.thunderstorm,
    weight: HAZARD_WEIGHTS.THUNDERSTORM,
    driver: 'thunderstorm',
    actions: ['electrocution']
  },
  {
    id: 'river_level_flood',
    when: (s) => s.riverLevelPct !== undefined && s.riverLevelPct >= 90,
    weight: HAZARD_WEIGHTS.RIVER_LEVEL_HIGH,
    driver: 'high_river_level',
    actions: ['flowing_water', 'electrocution']
  }
];

/**
 * Calculates the base hazard score by summing matching rules.
 * @param signal Current weather readings.
 * @param profile Household characteristics.
 * @param activeDrivers Output array to populate with active drivers.
 * @param actionIds Output set to populate with relevant actions.
 * @returns Base hazard score.
 */
function calculateBaseHazardScore(
  signal: WeatherSignal,
  profile: HouseholdProfile,
  activeDrivers: Set<RiskDriver>,
  actionIds: Set<string>
): number {
  let score = 0;
  for (const rule of RULES) {
    if (rule.when(signal, profile)) {
      score += rule.weight;
      activeDrivers.add(rule.driver);
      rule.actions.forEach(actId => actionIds.add(actId));
    }
  }
  return score;
}

/**
 * Calculates the vulnerability multiplier based on household properties.
 * @param profile Household characteristics.
 * @returns Multiplier value between 1.0 and 2.0.
 */
export function calculateVulnerabilityMultiplier(profile: HouseholdProfile): number {
  let multiplier = 1.0;
  multiplier += profile.members.infants * VULNERABILITY_WEIGHTS.INFANT;
  multiplier += profile.members.seniors * VULNERABILITY_WEIGHTS.SENIOR;
  multiplier += profile.members.disabled * VULNERABILITY_WEIGHTS.DISABLED;
  if (profile.members.pregnant > 0) multiplier += VULNERABILITY_WEIGHTS.PREGNANT;

  const isHighRiskDwelling = ['kutcha', 'ground_floor', 'coastal', 'hillside'].includes(profile.dwelling);
  if (isHighRiskDwelling) multiplier += VULNERABILITY_WEIGHTS.HIGH_RISK_DWELLING;

  const hasPowerDepIllness = profile.members.chronicIllness.some(ill =>
    ['dialysis', 'oxygen', 'cardiac'].includes(ill.toLowerCase())
  );
  if (hasPowerDepIllness) multiplier += VULNERABILITY_WEIGHTS.CHRONIC_POWER_DEPENDENT;

  if (profile.assets.livestock > 0) multiplier += VULNERABILITY_WEIGHTS.LIVESTOCK;
  if (profile.assets.hasGenerator) multiplier += VULNERABILITY_WEIGHTS.GENERATOR_DISCOUNT;

  return parseFloat(Math.min(2.0, Math.max(1.0, multiplier)).toFixed(2));
}

/**
 * Maps vulnerability characteristics to actions.
 * @param profile Household characteristics.
 * @param signal Current weather readings.
 * @param actionIds Output set to populate with relevant actions.
 */
function attachProfileSpecificActions(
  profile: HouseholdProfile,
  signal: WeatherSignal,
  actionIds: Set<string>
): void {
  const hasPowerDepIllness = profile.members.chronicIllness.some(ill =>
    ['dialysis', 'oxygen', 'cardiac'].includes(ill.toLowerCase())
  );
  if (hasPowerDepIllness) actionIds.add('medical_equipment');
  if (profile.assets.livestock > 0) actionIds.add('livestock');
  if (profile.dwelling === 'hillside' && (signal.rainfall24h_mm >= 64.5 || signal.rainfallForecast72h_mm >= 200)) {
    actionIds.add('landslide');
  }
}

/**
 * Assesses the overall monsoon risk score and recommends actions.
 * @param signal Current weather readings.
 * @param profile Household characteristics.
 * @returns Full RiskAssessment object.
 */
export function assessRisk(signal: WeatherSignal, profile: HouseholdProfile): RiskAssessment {
  const activeDrivers = new Set<RiskDriver>();
  const actionIds = new Set<string>();

  const baseScore = calculateBaseHazardScore(signal, profile, activeDrivers, actionIds);
  const vulnerabilityMultiplier = calculateVulnerabilityMultiplier(profile);
  const score = Math.min(100, Math.round(baseScore * vulnerabilityMultiplier));

  let level: RiskAssessment['level'] = 'safe';
  if (score >= RISK_THRESHOLDS.EMERGENCY) level = 'emergency';
  else if (score >= RISK_THRESHOLDS.WARNING) level = 'warning';
  else if (score >= RISK_THRESHOLDS.WATCH) level = 'watch';

  attachProfileSpecificActions(profile, signal, actionIds);

  const actions: Action[] = Array.from(actionIds)
    .map(id => ACTIONS_MAP.get(id))
    .filter((a): a is Action => !!a)
    .sort((a, b) => b.priority - a.priority);

  const isHighRiskDwelling = ['kutcha', 'ground_floor', 'coastal'].includes(profile.dwelling);
  const evacuationRecommended = level === 'emergency' && (isHighRiskDwelling || (signal.riverLevelPct !== undefined && signal.riverLevelPct >= 90));

  return {
    level,
    score,
    drivers: Array.from(activeDrivers),
    vulnerabilityMultiplier,
    actions,
    evacuationRecommended
  };
}
