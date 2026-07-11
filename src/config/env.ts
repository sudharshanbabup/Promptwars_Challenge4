import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Reads and parses the .env file in the current working directory.
 * Safely handles missing files and strips enclosing quotes.
 */
export function loadEnv(): void {
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) {
    return;
  }

  try {
    const content = readFileSync(envPath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const delimiterIndex = trimmed.indexOf('=');
      if (delimiterIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, delimiterIndex).trim();
      let val = trimmed.slice(delimiterIndex + 1).trim();

      // Strip enclosing quotes if present
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }

      process.env[key] = val;
    }
  } catch (err) {
    console.error('Failed to parse .env file:', err);
  }
}
