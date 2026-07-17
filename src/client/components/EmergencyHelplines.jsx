import React from 'react';

/**
 * EmergencyHelplines drawer overlay.
 * 
 * @param {object} props
 * @param {boolean} props.open - Modal state.
 * @param {function} props.onClose - Close event.
 * @returns {React.ReactElement}
 */
export default function EmergencyHelplines({ open, onClose }) {
  if (!open) return null;

  const helplines = [
    { name: 'FIFA Operations Command', number: '011-2026-FIFA' },
    { name: 'Stadium Safety & Security Desk', number: '011-2026-SEC' },
    { name: 'Spectator First Aid Dispatch', number: '011-2026-AID' },
    { name: 'Local Emergency Police / Fire', number: '112 / 100' },
    { name: 'Venue Lost and Found Desk', number: '011-2026-LOST' }
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: 'var(--space-16)'
    }} role="dialog" aria-modal="true" aria-labelledby="helpline-title">
      <div className="card" style={{ padding: 'var(--space-24)', maxWidth: '450px', width: '100%' }}>
        <h2 id="helpline-title" style={{ marginTop: 0, color: 'var(--danger)' }}>
          🚨 Operations Helplines
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-16)' }}>
          Direct hotlines to venue stewards and emergency dispatch for FIFA World Cup 2026:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', marginBottom: 'var(--space-20)' }}>
          {helplines.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 'var(--space-8)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{item.name}</span>
              <a href={`tel:${item.number}`} style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'none' }}>
                📞 {item.number}
              </a>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{ width: '100%' }}>Close Hotline Drawer</button>
      </div>
    </div>
  );
}
