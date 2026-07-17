/**
 * Accessibility profile preferences mapping logic.
 */

/**
 * Maps checkbox toggle states to a structured preferences object.
 * 
 * @param {object} toggles - Access toggle states.
 * @param {boolean} toggles.wheelchair - Wheelchair status.
 * @param {boolean} toggles.lowVision - Low vision status.
 * @param {boolean} toggles.hardOfHearing - Hearing status.
 * @param {boolean} toggles.sensorySensitive - Sensory sensitive status.
 * @param {boolean} toggles.serviceAnimal - Service animal status.
 * @returns {object} Structured access preferences.
 */
export function mapTogglesToPrefs(toggles) {
  if (!toggles || typeof toggles !== 'object') {
    return {
      stepFreeRequired: false,
      sensoryFriendlyRequired: false,
      assistanceRequired: false,
      alerts: []
    };
  }

  const alerts = [];
  if (toggles.wheelchair) {
    alerts.push('Step-free route and elevators mandatory.');
  }
  if (toggles.lowVision) {
    alerts.push('Tactile paving and audio guides advised.');
  }
  if (toggles.sensorySensitive) {
    alerts.push('Avoid main concourse pyrotechnics; sensory room near Section 112 is open.');
  }
  if (toggles.serviceAnimal) {
    alerts.push('Service animal relief area near Gate D.');
  }

  return {
    stepFreeRequired: !!toggles.wheelchair,
    sensoryFriendlyRequired: !!toggles.sensorySensitive,
    assistanceRequired: !!(toggles.wheelchair || toggles.lowVision || toggles.serviceAnimal),
    alerts
  };
}
