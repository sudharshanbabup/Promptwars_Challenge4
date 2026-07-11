export type LanguageCode = 'en' | 'hi' | 'mr' | 'bn' | 'ta' | 'te' | 'ml' | 'kn' | 'gu' | 'or' | 'as';

export type RiskDriver = 'heavy_rainfall' | 'forecast_rainfall' | 'imd_alert' | 'high_winds' | 'thunderstorm' | 'high_river_level';

export interface Action {
  id: string;
  phase: 'before' | 'during' | 'after';
  priority: number; // 1-5, with 5 being highest urgency
  titleKey: string;
  bodyKey: string;
  icon: string;
  timeToComplete_min: number;
}

export interface HouseholdProfile {
  location: {
    lat: number;
    lon: number;
    district?: string;
    state?: string;
  };
  dwelling: 'ground_floor' | 'upper_floor' | 'independent_house' | 'kutcha' | 'coastal' | 'hillside';
  members: {
    infants: number;
    children: number;
    adults: number;
    seniors: number;
    pregnant: number;
    disabled: number;
    chronicIllness: string[];
  };
  assets: {
    hasVehicle: boolean;
    pets: number;
    livestock: number;
    hasGenerator: boolean;
  };
  connectivity: {
    hasSmartphone: boolean;
    hasPowerBackup: boolean;
  };
  language: LanguageCode;
  commute?: {
    mode: 'walk' | 'two_wheeler' | 'car' | 'bus' | 'train';
    distanceKm: number;
  };
}

export interface WeatherSignal {
  rainfall24h_mm: number;
  rainfallForecast72h_mm: number;
  windSpeed_kmph: number;
  imdAlert: 'none' | 'yellow' | 'orange' | 'red';
  riverLevelPct?: number;
  isCoastal: boolean;
  thunderstorm: boolean;
}

export interface RiskAssessment {
  level: 'safe' | 'watch' | 'warning' | 'emergency';
  score: number; // 0-100
  drivers: RiskDriver[];
  vulnerabilityMultiplier: number;
  actions: Action[];
  evacuationRecommended: boolean;
}

export interface Rule {
  id: string;
  when: (signal: WeatherSignal, profile: HouseholdProfile) => boolean;
  weight: number;
  driver: RiskDriver;
  actions: string[]; // Action IDs
}
