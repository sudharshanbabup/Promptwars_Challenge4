import { GoogleGenAI } from '@google/genai';
import { LruTtlCache } from './cache.ts';
import { buildDeterministicPlan } from '../domain/fallbackPlan.ts';
import { RiskAssessment, LanguageCode } from '../domain/types.ts';

// Cache for AI responses: 200 entries, 30 min TTL (1,800,000 ms)
export const geminiCache = new LruTtlCache<string, any>(200, 1800000);

export let geminiDegradedCount = 0;

export interface RiskDigest {
  level: string;
  score: number;
  topDrivers: string[];
  vulnerabilities: string[];
  phase: 'before' | 'during' | 'after';
  language: LanguageCode;
}

const planSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    urgencyLine: { type: 'string' },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          why: { type: 'string' },
          howLong: { type: 'string' }
        },
        required: ['title', 'why', 'howLong']
      }
    },
    kit: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: { type: 'string' },
          quantity: { type: 'string' },
          note: { type: 'string' }
        },
        required: ['item', 'quantity', 'note']
      }
    },
    doNots: {
      type: 'array',
      items: { type: 'string' }
    },
    localisedRiskLabel: { type: 'string' }
  },
  required: ['summary', 'urgencyLine', 'actions', 'kit', 'doNots', 'localisedRiskLabel']
};

/**
 * Helper to compute cache keys based on the risk digest signature.
 */
function computeCacheKey(digest: RiskDigest): string {
  const sortedDrivers = [...digest.topDrivers].sort().join(',');
  const sortedVuls = [...digest.vulnerabilities].sort().join(',');
  return `${digest.level}:${sortedDrivers}:${sortedVuls}:${digest.language}:${digest.phase}`;
}

export class GeminiService {
  private client: any;

  /**
   * @param client Injected GoogleGenAI instance for testing.
   */
  constructor(client?: any) {
    this.client = client;
  }

  private getClient() {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not configured');
      }
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  /**
   * Generates a personalized monsoon preparedness plan from a risk assessment.
   * Gracefully degrades to a static deterministic plan on timeout or API error.
   * @param assessment Pre-calculated risk assessment.
   * @param digest Condensed risk digest parameters.
   * @returns Plan schema object.
   */
  public async safeGenerate(
    assessment: RiskAssessment,
    digest: RiskDigest
  ): Promise<any> {
    const cacheKey = computeCacheKey(digest);
    const cached = geminiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    let timeoutId: any;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Gemini API call timed out')), 6000);
    });

    try {
      const apiCallPromise = this.executeAiCall(digest);
      const rawText = await Promise.race([apiCallPromise, timeoutPromise]) as string;
      clearTimeout(timeoutId);

      const parsedPlan = JSON.parse(rawText);
      geminiCache.set(cacheKey, parsedPlan);
      return parsedPlan;
    } catch (err: any) {
      clearTimeout(timeoutId);
      geminiDegradedCount++;
      console.warn(`[GeminiService] AI generation degraded. Reason: ${err.message || err}. Falling back to deterministic plan.`);
      return buildDeterministicPlan(assessment, digest.language);
    }
  }

  private async executeAiCall(digest: RiskDigest): Promise<string> {
    const ai = this.getClient();
    const systemInstruction = `You are a monsoon safety communicator for Indian citizens. You will receive a risk digest that has ALREADY been computed by a deterministic engine. Never contradict it, never invent rainfall figures, alert colours, or helpline numbers. Rewrite the given actions as short, calm, imperative sentences in ${digest.language}, at a 6th-grade reading level, ordered by urgency. Max 12 words per action line. No jargon. No emojis. If a life-safety action is present, keep it first. Output JSON matching the schema.`;

    const prompt = `
<risk_digest>
Level: ${digest.level}
Score: ${digest.score}/100
Drivers: ${digest.topDrivers.join(', ')}
Vulnerabilities: ${digest.vulnerabilities.join(', ')}
Phase: ${digest.phase}
Language: ${digest.language}
</risk_digest>
`;

    // Implement 5xx-only retry logic with 400ms backoff
    const invokeModel = async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: planSchema,
          maxOutputTokens: 900,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text;
    };

    try {
      return await invokeModel();
    } catch (error: any) {
      const is5xx = error.status && error.status >= 500 && error.status < 600;
      if (is5xx) {
        // Backoff retry once
        await new Promise(res => setTimeout(res, 400));
        return await invokeModel();
      }
      throw error;
    }
  }

  /**
   * Safe chat helper to respond to user monsoon queries.
   * Encloses input message in xml tags to defend against prompt-injection.
   */
  public async chat(
    message: string,
    digest: RiskDigest,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[]
  ): Promise<string> {
    const ai = this.getClient();
    const systemInstruction = `You are a helpful, professional monsoon safety assistant. The user is in a region with a monsoon risk level of ${digest.level} (score: ${digest.score}/100) and speaks ${digest.language}. Answer their question in a calm, extremely concise manner. Keep it under 3 sentences. Focus strictly on safety. Do not use markdown headers or lists. Do not use emojis.`;

    try {
      const contents = [
        ...history,
        { role: 'user', parts: [{ text: `<user_message>${message}</user_message>` }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: 300,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text || 'Please follow local safety protocols.';
    } catch (err: any) {
      console.error('[GeminiService] Chat generation failed:', err);
      return 'Please follow your local emergency disaster advice and contact helpline numbers.';
    }
  }
}
