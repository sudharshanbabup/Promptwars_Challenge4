import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { join } from 'path';
import { loadEnv } from '../config/env.ts';
import { validateProfile, validatePromptSafety, sanitizeInput } from '../domain/validate.ts';
import { assessRisk } from '../domain/riskEngine.ts';
import { getWeather, weatherCache } from '../services/weatherService.ts';
import { GeminiService, geminiCache, geminiDegradedCount, RiskDigest } from '../services/geminiService.ts';
import { ValidationError, UpstreamError } from '../domain/errors.ts';

// 1. Load configuration and fail fast on missing secrets
loadEnv();

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not defined. Safety advisor will operate in deterministic fallback mode.');
}

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Strict Security Hardening & Compression middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.open-meteo.com"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"]
      }
    }
  })
);
app.use(compression());
app.use(express.json({ limit: '8kb' })); // strictly reject payloads > 8KB

// 3. Configure Rate Limiters
import rateLimit from 'express-rate-limit';

const assessChatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  message: { error: 'Too many requests. Please try again after 5 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const alertsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 120,
  message: { error: 'Too many alerts requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// 4. API Endpoint Handlers

/**
 * POST /api/assess
 * Evaluates weather conditions and user profile to return customized safety plans.
 */
app.post('/api/assess', assessChatLimiter, async (req, res, next) => {
  try {
    const rawProfile = req.body;
    const profile = validateProfile(rawProfile);

    // Logging privacy: log only rounded coordinates, never profile names or details
    const roundedLat = parseFloat(profile.location.lat.toFixed(2));
    const roundedLon = parseFloat(profile.location.lon.toFixed(2));
    console.log(`[API] Assessing risk for rounded coords: ${roundedLat}, ${roundedLon}`);

    const isCoastalDwelling = profile.dwelling === 'coastal';
    const weatherSignal = await getWeather(profile.location.lat, profile.location.lon, isCoastalDwelling);
    const assessment = assessRisk(weatherSignal, profile);

    const digest: RiskDigest = {
      level: assessment.level,
      score: assessment.score,
      topDrivers: assessment.drivers.slice(0, 3),
      vulnerabilities: [
        ...(profile.dwelling === 'kutcha' ? ['kutcha_dwelling'] : []),
        ...(profile.dwelling === 'hillside' ? ['hillside_dwelling'] : []),
        ...(profile.members.infants > 0 ? ['infants_present'] : []),
        ...(profile.members.seniors > 0 ? ['seniors_present'] : []),
        ...(profile.members.pregnant > 0 ? ['pregnant_present'] : []),
        ...(profile.members.disabled > 0 ? ['disabled_present'] : [])
      ],
      phase: 'during',
      language: profile.language
    };

    const geminiService = new GeminiService();
    const plan = await geminiService.safeGenerate(assessment, digest);

    const degraded = plan.summary.includes('Deterministic Safety Mode');

    res.json({
      assessment,
      plan,
      weather: weatherSignal,
      degraded
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/chat
 * Resolves conversational inquiries securely with low latency and token budgets.
 */
app.post('/api/chat', assessChatLimiter, async (req, res, next) => {
  try {
    const { message, profileDigest, history } = req.body;

    if (typeof message !== 'string') {
      throw new ValidationError('Message must be a string.');
    }
    validatePromptSafety(message);
    const cleanMessage = sanitizeInput(message);

    if (!profileDigest || typeof profileDigest !== 'object') {
      throw new ValidationError('Profile digest is required.');
    }

    const formattedHistory = Array.isArray(history) ? history.slice(0, 6) : [];

    const geminiService = new GeminiService();
    const responseText = await geminiService.chat(cleanMessage, profileDigest, formattedHistory);

    res.json({ text: responseText });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/alerts
 * Light-weight, high-frequency cache-polling endpoint.
 */
app.get('/api/alerts', alertsLimiter, async (req, res, next) => {
  try {
    const latStr = req.query.lat;
    const lonStr = req.query.lon;
    if (!latStr || !lonStr) {
      throw new ValidationError('Query parameters lat and lon are required.');
    }

    const lat = parseFloat(latStr as string);
    const lon = parseFloat(lonStr as string);
    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lon) || lon < -180 || lon > 180) {
      throw new ValidationError('Invalid latitude or longitude coordinates.');
    }

    const weatherSignal = await getWeather(lat, lon, false);

    // Compute basic threat level without complete profile details
    const baseProfile = {
      location: { lat, lon },
      dwelling: 'upper_floor' as const,
      members: { infants: 0, children: 0, adults: 1, seniors: 0, pregnant: 0, disabled: 0, chronicIllness: [] },
      assets: { hasVehicle: false, pets: 0, livestock: 0, hasGenerator: false },
      connectivity: { hasSmartphone: true, hasPowerBackup: false },
      language: 'en' as const
    };

    const assessment = assessRisk(weatherSignal, baseProfile);

    res.json({
      level: assessment.level,
      score: assessment.score,
      isCoastal: weatherSignal.isCoastal
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/emergency
 * Static disaster management emergency helpline numbers.
 */
app.get('/api/emergency', (_req, res) => {
  res.json({
    nationalEmergency: '112',
    ambulance: '108',
    districtDisasterControl: '1077',
    ndma: '1078',
    waterWaterlogging: '1916',
    electricity: '1912',
    police: '100',
    fire: '101'
  });
});

/**
 * GET /api/health
 * Returns internal monitoring statistics and cache hit rates.
 */
app.get('/api/health', (_req, res) => {
  const uptime = process.uptime();
  res.json({
    status: 'healthy',
    uptime: parseFloat(uptime.toFixed(1)),
    weatherCache: weatherCache.getMetrics(),
    geminiCache: geminiCache.getMetrics(),
    geminiDegradedCount
  });
});

// 5. Serve client UI bundle in production
app.use(express.static(join(process.cwd(), 'dist')));

// Redirect any unmatched route to client router (supporting SPA routing)
app.get('*', (_req, res) => {
  res.sendFile(join(process.cwd(), 'dist/index.html'));
});

// 6. Global Error Handler Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  const requestId = Math.random().toString(36).substring(2, 9);

  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err instanceof UpstreamError) {
    res.status(502).json({ error: 'Weather or AI service is currently unavailable. Please try again.' });
    return;
  }

  console.error(`[Error] Request ID ${requestId} failed:`, err);

  res.status(500).json({
    error: 'An unexpected safety engine error occurred. Please use physical helplines if in immediate danger.',
    requestId
  });
});

// Bind to port
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[BOOT] VarshaMitra safety server running on port ${PORT}`);
  });
}

export { app };
