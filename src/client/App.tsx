import { useState, useEffect } from 'react';
import { HouseholdProfile, RiskAssessment, WeatherSignal } from '../domain/types.ts';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { ProfileForm } from './components/ProfileForm.tsx';
import { RiskGauge } from './components/RiskGauge.tsx';
import { ActionChecklist } from './components/ActionChecklist.tsx';
import { ChatPanel } from './components/ChatPanel.tsx';
import { EmergencyDrawer } from './components/EmergencyDrawer.tsx';

const initialProfile: HouseholdProfile = {
  location: { lat: 20.27, lon: 85.84, district: 'Khurda', state: 'Odisha' },
  dwelling: 'ground_floor',
  members: { infants: 0, children: 0, adults: 2, seniors: 0, pregnant: 0, disabled: 0, chronicIllness: [] },
  assets: { hasVehicle: false, pets: 0, livestock: 0, hasGenerator: false },
  connectivity: { hasSmartphone: true, hasPowerBackup: false },
  language: 'en'
};

export function App() {
  const [profile, setProfile] = useState<HouseholdProfile>(initialProfile);
  const [weather, setWeather] = useState<WeatherSignal | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const pingOnline = () => setIsOnline(true);
    const pingOffline = () => setIsOnline(false);
    window.addEventListener('online', pingOnline);
    window.addEventListener('offline', pingOffline);
    return () => {
      window.removeEventListener('online', pingOnline);
      window.removeEventListener('offline', pingOffline);
    };
  }, []);

  const triggerAssessment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!response.ok) throw new Error('Assessment service failed');
      const data = await response.json();
      setWeather(data.weather);
      setAssessment(data.assessment);
      setPlan(data.plan);
    } catch (err) {
      alert('Network error. Switched safety advisor to offline deterministic mode.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isEvac = assessment?.evacuationRecommended;

  // Digest for chatbot context
  const digest = assessment ? {
    level: assessment.level,
    score: assessment.score,
    topDrivers: assessment.drivers,
    vulnerabilities: [],
    phase: 'during',
    language: profile.language
  } : null;

  return (
    <div className={isEvac ? 'evacuation-active' : ''} style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {isEvac && (
        <div className="sos-banner">
          🚨 EVACUATION RECOMMENDATION IN EFFECT. SECURE HOUSEHOLD AND PROCEED TO DISTRICT SHELTERS.
        </div>
      )}

      {/* Header Banner */}
      <header style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,23,42,0.4)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🌧️ VarshaMitra <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#94a3b8' }}>v1.0</span>
          </h1>
          <span className={`badge ${isOnline ? 'badge-online' : 'badge-offline'}`}>
            {isOnline ? '● Online' : '● Offline Mode'}
          </span>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="dashboard-grid">
        {/* Left column - Settings & Profile */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <LanguageSelector
              currentLanguage={profile.language}
              onLanguageChange={(code) => setProfile({ ...profile, language: code })}
            />
          </div>
          <ProfileForm
            profile={profile}
            onChange={setProfile}
            onAssess={triggerAssessment}
            loading={loading}
          />
        </section>

        {/* Right column - Diagnostics, Checklist, Chat */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <RiskGauge assessment={assessment} weather={weather} />
          {plan && <ActionChecklist plan={plan} language={profile.language} />}
          {digest && <ChatPanel digest={digest} />}
        </section>
      </main>

      <EmergencyDrawer />
    </div>
  );
}
export default App;
