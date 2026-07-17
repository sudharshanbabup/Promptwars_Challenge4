/**
 * Operations live telemetry service simulating stadium queue and zone crowd density statuses.
 */

/**
 * Returns latest stadium operations telemetry log status.
 * 
 * @returns {{queues: object, zoneDensities: object, activeIncidents: string[]}} Latest telemetry.
 */
export function getLiveTelemetry() {
  const currentHour = new Date().getHours();
  let peakMultiplier = 1.0;

  // Predict peak matchday timings
  if ((currentHour >= 12 && currentHour <= 14) || (currentHour >= 18 && currentHour <= 21)) {
    peakMultiplier = 2.5;
  }

  const queues = {
    'Gate A (Security)': Math.round(8 * peakMultiplier),
    'Gate B (General Admission)': Math.round(12 * peakMultiplier),
    'Gate C (VIP/Media)': Math.round(3 * peakMultiplier),
    'Concourse Food Outlets': Math.round(15 * peakMultiplier)
  };

  const zoneDensities = {
    'Zone A (Gates)': peakMultiplier > 2.0 ? 'High' : 'Medium',
    'Zone B (Concourse)': peakMultiplier > 2.0 ? 'High' : 'Medium',
    'Zone C (Stands Section 100)': 'Medium',
    'Zone D (Stands Section 200)': 'Low'
  };

  const activeIncidents = [];
  if (peakMultiplier > 2.0) {
    activeIncidents.push('Gate B security queue experiencing heavy crowd load');
    activeIncidents.push('Transit station passenger shuttle delays: 10 mins');
  } else {
    activeIncidents.push('All access gates operating under normal transit conditions');
  }

  return { queues, zoneDensities, activeIncidents };
}
