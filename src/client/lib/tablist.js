/**
 * Tablist index arithmetic for roving tabindex accessibility.
 */

/**
 * Calculates the next index in a circular manner.
 * 
 * @param {number} current - Current tab index.
 * @param {number} total - Total number of tabs.
 * @returns {number} The next index.
 */
export function nextIndex(current, total) {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

/**
 * Calculates the previous index in a circular manner.
 * 
 * @param {number} current - Current tab index.
 * @param {number} total - Total number of tabs.
 * @returns {number} The previous index.
 */
export function prevIndex(current, total) {
  if (total <= 0) return 0;
  return (current - 1 + total) % total;
}

/**
 * Returns the first index.
 * 
 * @returns {number} 0.
 */
export function firstIndex() {
  return 0;
}

/**
 * Returns the last index.
 * 
 * @param {number} total - Total number of tabs.
 * @returns {number} The last index.
 */
export function lastIndex(total) {
  if (total <= 0) return 0;
  return total - 1;
}
