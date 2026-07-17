/**
 * Pure helper logic to compute dynamic stadium sustainability metrics by event hour.
 */

/**
 * Returns mock stadium sustainability metric percentages.
 * 
 * @param {number} hour - Hour of the day (0-23).
 * @returns {{
 *   wasteDivertedPercent: number,
 *   waterSavedPercent: number,
 *   renewableEnergyPercent: number,
 *   transitSharePercent: number
 * }} Sustainability metrics.
 */
export function getMetrics(hour) {
  // Let metrics vary slightly by time of day to simulate dynamic updates
  const factor = (hour % 6) * 2;

  return {
    wasteDivertedPercent: Math.min(100, 72 + factor),
    waterSavedPercent: Math.min(100, 58 + factor * 1.5),
    renewableEnergyPercent: Math.min(100, 85 + (hour >= 18 || hour <= 6 ? -15 : 10)),
    transitSharePercent: Math.min(100, 64 + factor)
  };
}
