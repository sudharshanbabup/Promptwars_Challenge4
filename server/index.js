import express from 'express';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import { rateLimiter } from './middleware/rateLimit.js';
import { assistRouter } from './routes/assist.js';

const app = express();
const PORT = process.env.PORT || 8080;

// 1. Apply Helmet for security headers and Compression for efficiency
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(compression());

// 2. Add custom CORS headers for local Vite dev
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 3. Parse JSON with a strict size limit of 32KB
app.use(express.json({ limit: '32kb' }));

// 4. Mount rate limiter on all API endpoints
app.use('/api', rateLimiter);

// 5. Mount route handlers
app.use(assistRouter);

// 6. Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist/index.html'));
  });
}

// 7. Global Express error handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.message || err);
  res.status(500).json({ error: 'An unexpected backend error occurred.' });
});

// 8. Listen on configured port
app.listen(PORT, () => {
  console.log(`[BOOT] MatchDay Nexus backend proxy listening on port ${PORT}`);
});

export { app };
