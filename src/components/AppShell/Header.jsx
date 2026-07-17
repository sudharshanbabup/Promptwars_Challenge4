import React from 'react';
import { RoleSwitcher } from './RoleSwitcher.jsx';

/**
 * Main application header wrapper.
 * 
 * @returns {React.ReactElement}
 */
export function Header() {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-16) var(--space-24)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: 'var(--surface)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
        <span aria-hidden="true" style={{ fontSize: '1.8rem' }}>⚽</span>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text)' }}>
            MatchDay Nexus
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            FIFA World Cup 2026 Stadium Operations
          </p>
        </div>
      </div>
      <RoleSwitcher />
    </header>
  );
}
