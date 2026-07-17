/**
 * Pure risk engine for stadium operations safety assessments.
 */

/**
 * Evaluates stadium telemetry and visitor profile to calculate advisory levels.
 * 
 * @param {object} telemetry - Live stadium telemetry (crowd levels, queues).
 * @param {object} weather - Live weather data (rain, wind).
 * @param {object} profile - Visitor demographic and position profile.
 * @returns {{score: number, level: string, drivers: string[]}} Risk result.
 */
export function assessStadiumRisk(telemetry, weather, profile) {
  let score = 20; // baseline risk score
  const drivers = [];

  // 1. Weather Impact
  if (weather && weather.rain > 0) {
    score += 15;
    drivers.push('Rainfall forecast; wet surfaces and gate delays possible');
  }
  if (weather && weather.windSpeed > 30) {
    score += 15;
    drivers.push('High wind advisory; canopy alerts active');
  }

  // 2. Zone Crowds
  const userZone = profile.zone || 'Zone B (Concourse)';
  const zoneDensity = telemetry.zoneDensities[userZone] || 'Low';
  if (zoneDensity === 'High') {
    score += 25;
    drivers.push(`High density congestion in your zone: ${userZone}`);
  } else if (zoneDensity === 'Medium') {
    score += 10;
  }

  // 3. Queue Times
  const maxQueue = Math.max(...Object.values(telemetry.queues || {}));
  if (maxQueue > 20) {
    score += 15;
    drivers.push('Excessive wait times reported at major stadium turnstiles');
  }

  // 4. Accessibility Needs
  const prefs = profile.accessibility || {};
  if (prefs.wheelchair && zoneDensity === 'High') {
    score += 10;
    drivers.push('High crowd density pose hazard for wheelchair navigation');
  }

  // Cap score
  score = Math.min(100, Math.max(0, score));

  let level = 'Safe';
  if (score > 70) {
    level = 'Emergency';
  } else if (score > 50) {
    level = 'High Congestion';
  } else if (score > 35) {
    level = 'Caution';
  } else if (score > 20) {
    level = 'Alert';
  }

  if (drivers.length === 0) {
    drivers.push('Normal stadium transit conditions');
  }

  return { score, level, drivers };
}
