/**
 * Language support validation and listing module.
 */

export const SUPPORTED_LANGUAGES = ['EN', 'ES', 'FR', 'AR', 'PT', 'DE', 'JA', 'KO', 'HI', 'IT', 'NL', 'ZH'];

/**
 * Validates the source and target language parameters.
 * 
 * @param {string} source - Source language code.
 * @param {string} target - Target language code.
 * @returns {boolean} True if both languages are supported and distinct.
 * @throws {Error} If either language is invalid.
 */
export function validateLangPair(source, target) {
  if (!SUPPORTED_LANGUAGES.includes(source)) {
    throw new Error(`Unsupported source language: ${source}`);
  }
  if (!SUPPORTED_LANGUAGES.includes(target)) {
    throw new Error(`Unsupported target language: ${target}`);
  }
  if (source === target) {
    throw new Error('Source and target languages must be different');
  }
  return true;
}
