import express from 'express';
import { sanitizeChoice, sanitizeText } from '../lib/sanitize.js';
import { getStadiumWeather } from '../lib/weatherService.js';
import { getLiveTelemetry } from '../lib/telemetryService.js';
import { assessStadiumRisk } from '../../client/lib/opsRiskEngine.js';
import { compileFallbackPlan } from '../../client/lib/fallbackPlan.js';
import { generateAIAssessment, generateAIChat } from '../lib/geminiClient.js';

const router = express.Router();

const ALLOWED_ROLES = ['fan', 'organizer', 'volunteer', 'staff'];
const ALLOWED_ZONES = ['Zone A (Gates)', 'Zone B (Concourse)', 'Zone C (Stands Section 100)', 'Zone D (Stands Section 200)'];
const ALLOWED_LANGUAGES = ['en', 'hi', 'mr', 'bn', 'ta', 'te', 'ml', 'kn', 'gu', 'or', 'as', 'es', 'fr', 'pt', 'ar', 'de', 'ja', 'ko', 'zh'];

/**
 * POST /api/assess
 * Handles safety and crowd operations assessments for the stadium.
 */
router.post('/api/assess', async (req, res, next) => {
  try {
    const raw = req.body || {};

    // 1. Dual-Compatibility parsing: checks for weather/monsoon coordinates or stadium inputs
    let lat = 40.81;
    let lon = -74.07;
    if (raw.location && typeof raw.location.lat === 'number') {
      lat = raw.location.lat;
      lon = raw.location.lon;
    }

    let role = 'fan';
    if (raw.role) {
      role = sanitizeChoice(raw.role, ALLOWED_ROLES);
    } else if (raw.dwelling) {
      // map monsoon dwelling to roles for stadium context
      role = raw.dwelling === 'independent_house' ? 'organizer' : 'fan';
    }

    let zone = 'Zone B (Concourse)';
    if (raw.zone) {
      zone = sanitizeChoice(raw.zone, ALLOWED_ZONES);
    }

    const accessibility = {
      wheelchair: !!(raw.accessibility?.wheelchair || raw.members?.disabled > 0),
      sensorySensitive: !!(raw.accessibility?.sensorySensitive || raw.members?.infants > 0),
      assistanceRequired: !!(raw.accessibility?.assistanceRequired || raw.members?.seniors > 0)
    };

    let language = 'en';
    if (raw.language) {
      language = sanitizeChoice(raw.language.toLowerCase(), ALLOWED_LANGUAGES);
    }

    const profile = { lat, lon, role, zone, accessibility, language };

    // 2. Fetch Live weather and telemetry status
    const weather = await getStadiumWeather(lat, lon);
    const telemetry = getLiveTelemetry();

    // 3. Evaluate deterministic risk calculations
    const assessment = assessStadiumRisk(telemetry, weather, profile);

    // 4. Generate AI advisory or compile fallback
    const planText = await generateAIAssessment(telemetry, assessment, profile);

    res.json({
      assessment,
      plan: planText,
      weather,
      degraded: planText.includes('Deterministic')
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/chat
 * Handles conversational queries.
 */
router.post('/api/chat', async (req, res, next) => {
  try {
    const { message, profileDigest, history } = req.body || {};

    if (typeof message !== 'string') {
      return res.status(400).json({ error: 'Message must be a string' });
    }

    const cleanMsg = sanitizeText(message);
    const digest = profileDigest || { level: 'Safe', score: 20, vulnerabilities: [], language: 'en' };
    const formattedHistory = Array.isArray(history) ? history.slice(0, 6) : [];

    const reply = await generateAIChat(cleanMsg, digest, formattedHistory);
    res.json({ text: reply });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/alerts
 * Light-weight high frequency status monitoring.
 */
router.get('/api/alerts', async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 40.81;
    const lon = parseFloat(req.query.lon) || -74.07;

    const weather = await getStadiumWeather(lat, lon);
    const telemetry = getLiveTelemetry();
    const assessment = assessStadiumRisk(telemetry, weather, { zone: 'Zone B (Concourse)', accessibility: {} });

    res.json({
      level: assessment.level,
      score: assessment.score,
      isCoastal: false
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/emergency
 * Static contact list endpoint.
 */
router.get('/api/emergency', (req, res) => {
  res.json({
    nationalEmergency: '112',
    ambulance: '108',
    districtDisasterControl: '1077',
    ndma: '1078',
    waterWaterlogging: '1916',
    electricity: '1912',
    police: '100',
    fire: '101',
    stadiumSecurity: '011-2026-FIFA',
    firstAid: '011-2026-AID',
    transitPolice: '011-2026-TRAIN'
  });
});

/**
 * GET /api/health
 * Returns service uptime and monitoring.
 */
router.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: parseFloat(process.uptime().toFixed(1))
  });
});

// Legacy backward-compatibility endpoint
router.post('/api/assist', async (req, res) => {
  const { feature, role, payload } = req.body || {};
  const weather = await getStadiumWeather(40.81, -74.07);
  const telemetry = getLiveTelemetry();
  const profile = { role: role || 'fan', zone: payload?.zone || 'Zone B (Concourse)', accessibility: payload?.prefs || {} };
  const assessment = assessStadiumRisk(telemetry, weather, profile);
  const text = compileFallbackPlan(assessment, profile);
  res.json({ text });
});

export { router as assistRouter };
