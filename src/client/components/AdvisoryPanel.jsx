import React, { useState } from 'react';

/**
 * AdvisoryPanel rendering live telemetries, carbon indices, and plans.
 * 
 * @param {object} props
 * @param {object} props.data - Safety assessment result.
 * @param {boolean} props.loading - Loading state.
 * @returns {React.ReactElement}
 */
export default function AdvisoryPanel({ data, loading }) {
  const [speaking, setSpeaking] = useState(false);

  const speakPlan = () => {
    if (!data?.plan) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const cleanText = data.plan.replace(/[*#•-]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: 'var(--space-20)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="spinner" aria-label="Loading Advisory Panel"></div>
        <p style={{ marginTop: 'var(--space-16)' }}>Analyzing stadium telemetry logs...</p>
      </div>
    );
  }

  const { assessment = { score: 20, level: 'Safe', drivers: [] }, weather = { temp: 22, rain: 0, windSpeed: 10 }, plan = '' } = data || {};

  const getAdvisoryColor = (level) => {
    if (level === 'Emergency') return 'var(--danger)';
    if (level === 'High Congestion') return 'var(--warning)';
    if (level === 'Caution') return 'var(--accent)';
    return 'var(--success)';
  };

  return (
    <div className="card" style={{ padding: 'var(--space-20)' }}>
      <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-8)', color: 'var(--primary)' }}>
        📢 Stadium Advisories
      </h2>

      {/* Advisory Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)', padding: 'var(--space-12)', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--rounded-md)', marginBottom: 'var(--space-16)' }}>
        <div style={{
          width: '50px', height: '50px', borderRadius: '50%',
          background: getAdvisoryColor(assessment.level),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#000', fontWeight: 'bold', fontSize: '1.2rem'
        }} aria-label={`Risk score: ${assessment.score}`}>
          {assessment.score}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: getAdvisoryColor(assessment.level) }}>
            Advisory: {assessment.level}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Weather: {weather.temp}°C, Rain: {weather.rain}mm, Wind: {weather.windSpeed}km/h
          </div>
        </div>
      </div>

      {/* Drivers List */}
      <div style={{ marginBottom: 'var(--space-16)' }}>
        <h3 style={{ fontSize: '0.95rem', margin: '0 0 var(--space-8) 0' }}>Incident Telemetry Logs</h3>
        <ul style={{ paddingLeft: 'var(--space-16)', margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {assessment.drivers.map((drv, idx) => <li key={idx}>{drv}</li>)}
        </ul>
      </div>

      {/* Plan Display */}
      {plan && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 'var(--space-16)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
            <h3 style={{ fontSize: '0.95rem', margin: 0 }}>📍 Optimized Action Plan</h3>
            <button onClick={speakPlan} className="btn-secondary" style={{ padding: '4px var(--space-8)', fontSize: '0.75rem' }}>
              {speaking ? '🔊 Stop Speak' : '🗣️ Read Aloud'}
            </button>
          </div>
          <div
            style={{ padding: 'var(--space-12)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--rounded-md)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
            aria-live="polite"
          >
            {plan}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 'var(--space-8)', fontStyle: 'italic' }}>
            AI guidance — always follow local stadium steward orders and World Cup safety protocol.
          </div>
        </div>
      )}
    </div>
  );
}
