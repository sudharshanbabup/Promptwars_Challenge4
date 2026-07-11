import { useState } from 'react';
import { HouseholdProfile } from '../../domain/types.ts';

interface ProfileFormProps {
  profile: HouseholdProfile;
  onChange: (updated: HouseholdProfile) => void;
  onAssess: () => void;
  loading: boolean;
}

export function ProfileForm({ profile, onChange, onAssess, loading }: ProfileFormProps) {
  const [geoError, setGeoError] = useState<string | null>(null);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Privacy: round coordinates immediately to 2 decimal places (~1km)
        const lat = parseFloat(position.coords.latitude.toFixed(2));
        const lon = parseFloat(position.coords.longitude.toFixed(2));

        onChange({
          ...profile,
          location: {
            ...profile.location,
            lat,
            lon
          }
        });
      },
      (err) => {
        setGeoError('Unable to retrieve location. Please input coordinates manually.');
        console.warn('Geolocation error:', err);
      }
    );
  };

  const updateMember = (field: keyof HouseholdProfile['members'], amount: number) => {
    const current = profile.members[field];
    if (Array.isArray(current)) return;
    const nextVal = Math.max(0, Math.min(20, (current as number) + amount));
    onChange({
      ...profile,
      members: {
        ...profile.members,
        [field]: nextVal
      }
    });
  };

  const updateAssetCount = (field: 'pets' | 'livestock', amount: number) => {
    const nextVal = Math.max(0, Math.min(50, profile.assets[field] + amount));
    onChange({
      ...profile,
      assets: {
        ...profile.assets,
        [field]: nextVal
      }
    });
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
        Household Safety Profile
      </h2>

      {/* Geolocation Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button type="button" onClick={requestGeolocation} className="primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          📍 Autofill My Location (GPS)
        </button>
        {geoError && <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>{geoError}</p>}
      </div>

      {/* Lat/Lon Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="form-group">
          <label htmlFor="lat-input">Latitude</label>
          <input
            id="lat-input"
            type="number"
            step="0.01"
            value={profile.location.lat}
            onChange={(e) => onChange({
              ...profile,
              location: { ...profile.location, lat: parseFloat(e.target.value) || 0 }
            })}
            style={{ width: '100%' }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lon-input">Longitude</label>
          <input
            id="lon-input"
            type="number"
            step="0.01"
            value={profile.location.lon}
            onChange={(e) => onChange({
              ...profile,
              location: { ...profile.location, lon: parseFloat(e.target.value) || 0 }
            })}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Dwelling Type */}
      <div className="form-group">
        <label htmlFor="dwelling-select">Dwelling/House Structure</label>
        <select
          id="dwelling-select"
          value={profile.dwelling}
          onChange={(e) => onChange({ ...profile, dwelling: e.target.value as any })}
          style={{ width: '100%', background: '#0f172a' }}
        >
          <option value="upper_floor">Apartment (Upper Floor)</option>
          <option value="ground_floor">Apartment/House (Ground Floor)</option>
          <option value="independent_house">Independent House (Multi-story)</option>
          <option value="kutcha">Kutcha House (Mud, thatch, tin roof)</option>
          <option value="coastal">Coastal/Low-lying Ground</option>
          <option value="hillside">Hillside Slope Zone</option>
        </select>
      </div>

      {/* Members Counter */}
      <div>
        <h3 style={{ fontSize: '0.95rem', color: '#94a3b8', margin: '0.5rem 0' }}>Vulnerable Members</h3>
        {(['infants', 'seniors', 'pregnant', 'disabled'] as const).map((key) => (
          <div className="counter-row" key={key}>
            <span style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{key}</span>
            <div className="counter-controls">
              <button type="button" className="counter-btn" onClick={() => updateMember(key, -1)}>-</button>
              <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{profile.members[key] as number}</span>
              <button type="button" className="counter-btn" onClick={() => updateMember(key, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Assets and Livestock */}
      <div>
        <h3 style={{ fontSize: '0.95rem', color: '#94a3b8', margin: '0.5rem 0' }}>Assets & Animals</h3>
        <div className="counter-row">
          <span style={{ fontSize: '0.9rem' }}>Livestock (Cattle/Goats)</span>
          <div className="counter-controls">
            <button type="button" className="counter-btn" onClick={() => updateAssetCount('livestock', -1)}>-</button>
            <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{profile.assets.livestock}</span>
            <button type="button" className="counter-btn" onClick={() => updateAssetCount('livestock', 1)}>+</button>
          </div>
        </div>
        <div className="counter-row">
          <span style={{ fontSize: '0.9rem' }}>Pets (Dogs/Cats/Birds)</span>
          <div className="counter-controls">
            <button type="button" className="counter-btn" onClick={() => updateAssetCount('pets', -1)}>-</button>
            <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{profile.assets.pets}</span>
            <button type="button" className="counter-btn" onClick={() => updateAssetCount('pets', 1)}>+</button>
          </div>
        </div>
      </div>

      {/* Infrastructure checkbuttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={profile.assets.hasVehicle}
            onChange={(e) => onChange({ ...profile, assets: { ...profile.assets, hasVehicle: e.target.checked } })}
            style={{ width: '20px', height: '20px', minHeight: '20px' }}
          />
          We own a personal motor vehicle
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={profile.connectivity.hasPowerBackup}
            onChange={(e) => onChange({ ...profile, connectivity: { ...profile.connectivity, hasPowerBackup: e.target.checked } })}
            style={{ width: '20px', height: '20px', minHeight: '20px' }}
          />
          Household has power backup (UPS/Inverter)
        </label>
      </div>

      <button type="button" onClick={onAssess} disabled={loading} className="primary" style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
        {loading ? 'Running Safety Diagnostics...' : '🔍 Analyze Risk & Get Plan'}
      </button>
    </div>
  );
}
export default ProfileForm;
