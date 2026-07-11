/**
 * Base custom error for the application.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when third-party APIs (like Open-Meteo or Gemini) fail.
 */
export class UpstreamError extends AppError {
  constructor(message: string) {
    super(message, 502);
  }
}

/**
 * Thrown when client input fails schema validation.
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
