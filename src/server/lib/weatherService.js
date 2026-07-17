/**
 * Weather service with in-memory caching for MetLife Stadium coordinates.
 */

const CACHE = {
  data: null,
  timestamp: 0,
  TTL_MS: 300000 // 5 minutes cache
};

/**
 * Ingests current weather telemetry for stadium coordinates (MetLife Stadium: 40.81, -74.07).
 * 
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @returns {Promise<{temp: number, rain: number, windSpeed: number}>} Weather status.
 */
export async function getStadiumWeather(lat, lon) {
  const now = Date.now();
  if (CACHE.data && (now - CACHE.timestamp < CACHE.TTL_MS)) {
    return CACHE.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API returned status ${response.status}`);
    }

    const json = await response.json();
    const current = json.current_weather || {};
    
    // Simulate rain status from weathercode (e.g. codes >= 50 imply rainfall/snow)
    const weathercode = current.weathercode || 0;
    const rain = weathercode >= 51 ? 5 : 0;

    const data = {
      temp: current.temperature || 22,
      rain,
      windSpeed: current.windspeed || 12
    };

    CACHE.data = data;
    CACHE.timestamp = now;
    return data;
  } catch (error) {
    console.warn(`[Weather API Failed]: ${error.message}. Returning default telemetry.`);
    return { temp: 21, rain: 0, windSpeed: 10 };
  }
}
