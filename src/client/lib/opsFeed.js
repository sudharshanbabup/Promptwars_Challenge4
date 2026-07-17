/**
 * Real-time stadium operations signal generator.
 */

const SIGNALS = [
  { id: 'sig1', message: 'Gate B queue wait time exceeds 18 minutes', severity: 'Medium', zone: 'Zone A (Gates)', timestamp: '10:02 AM' },
  { id: 'sig2', message: 'Light rainfall forecast starting at 20:00', severity: 'Low', zone: 'Global', timestamp: '10:05 AM' },
  { id: 'sig3', message: 'Medical alert: Section 114 reports heat exhaustion incident', severity: 'High', zone: 'Zone D (Seating)', timestamp: '10:07 AM' },
  { id: 'sig4', message: 'Volunteer shortage reported near Concourse 3 food vendors', severity: 'Medium', zone: 'Zone C (Food Court)', timestamp: '10:10 AM' }
];

/**
 * Returns dynamic ops signals based on hour.
 * 
 * @param {number} hour - Hour of the day (0-23).
 * @returns {Array<{id: string, message: string, severity: string, zone: string, timestamp: string}>} Active signals.
 */
export function getSignals(hour) {
  // Let volunteers see fewer or different items depending on hours
  if (hour >= 18) {
    return [
      ...SIGNALS,
      { id: 'sig5', message: 'Event closing sequence initiated. Direct exit flows.', severity: 'High', zone: 'Zone A (Gates)', timestamp: '10:15 AM' }
    ];
  }
  return SIGNALS;
}
