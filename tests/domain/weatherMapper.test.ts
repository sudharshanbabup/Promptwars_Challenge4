import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mapOpenMeteoToWeatherSignal, deriveImdAlertColor } from '../../src/domain/weatherMapper.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load fixture
const fixturePath = join(__dirname, '../fixtures/openMeteoResponse.json');
const rawFixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

test('WeatherMapper maps daily Open-Meteo fixture successfully', () => {
  const signal = mapOpenMeteoToWeatherSignal(rawFixture.daily, true);

  assert.strictEqual(signal.rainfall24h_mm, 75.2);
  // 75.2 + 120.5 + 45.0 = 240.7
  assert.strictEqual(signal.rainfallForecast72h_mm, 240.7);
  assert.strictEqual(signal.windSpeed_kmph, 42.1);
  assert.strictEqual(signal.thunderstorm, true);
  assert.strictEqual(signal.imdAlert, 'yellow');
  assert.strictEqual(signal.isCoastal, true);
});

test('WeatherMapper handles null, missing, or empty inputs gracefully', () => {
  const emptySignal = mapOpenMeteoToWeatherSignal(undefined, false);

  assert.strictEqual(emptySignal.rainfall24h_mm, 0);
  assert.strictEqual(emptySignal.rainfallForecast72h_mm, 0);
  assert.strictEqual(emptySignal.windSpeed_kmph, 0);
  assert.strictEqual(emptySignal.thunderstorm, false);
  assert.strictEqual(emptySignal.imdAlert, 'none');
  assert.strictEqual(emptySignal.isCoastal, false);

  const nullArraysData = {
    precipitation_sum: [null, null, null],
    wind_speed_10m_max: [null],
    weather_code: [null, null]
  };

  const parsedNullSignal = mapOpenMeteoToWeatherSignal(nullArraysData, false);
  assert.strictEqual(parsedNullSignal.rainfall24h_mm, 0);
  assert.strictEqual(parsedNullSignal.rainfallForecast72h_mm, 0);
  assert.strictEqual(parsedNullSignal.windSpeed_kmph, 0);
  assert.strictEqual(parsedNullSignal.thunderstorm, false);
});

test('deriveImdAlertColor boundary evaluations', () => {
  assert.strictEqual(deriveImdAlertColor(0), 'none');
  assert.strictEqual(deriveImdAlertColor(64.4), 'none');
  assert.strictEqual(deriveImdAlertColor(64.5), 'yellow');
  assert.strictEqual(deriveImdAlertColor(115.5), 'yellow');
  assert.strictEqual(deriveImdAlertColor(115.6), 'orange');
  assert.strictEqual(deriveImdAlertColor(204.4), 'orange');
  assert.strictEqual(deriveImdAlertColor(204.5), 'red');
  assert.strictEqual(deriveImdAlertColor(400.0), 'red');
});
