/**
 * Server service calling Google Gemini API with token limits.
 */
import { GoogleGenAI } from '@google/genai';
import { compileFallbackPlan } from '../../client/lib/fallbackPlan.js';

let aiInstance = null;

/**
 * Lazily instantiates and returns the Gemini client if API key is present.
 * 
 * @returns {GoogleGenAI|null} Gemini client.
 */
function getClient() {
  if (aiInstance) return aiInstance;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  aiInstance = new GoogleGenAI({ apiKey: key });
  return aiInstance;
}

/**
 * Generates personalized safety and operations briefs based on telemetry.
 * 
 * @param {object} telemetry - Live stadium telemetry.
 * @param {object} assessment - Deterministic risk evaluation.
 * @param {object} profile - Visitor demographic configuration.
 * @returns {Promise<string>} Plan markdown string.
 */
export async function generateAIAssessment(telemetry, assessment, profile) {
  const client = getClient();
  const fallback = compileFallbackPlan(assessment, profile);

  if (!client) {
    console.warn('[Gemini Client]: Missing API Key. Servicing offline fallback.');
    return fallback;
  }

  const prompt = `
You are the FIFA World Cup 2026 Smart Stadium Operations safety AI.
Evaluate the following telemetry data and user profile to output a highly personalized, friendly action plan.

Live Stadium Telemetry:
- Queue Wait Times: ${JSON.stringify(telemetry.queues)}
- Crowd Densities: ${JSON.stringify(telemetry.zoneDensities)}
- Active Incidents: ${telemetry.activeIncidents.join(', ')}

Visitor Context:
- Role: ${profile.role}
- Zone: ${profile.zone}
- Accessibility Needs: ${JSON.stringify(profile.accessibility)}
- Target Language: ${profile.language}

Deterministic Advisory Assessment:
- Operations Congestion Risk Score: ${assessment.score}/100
- Advisory Level: ${assessment.level}
- Primary Risk Drivers: ${assessment.drivers.join('; ')}

Strict constraint: Write a concise layout guide (under 15 lines) of operations directions tailored for this visitor. Use markdown.
Always append this notice: "AI guidance — always follow local stadium steward orders and World Cup safety protocol."
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || fallback;
  } catch (error) {
    console.error('[Gemini Generation Failed]:', error);
    return fallback;
  }
}

/**
 * Handles conversational operations assistant messages.
 * 
 * @param {string} message - User query.
 * @param {object} digest - Operations risk digest object.
 * @param {Array} history - Conversational turn history.
 * @returns {Promise<string>} AI chat response text.
 */
export async function generateAIChat(message, digest, history) {
  const client = getClient();
  const fallback = 'Operations center offline fallback: Please consult a stadium steward or follow overhead screens.';

  if (!client) return fallback;

  const chatHistory = history.map(turn => ({
    role: turn.role === 'user' ? 'user' : 'model',
    parts: [{ text: turn.text }]
  }));

  const systemInstruction = `
You are the FIFA World Cup 2026 operations assistant. 
Help the user navigate stadium zones safely.
Your safety profile context is:
- Zone Level: ${digest.level}
- Zone Score: ${digest.score}/100
- Vulnerabilities: ${JSON.stringify(digest.vulnerabilities)}
- Language: ${digest.language}

Strict constraints: Keep response under 3 sentences. Never invent weather, alert levels, or helpline numbers.
  `;

  try {
    const chat = client.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
      history: chatHistory
    });

    const response = await chat.sendMessage({ message });
    return response.text || fallback;
  } catch (error) {
    console.error('[Gemini Chat Failed]:', error);
    return fallback;
  }
}
