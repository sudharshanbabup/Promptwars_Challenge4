import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

/**
 * Initializes and returns the Google GenAI client instance.
 * 
 * @returns {GoogleGenAI} The GenAI client.
 * @throws {Error} If GEMINI_API_KEY is not defined.
 */
function getAiClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

/**
 * Sends a generation request to the Gemini 2.5 Flash model.
 * 
 * @param {object} params - Input parameters.
 * @param {string} params.system - System instruction context.
 * @param {string} params.user - User message prompt.
 * @returns {Promise<{text: string}>} The generated text result.
 * @throws {Error} If the API call fails or inputs are invalid.
 */
export async function generate({ system, user }) {
  if (!system || !user) {
    throw new Error('Both system and user prompts are required');
  }

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: user }] }],
      config: {
        systemInstruction: system,
        maxOutputTokens: 1000,
        // Suppress thinking tokens to save latency and cost
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return { text: response.text || 'No response generated.' };
  } catch (error) {
    console.error('[Gemini Client Error]:', error.message || error);
    throw new Error(`AI generation failed: ${error.message || 'Unknown network error'}`);
  }
}
