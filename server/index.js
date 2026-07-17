import express from 'express';
import path from 'path';
import { rateLimiter } from './middleware/rateLimit.js';
import { assistRouter } from './routes/assist.js';

const app = express();
const PORT = process.env.PORT || 8080;

// 1. Manually applied security and CORS headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com");

  // Restrictive CORS policy for local Vite frontend dev server
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. Parse JSON with a strict size limit of 32KB
app.use(express.json({ limit: '32kb' }));

// 3. Mount rate limiter on all API endpoints
app.use('/api', rateLimiter);

// 4. Mount route handlers
app.use(assistRouter);

// 5. Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist/index.html'));
  });
}

// 6. Global Express error handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.message || err);
  res.status(500).json({ error: 'An unexpected backend error occurred.' });
});

// 7. Listen on configured port
app.listen(PORT, () => {
  console.log(`[BOOT] MatchDay Nexus backend proxy listening on port ${PORT}`);
});

export { app };
