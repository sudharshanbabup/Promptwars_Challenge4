/**
 * Carbon footprint classification helper for transportation modes.
 */

const CO2_RATINGS = {
  walk: { co2: 'Zero', score: 0, reason: 'Zero tailpipe emissions.' },
  transit: { co2: 'Low', score: 1, reason: 'High capacity public transport.' },
  bike: { co2: 'Zero', score: 0, reason: 'Human powered travel.' },
  ev: { co2: 'Low', score: 1, reason: 'Electric powertrain with zero point emissions.' },
  car: { co2: 'High', score: 4, reason: 'Single occupant combustion vehicle.' },
  rideshare: { co2: 'Medium', score: 2, reason: 'Shared trip in typical sedan.' }
};

/**
 * Classifies and ranks a list of travel modes based on carbon footprint.
 * 
 * @param {string[]} modes - Array of travel modes to rank.
 * @returns {Array<{mode: string, co2: string, reason: string}>} Ranked mode summaries.
 */
export function rankModes(modes) {
  if (!Array.isArray(modes)) {
    return [];
  }

  return modes
    .filter(m => !!CO2_RATINGS[m.toLowerCase()])
    .map(m => ({
      mode: m,
      co2: CO2_RATINGS[m.toLowerCase()].co2,
      reason: CO2_RATINGS[m.toLowerCase()].reason,
      score: CO2_RATINGS[m.toLowerCase()].score
    }))
    .sort((a, b) => a.score - b.score);
}
