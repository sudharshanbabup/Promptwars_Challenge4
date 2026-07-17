/**
 * Parsing utility to format Gemini directions into structured lists and alerts.
 */

/**
 * Splits plain text response into structured route steps and a crowd warning.
 * 
 * @param {string} text - Raw output text from assistant.
 * @returns {{ steps: string[], tip: string }} Structured route directions.
 */
export function parseRoute(text) {
  if (!text) {
    return { steps: [], tip: '' };
  }

  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const steps = [];
  let tip = '';

  for (const line of lines) {
    // Check if line is part of a list (e.g. "1. Go to...", "2. Enter...") or raw step
    if (/^\d+\./.test(line)) {
      steps.push(line.replace(/^\d+\.\s*/, ''));
    } else if (line.toLowerCase().includes('advice') || line.toLowerCase().includes('tip')) {
      tip = line;
    } else if (steps.length > 0 && !tip) {
      // Append non-list text after lists as general warning/tip
      tip = line;
    } else {
      steps.push(line);
    }
  }

  return {
    steps,
    tip: tip || 'Follow dynamic stadium signage for latest flow changes.'
  };
}
