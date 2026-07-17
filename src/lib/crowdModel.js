/**
 * Pure helper logic to resolve stadium zone congestion rates deterministically.
 */

const ZONES = ['Zone A (Gates)', 'Zone B (Concourse)', 'Zone C (Food Court)', 'Zone D (Seating)'];

/**
 * Mocks and calculates zone congestion based on time-of-day.
 * 
 * @param {string} zoneId - The zone name/id.
 * @param {number} hour - Hour of the day (0-23).
 * @returns {string} 'Low', 'Medium', or 'High' congestion rating.
 */
export function getCongestion(zoneId, hour) {
  if (!ZONES.includes(zoneId)) {
    return 'Low';
  }

  // Peak operations hours around stadium events (e.g. 18:00 - 21:00)
  if (hour >= 17 && hour <= 21) {
    if (zoneId === 'Zone A (Gates)' || zoneId === 'Zone C (Food Court)') {
      return 'High';
    }
    return 'Medium';
  }

  if (hour >= 12 && hour <= 14) {
    return 'Medium';
  }

  return 'Low';
}
