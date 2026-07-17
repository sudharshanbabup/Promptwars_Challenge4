/**
 * Severity ranking arithmetic for operational intelligence decision support.
 */

const SEVERITY_WEIGHTS = {
  High: 3,
  Medium: 2,
  Low: 1
};

/**
 * Sorts signals by severity weight descending.
 * 
 * @param {Array<{severity: string}>} signals - Active signals feed.
 * @returns {Array<{severity: string}>} Sorted signals.
 */
export function sortBySeverity(signals) {
  if (!Array.isArray(signals)) {
    return [];
  }
  return [...signals].sort((a, b) => {
    const wA = SEVERITY_WEIGHTS[a.severity] || 0;
    const wB = SEVERITY_WEIGHTS[b.severity] || 0;
    return wB - wA;
  });
}

/**
 * Filters the top N severe signals.
 * 
 * @param {Array<{severity: string}>} signals - Active signals feed.
 * @param {number} count - Target number of signals to extract.
 * @returns {Array<{severity: string}>} Filtered signals.
 */
export function topN(signals, count) {
  return sortBySeverity(signals).slice(0, count);
}
