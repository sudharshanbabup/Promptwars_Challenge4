/**
 * A simple, in-memory token bucket rate limiting algorithm.
 * Extracted into a class so it can be fully unit-tested without Express.
 */
export class TokenBucket {
  /**
   * Creates a token bucket instance.
   * @param {number} [maxTokens=20] - Maximum tokens the bucket can hold.
   * @param {number} [refillRatePerMs=20/60000] - Refill rate per millisecond.
   */
  constructor(maxTokens = 20, refillRatePerMs = 20 / 60000) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRatePerMs;
    this.buckets = new Map();
  }

  /**
   * Evaluates if a request from an IP should be allowed.
   * @param {string} ip - Client IP address.
   * @param {number} [now=Date.now()] - Current timestamp in milliseconds.
   * @returns {boolean} True if allowed, false if rate limited.
   */
  allowRequest(ip, now = Date.now()) {
    let bucket = this.buckets.get(ip);
    if (!bucket) {
      bucket = { tokens: this.maxTokens, lastRefillTime: now };
      this.buckets.set(ip, bucket);
    } else {
      const elapsed = now - bucket.lastRefillTime;
      bucket.tokens = Math.min(this.maxTokens, bucket.tokens + elapsed * this.refillRate);
      bucket.lastRefillTime = now;
    }

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }
    return false;
  }
}

const defaultBucket = new TokenBucket();

/**
 * Express middleware to apply rate limiting based on client IP.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function rateLimiter(req, res, next) {
  // Use header proxy fallback if deployed behind cloud gateways
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
  
  if (defaultBucket.allowRequest(ip)) {
    next();
  } else {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
}
