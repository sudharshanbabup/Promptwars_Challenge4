import express from 'express';
import { sanitizeChoice, sanitizeText } from '../lib/sanitize.js';
import { generate } from '../lib/geminiClient.js';
import { prompts } from '../lib/prompts.js';

const router = express.Router();

const ALLOWED_FEATURES = ['navigation', 'accessibility', 'multilingual', 'sustainability', 'ops'];
const ALLOWED_ROLES = ['fan', 'organizer', 'volunteer', 'staff'];

/**
 * Express POST /api/assist route handler.
 * Proxies and sanitizes user queries to Google Gemini.
 */
router.post('/api/assist', async (req, res) => {
  try {
    const { feature, role, payload } = req.body;

    // 1. Validate parameters against strict allow-lists
    const cleanFeature = sanitizeChoice(feature, ALLOWED_FEATURES);
    const cleanRole = sanitizeChoice(role, ALLOWED_ROLES);

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Payload must be a valid JSON object' });
    }

    // 2. Sanitize payload properties
    const cleanPayload = {};
    for (const [key, val] of Object.entries(payload)) {
      if (typeof val === 'string') {
        cleanPayload[key] = sanitizeText(val);
      } else if (typeof val === 'boolean' || typeof val === 'number') {
        cleanPayload[key] = val;
      } else if (Array.isArray(val)) {
        cleanPayload[key] = val.map(item => typeof item === 'string' ? sanitizeText(item) : item);
      } else if (val && typeof val === 'object') {
        cleanPayload[key] = val; // Nested structures passed as-is
      }
    }

    // 3. Select prompt and invoke Gemini
    const systemPrompt = prompts[cleanFeature];
    const userPrompt = `Role Context: ${cleanRole}. Inputs: ${JSON.stringify(cleanPayload)}`;

    const result = await generate({ system: systemPrompt, user: userPrompt });

    res.json({ text: result.text });
  } catch (error) {
    console.error('[API Proxy Error]:', error.message || error);
    res.status(500).json({
      error: 'An operational safety engine error occurred. Please follow physical stadium signs.'
    });
  }
});

export { router as assistRouter };
