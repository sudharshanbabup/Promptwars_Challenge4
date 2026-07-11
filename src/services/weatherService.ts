import { LruTtlCache } from './cache.ts';
import { WeatherSignal } from '../domain/types.ts';
import { mapOpenMeteoToWeatherSignal } from '../domain/weatherMapper.ts';
import { UpstreamError } from '../domain/errors.ts';

// 200 max entries, 10 min TTL (600,000 ms)
export const weatherCache = new LruTtlCache<string, WeatherSignal>(200, 600000);

/**
 * Fetches current weather observations and 3-day forecasts from Open-Meteo.
 * Rounds coordinates to 2 decimal places (~1km resolution) to share cache entries.
 * Includes a strict 4-second timeout boundary.
 * @param lat Latitude of the target location.
 * @param lon Longitude of the target location.
 * @param isCoastal Whether the location is situated in a coastal zone.
 * @returns Fully mapped WeatherSignal.
 * @throws UpstreamError when the upstream service times out or fails.
 */
export async function getWeather(lat: number, lon: number, isCoastal: boolean = false): Promise<WeatherSignal> {
  const roundedLat = parseFloat(lat.toFixed(2));
  const roundedLon = parseFloat(lon.toFixed(2));
  const cacheKey = `${roundedLat},${roundedLon},${isCoastal}`;

  const cached = weatherCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${roundedLat}&longitude=${roundedLon}&daily=precipitation_sum,wind_speed_10m_max,weather_code&forecast_days=3&timezone=auto`;

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new UpstreamError(`Open-Meteo API returned HTTP status ${response.status}`);
    }

    const data = await response.json();
    const weatherSignal = mapOpenMeteoToWeatherSignal(data.daily, isCoastal);
    weatherCache.set(cacheKey, weatherSignal);
    return weatherSignal;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new UpstreamError('Open-Meteo weather fetch timed out after 4 seconds');
    }
    if (error instanceof UpstreamError) {
      throw error;
    }
    throw new UpstreamError(error.message || 'Failed to connect to Open-Meteo weather service');
  }
}
