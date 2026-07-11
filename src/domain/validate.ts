import { ValidationError } from './errors.ts';
import { HouseholdProfile, LanguageCode } from './types.ts';

const SUPPORTED_LANGUAGES = new Set(['en', 'hi', 'mr', 'bn', 'ta', 'te', 'ml', 'kn', 'gu', 'or', 'as']);
const DWELLINGS = new Set(['ground_floor', 'upper_floor', 'independent_house', 'kutcha', 'coastal', 'hillside']);
const COMMUTE_MODES = new Set(['walk', 'two_wheeler', 'car', 'bus', 'train']);

/**
 * Sanitizes input text by stripping HTML tags and control characters.
 * @param text The input string.
 * @returns Sanitized string.
 */
export function sanitizeInput(text: string): string {
  if (typeof text !== 'string') return '';
  // Strip HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  // Strip control characters
  sanitized = sanitized.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  return sanitized.trim().slice(0, 500);
}

/**
 * Validates chat messages for potential prompt injections.
 * @param message The user's message.
 * @throws ValidationError if injection string detected.
 */
export function validatePromptSafety(message: string): void {
  const injectionPattern = /ignore\s+(all|previous)\s+instructions|system\s+prompt/i;
  if (injectionPattern.test(message)) {
    throw new ValidationError('Input validation failed: Potential prompt injection attempt blocked.');
  }
}

/**
 * Deep whitelists an object by rejecting any key not present in the allowed set.
 * @param obj The input object.
 * @param allowedKeys List of keys permitted at this depth.
 * @throws ValidationError if extra keys exist.
 */
function assertKeys(obj: any, allowedKeys: Set<string>): void {
  if (!obj || typeof obj !== 'object') {
    throw new ValidationError('Input validation failed: Payload is not a valid object.');
  }
  for (const key of Object.keys(obj)) {
    if (!allowedKeys.has(key)) {
      throw new ValidationError(`Input validation failed: Unknown key [${key}] rejected.`);
    }
  }
}

/**
 * Strictly validates the HouseholdProfile payload.
 * @param payload Raw payload object.
 * @returns Fully validated HouseholdProfile structure.
 * @throws ValidationError on key validation or type bounds failure.
 */
export function validateProfile(payload: any): HouseholdProfile {
  if (JSON.stringify(payload).length > 8192) {
    throw new ValidationError('Input validation failed: Payload size exceeds 8KB limit.');
  }

  const profileKeys = new Set(['location', 'dwelling', 'members', 'assets', 'connectivity', 'language', 'commute']);
  assertKeys(payload, profileKeys);

  // 1. Location validation
  const loc = payload.location;
  assertKeys(loc, new Set(['lat', 'lon', 'district', 'state']));
  if (typeof loc.lat !== 'number' || loc.lat < -90 || loc.lat > 90) {
    throw new ValidationError('Input validation failed: Invalid latitude.');
  }
  if (typeof loc.lon !== 'number' || loc.lon < -180 || loc.lon > 180) {
    throw new ValidationError('Input validation failed: Invalid longitude.');
  }
  if (loc.district !== undefined && typeof loc.district !== 'string') {
    throw new ValidationError('Input validation failed: District must be a string.');
  }
  if (loc.state !== undefined && typeof loc.state !== 'string') {
    throw new ValidationError('Input validation failed: State must be a string.');
  }

  // 2. Dwelling validation
  if (!DWELLINGS.has(payload.dwelling)) {
    throw new ValidationError('Input validation failed: Invalid dwelling type.');
  }

  // 3. Members validation
  const members = payload.members;
  assertKeys(members, new Set(['infants', 'children', 'adults', 'seniors', 'pregnant', 'disabled', 'chronicIllness']));
  
  const counts = ['infants', 'children', 'adults', 'seniors', 'pregnant', 'disabled'] as const;
  for (const countKey of counts) {
    const val = members[countKey];
    if (typeof val !== 'number' || val < 0 || val > 20 || !Number.isInteger(val)) {
      throw new ValidationError(`Input validation failed: Invalid count for [${countKey}]. Must be integer between 0 and 20.`);
    }
  }

  if (!Array.isArray(members.chronicIllness)) {
    throw new ValidationError('Input validation failed: Chronic illness must be a list of strings.');
  }
  const chronicIllness = members.chronicIllness.map((ill: any) => {
    if (typeof ill !== 'string') {
      throw new ValidationError('Input validation failed: Chronic illness entry must be a string.');
    }
    return sanitizeInput(ill);
  });

  // 4. Assets validation
  const assets = payload.assets;
  assertKeys(assets, new Set(['hasVehicle', 'pets', 'livestock', 'hasGenerator']));
  if (typeof assets.hasVehicle !== 'boolean') throw new ValidationError('Input validation failed: hasVehicle must be a boolean.');
  if (typeof assets.hasGenerator !== 'boolean') throw new ValidationError('Input validation failed: hasGenerator must be a boolean.');
  if (typeof assets.pets !== 'number' || assets.pets < 0 || !Number.isInteger(assets.pets)) {
    throw new ValidationError('Input validation failed: pets count must be a non-negative integer.');
  }
  if (typeof assets.livestock !== 'number' || assets.livestock < 0 || !Number.isInteger(assets.livestock)) {
    throw new ValidationError('Input validation failed: livestock count must be a non-negative integer.');
  }

  // 5. Connectivity validation
  const conn = payload.connectivity;
  assertKeys(conn, new Set(['hasSmartphone', 'hasPowerBackup']));
  if (typeof conn.hasSmartphone !== 'boolean') throw new ValidationError('Input validation failed: hasSmartphone must be a boolean.');
  if (typeof conn.hasPowerBackup !== 'boolean') throw new ValidationError('Input validation failed: hasPowerBackup must be a boolean.');

  // 6. Language validation
  if (!SUPPORTED_LANGUAGES.has(payload.language)) {
    throw new ValidationError('Input validation failed: Unsupported language.');
  }

  // 7. Commute validation (optional)
  let commuteProfile: HouseholdProfile['commute'] = undefined;
  if (payload.commute !== undefined) {
    const commute = payload.commute;
    assertKeys(commute, new Set(['mode', 'distanceKm']));
    if (!COMMUTE_MODES.has(commute.mode)) {
      throw new ValidationError('Input validation failed: Invalid commute mode.');
    }
    if (typeof commute.distanceKm !== 'number' || commute.distanceKm < 0 || commute.distanceKm > 200) {
      throw new ValidationError('Input validation failed: distanceKm must be a number between 0 and 200.');
    }
    commuteProfile = {
      mode: commute.mode,
      distanceKm: commute.distanceKm
    };
  }

  return {
    location: {
      lat: loc.lat,
      lon: loc.lon,
      district: loc.district ? sanitizeInput(loc.district) : undefined,
      state: loc.state ? sanitizeInput(loc.state) : undefined
    },
    dwelling: payload.dwelling,
    members: {
      infants: members.infants,
      children: members.children,
      adults: members.adults,
      seniors: members.seniors,
      pregnant: members.pregnant,
      disabled: members.disabled,
      chronicIllness
    },
    assets: {
      hasVehicle: assets.hasVehicle,
      pets: assets.pets,
      livestock: assets.livestock,
      hasGenerator: assets.hasGenerator
    },
    connectivity: {
      hasSmartphone: conn.hasSmartphone,
      hasPowerBackup: conn.hasPowerBackup
    },
    language: payload.language as LanguageCode,
    commute: commuteProfile
  };
}
