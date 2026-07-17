/**
 * Pure helper logic compiling stadium operations fallback plans.
 */

/**
 * Returns a complete offline-ready advisory plan based on user profile and risk levels.
 * 
 * @param {object} assessment - Operations risk assessment.
 * @param {object} profile - User configuration profile.
 * @returns {string} Fully readable fallback instruction text.
 */
export function compileFallbackPlan(assessment, profile) {
  const role = profile.role || 'fan';
  const zone = profile.zone || 'Zone A (Gates)';
  const level = assessment.level || 'Safe';

  const planLines = [
    `[Deterministic Operations Safety Mode - Level: ${level}]`,
    `Current Location Context: ${zone}`,
    `Assigned Role Protocol: ${role.toUpperCase()}`
  ];

  if (assessment.score > 40) {
    planLines.push('• REDIRECT transit: High crowd congestion active; follow perimeter detour signs.');
  } else {
    planLines.push('• Standard lanes are open. Keep walking pathways clear.');
  }

  const access = profile.accessibility || {};
  if (access.wheelchair) {
    planLines.push('• Accessibility notice: Elevators near Section 106 and Gate C are fully operational.');
  }
  if (access.sensorySensitive) {
    planLines.push('• Sensory notice: Noise levels high; sensory room near Room 112 is open.');
  }

  planLines.push('• Check overhead video boards for real-time schedule and gate changes.');
  return planLines.join('\n');
}
