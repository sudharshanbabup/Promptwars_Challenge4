/**
 * Monsoon hazard scoring constants.
 */
export const HAZARD_WEIGHTS = {
  RAINFALL_24H_EXTREME: 40,
  RAINFALL_24H_VERY_HEAVY: 30,
  RAINFALL_24H_HEAVY: 18,
  RAINFALL_FORECAST_72H: 15,
  IMD_ALERT_RED: 35,
  IMD_ALERT_ORANGE: 20,
  IMD_ALERT_YELLOW: 8,
  WIND_SPEED_CYCLONIC: 15,
  THUNDERSTORM: 10,
  RIVER_LEVEL_HIGH: 25
};

/**
 * Vulnerability multiplier increments.
 */
export const VULNERABILITY_WEIGHTS = {
  INFANT: 0.15,
  SENIOR: 0.15,
  DISABLED: 0.20,
  PREGNANT: 0.20,
  HIGH_RISK_DWELLING: 0.15, // ground_floor, kutcha, coastal, hillside
  CHRONIC_POWER_DEPENDENT: 0.10, // dialysis, oxygen, cardiac
  LIVESTOCK: 0.05,
  GENERATOR_DISCOUNT: -0.05
};

/**
 * Risk level score boundaries.
 */
export const RISK_THRESHOLDS = {
  EMERGENCY: 75,
  WARNING: 50,
  WATCH: 25
};

/**
 * Flowing water travel danger thresholds (cm).
 */
export const TRAVEL_THRESHOLDS = {
  FOOT_FLOWING_WATER_MAX_CM: 15,
  VEHICLE_FLOWING_WATER_MAX_CM: 30
};
