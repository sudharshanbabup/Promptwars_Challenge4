import React from 'react';

/**
 * Renders the Stadium Visitor & Operations Profile Form.
 * 
 * @param {object} props
 * @param {object} props.profile - Current profile state.
 * @param {function} props.onChange - Setter function for profile change.
 * @param {function} props.onSubmit - Submission event handler.
 * @param {boolean} props.loading - Loading indicator.
 * @returns {React.ReactElement}
 */
export default function ProfileForm({ profile, onChange, onSubmit, loading }) {
  const updateField = (field, value) => {
    onChange({ ...profile, [field]: value });
  };

  const toggleAccess = (key) => {
    const access = { ...profile.accessibility, [key]: !profile.accessibility[key] };
    onChange({ ...profile, accessibility: access });
  };

  return (
    <form onSubmit={onSubmit} className="card" style={{ padding: 'var(--space-20)' }} aria-labelledby="form-title">
      <h2 id="form-title" style={{ marginTop: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        👤 Profile Config
      </h2>
      
      <div className="form-group">
        <label htmlFor="role-select">Visitor Category / Role</label>
        <select
          id="role-select"
          value={profile.role}
          onChange={(e) => updateField('role', e.target.value)}
        >
          <option value="fan">Spectator (Fan)</option>
          <option value="organizer">Match Organizer</option>
          <option value="volunteer">Volunteer Assistant</option>
          <option value="staff">Venue Staff</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="zone-select">Stadium Zone</label>
        <select
          id="zone-select"
          value={profile.zone}
          onChange={(e) => updateField('zone', e.target.value)}
        >
          <option value="Zone A (Gates)">Zone A (Gates)</option>
          <option value="Zone B (Concourse)">Zone B (Concourse)</option>
          <option value="Zone C (Stands Section 100)">Zone C (Stands Section 100)</option>
          <option value="Zone D (Stands Section 200)">Zone D (Stands Section 200)</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
        <div className="form-group">
          <label htmlFor="lat-input">Latitude</label>
          <input
            id="lat-input"
            type="number"
            step="0.0001"
            value={profile.lat}
            onChange={(e) => updateField('lat', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lon-input">Longitude</label>
          <input
            id="lon-input"
            type="number"
            step="0.0001"
            value={profile.lon}
            onChange={(e) => updateField('lon', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <fieldset style={{ border: 'none', padding: 0, margin: 'var(--space-16) 0' }}>
        <legend style={{ fontWeight: 'bold', marginBottom: 'var(--space-8)' }}>Accessibility Needs</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={profile.accessibility.wheelchair}
              onChange={() => toggleAccess('wheelchair')}
            />
            Wheelchair / Step-Free Path
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={profile.accessibility.sensorySensitive}
              onChange={() => toggleAccess('sensorySensitive')}
            />
            Sensory Sensitive (Quiet zones)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={profile.accessibility.assistanceRequired}
              onChange={() => toggleAccess('assistanceRequired')}
            />
            Guiding Assistance Required
          </label>
        </div>
      </fieldset>

      <div className="form-group">
        <label htmlFor="lang-select">Preferred Language</label>
        <select
          id="lang-select"
          value={profile.language}
          onChange={(e) => updateField('language', e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="pt">Português</option>
          <option value="hi">Hindi</option>
          <option value="ar">Arabic</option>
        </select>
      </div>

      <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-12)' }}>
        {loading ? 'Analyzing Status...' : '🚀 Generate Advisory'}
      </button>
    </form>
  );
}
