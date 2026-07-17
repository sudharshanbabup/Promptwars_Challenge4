import React from 'react';

/**
 * Spinner component representing visual loading states.
 * Fully accessible with status roles.
 * 
 * @returns {React.ReactElement}
 */
export function Spinner() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-8)',
        padding: 'var(--space-24)'
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
        Loading safety plan...
      </span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
