/**
 * Sanitizes a string input by removing control characters, trimming,
 * collapsing whitespace, and capping its length.
 * 
 * @param {unknown} input - The raw input to sanitize.
 * @param {object} [options] - Sanitation options.
 * @param {number} [options.maxLen=2000] - The maximum allowed string length.
 * @returns {string} The sanitized string.
 * @throws {Error} If the input is not a string.
 */
export function sanitizeText(input, { maxLen = 2000 } = {}) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Strip ASCII control characters (0x00-0x1F, 0x7F) by replacing with spaces
  let clean = input.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');

  // Collapse consecutive whitespaces into a single space
  clean = clean.replace(/\s+/g, ' ');

  // Trim and slice to max length
  return clean.trim().slice(0, maxLen);
}

/**
 * Validates a value against an array of allowed string choices.
 * 
 * @param {unknown} value - The value to validate.
 * @param {string[]} allowedArray - Allowed choices.
 * @returns {string} The validated choice.
 * @throws {Error} If the value is not in the allowed choices list.
 */
export function sanitizeChoice(value, allowedArray) {
  if (typeof value !== 'string' || !allowedArray.includes(value)) {
    throw new Error(`Invalid choice: ${value}`);
  }
  return value;
}
