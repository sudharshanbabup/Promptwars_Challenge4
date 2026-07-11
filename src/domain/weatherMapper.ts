import { WeatherSignal } from './types.ts';

/**
 * Maps raw Open-Meteo daily forecast data to a WeatherSignal.
 * @param dailyData Raw "daily" object from Open-Meteo response.
 * @param isCoastal Whether the location is a coastal zone.
 * @returns Strongly typed WeatherSignal.
 */
export function mapOpenMeteoToWeatherSignal(
  dailyData: {
    precipitation_sum?: (number | null)[];
    wind_speed_10m_max?: (number | null)[];
    weather_code?: (number | null)[];
  } | undefined,
  isCoastal: boolean = false
): WeatherSignal {
  if (!dailyData) {
    return {
      rainfall24h_mm: 0,
      rainfallForecast72h_mm: 0,
      windSpeed_kmph: 0,
      imdAlert: 'none',
      isCoastal,
      thunderstorm: false
    };
  }

  // 24h rainfall is today's precipitation sum
  const rainfall24h_mm = dailyData.precipitation_sum?.[0] ?? 0;

  // 72h forecast rainfall is the sum of the 3 days forecast
  const rainfallForecast72h_mm = (dailyData.precipitation_sum ?? [])
    .reduce((sum: number, val) => sum + (val ?? 0), 0);

  const windSpeed_kmph = dailyData.wind_speed_10m_max?.[0] ?? 0;

  // Thunderstorm check: WMO codes 95, 96, 99 represent thunderstorms
  const hasThunderstorm = (dailyData.weather_code ?? []).some(code => 
    code === 95 || code === 96 || code === 99
  );

  return {
    rainfall24h_mm,
    rainfallForecast72h_mm,
    windSpeed_kmph,
    imdAlert: deriveImdAlertColor(rainfall24h_mm),
    isCoastal,
    thunderstorm: hasThunderstorm
  };
}

/**
 * Derives the IMD alert color based on standard IMD 24h rainfall categories:
 * - Extremely Heavy (>= 204.5mm) -> Red Alert
 * - Very Heavy (115.6mm - 204.4mm) -> Orange Alert
 * - Heavy (64.5mm - 115.5mm) -> Yellow Alert
 * - Moderate/Light (< 64.5mm) -> None
 * @param rainfall24h_mm Rainfall in millimeters in a 24 hour period.
 * @returns Alert color level.
 */
export function deriveImdAlertColor(rainfall24h_mm: number): WeatherSignal['imdAlert'] {
  if (rainfall24h_mm >= 204.5) {
    return 'red';
  }
  if (rainfall24h_mm >= 115.6) {
    return 'orange';
  }
  if (rainfall24h_mm >= 64.5) {
    return 'yellow';
  }
  return 'none';
}
