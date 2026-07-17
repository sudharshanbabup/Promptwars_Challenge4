import React, { useState, useMemo, useCallback } from 'react';
import { useRole } from '../../context/RoleContext.jsx';
import { useAssist } from '../../hooks/useAssist.js';
import { mapTogglesToPrefs } from '../../lib/profileToPrefs.js';
import { Spinner } from '../common/Spinner.jsx';
import { ErrorNote } from '../common/ErrorNote.jsx';

const ACCESS_OPTIONS = [
  { id: 'wheelchair', label: 'Wheelchair user / Step-free access' },
  { id: 'lowVision', label: 'Low vision / Audio descriptive guide' },
  { id: 'hardOfHearing', label: 'Hard of hearing / Visual captions' },
  { id: 'sensorySensitive', label: 'Neurodivergent / sensory-sensitive support' },
  { id: 'serviceAnimal', label: 'Service animal relief access' }
];

/**
 * Accessibility Assistant panel.
 * 
 * @returns {React.ReactElement}
 */
export default function Accessibility() {
  const { role } = useRole();
  const { loading, error, data, run } = useAssist();
  const [toggles, setToggles] = useState({ wheelchair: false, lowVision: false, hardOfHearing: false, sensorySensitive: false, serviceAnimal: false });
  const [announcement, setAnnouncement] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleGeneratePlan = useCallback(async () => {
    const prefs = mapTogglesToPrefs(toggles);
    await run('accessibility', role, { prefs, announcement: announcement.trim() });
  }, [toggles, announcement, role, run]);

  const handleSpeak = useCallback(() => {
    const textToRead = data || 'No active plan available to read.';
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  }, [data, isSpeaking]);

  const outputPlan = useMemo(() => {
    if (data) return data;
    const prefs = mapTogglesToPrefs(toggles);
    return prefs.alerts.length === 0 ? 'No alerts. Step-free lanes are open.' : `[Offline Plan]\n` + prefs.alerts.map(a => `• ${a}`).join('\n');
  }, [data, toggles]);

  return (
    <section aria-labelledby="a11y-title" className="glass-panel flex-col gap-16">
      <h2 id="a11y-title" style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>♿ Accessibility Assistant</h2>

      <fieldset style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-12)', padding: '16px' }}>
        <legend style={{ padding: '0 8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>Accessibility Needs</legend>
        <div className="flex-col gap-8">
          {ACCESS_OPTIONS.map((opt) => (
            <label key={opt.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', cursor: 'pointer', minHeight: 'var(--min-touch)', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={toggles[opt.id]} onChange={() => setToggles(p => ({ ...p, [opt.id]: !p[opt.id] }))} style={{ width: '20px', height: '20px' }} />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex-col gap-8">
        <label htmlFor="announcement-input" style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Simplify Announcement (Optional)</label>
        <textarea id="announcement-input" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Paste announcements here..." style={{ height: '60px', resize: 'vertical' }} />
      </div>

      <button type="button" onClick={handleGeneratePlan} disabled={loading} className="primary" style={{ alignSelf: 'flex-start' }}>
        {loading ? 'Compiling plan...' : '📋 Generate Access Plan'}
      </button>

      {loading && <Spinner />}
      {error && <ErrorNote message={error} onRetry={handleGeneratePlan} />}

      <div aria-live="polite" className="flex-col gap-12" style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem' }}>Personalized Safety Advice:</h3>
          <button type="button" onClick={handleSpeak} style={{ backgroundColor: isSpeaking ? 'var(--danger)' : 'var(--surface-2)', color: 'var(--text)', fontSize: '0.8rem', padding: '4px 12px', minHeight: '36px', borderRadius: '8px' }}>
            {isSpeaking ? '⏹ Stop Audio' : '🔊 Speak Plan'}
          </button>
        </div>
        <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-12)', padding: '16px', fontSize: '0.9rem', color: 'var(--text-dim)', whiteSpace: 'pre-wrap', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          {outputPlan}
        </div>
      </div>
    </section>
  );
}
