import React, { useState, useEffect } from 'react';
import { SkipLink } from './components/AppShell/SkipLink.jsx';
import { Header } from './components/AppShell/Header.jsx';
import { Footer } from './components/AppShell/Footer.jsx';
import ProfileForm from './components/ProfileForm.jsx';
import AdvisoryPanel from './components/AdvisoryPanel.jsx';
import CommandChat from './components/CommandChat.jsx';
import EmergencyHelplines from './components/EmergencyHelplines.jsx';

/**
 * Main Spectator & Operations Dashboard application component.
 * 
 * @returns {React.ReactElement}
 */
export default function App() {
  const [profile, setProfile] = useState({
    role: 'fan',
    zone: 'Zone B (Concourse)',
    lat: 40.81,
    lon: -74.07,
    accessibility: {
      wheelchair: false,
      sensorySensitive: false,
      assistanceRequired: false
    },
    language: 'en'
  });

  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [helplinesOpen, setHelplinesOpen] = useState(false);

  // Automatic first-load telemetry ingest
  useEffect(() => {
    fetchAdvisory();
  }, []);

  const fetchAdvisory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!response.ok) {
        throw new Error('Stadium assessment service returned an error');
      }
      const data = await response.json();
      setAssessmentData(data);
    } catch (error) {
      console.error('[Telemetry Assessment Failed]:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAdvisory();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      <SkipLink />
      <Header />

      <main id="main" tabIndex={-1} style={{ flex: 1, padding: 'var(--space-24) var(--space-16)', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        
        {/* Quick Trigger Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-20)', flexWrap: 'wrap', gap: 'var(--space-12)' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--primary)' }}>🛡️ MatchDay Shield Center</h1>
            <p style={{ margin: 'var(--space-4) 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Unified GenAI Operations and Crowds Safety Advisor
            </p>
          </div>
          <button onClick={() => setHelplinesOpen(true)} className="btn-secondary" style={{ border: '1px solid var(--danger)', color: 'var(--danger)' }}>
            🚨 Emergency Helpline
          </button>
        </div>

        {/* 3-Column Operations Grid */}
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-20)', alignItems: 'stretch' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ProfileForm
              profile={profile}
              onChange={setProfile}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <AdvisoryPanel
              data={assessmentData}
              loading={loading}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CommandChat
              digest={{
                level: assessmentData?.assessment?.level || 'Safe',
                score: assessmentData?.assessment?.score || 20,
                vulnerabilities: [
                  ...(profile.accessibility.wheelchair ? ['wheelchair_path'] : []),
                  ...(profile.accessibility.sensorySensitive ? ['sensory_sensitive'] : []),
                  ...(profile.accessibility.assistanceRequired ? ['guide_assistance'] : [])
                ],
                language: profile.language
              }}
            />
          </div>

        </div>
      </main>

      <Footer />

      <EmergencyHelplines
        open={helplinesOpen}
        onClose={() => setHelplinesOpen(false)}
      />
    </div>
  );
}
