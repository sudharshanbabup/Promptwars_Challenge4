import React from 'react';

/**
 * ErrorNote component to display friendly operational failures.
 * 
 * @param {object} props
 * @param {string} props.message - Error message.
 * @param {() => void} props.onRetry - Retry callback.
 * @returns {React.ReactElement}
 */
export function ErrorNote({ message, onRetry }) {
  return (
    <div
      role="alert"
      style={{
        border: '1px solid var(--danger)',
        backgroundColor: 'rgba(255, 138, 138, 0.05)',
        borderRadius: 'var(--radius-12)',
        padding: 'var(--space-16)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-12)',
        alignItems: 'flex-start'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>⚠️</span>
        <span style={{ fontWeight: '600', color: 'var(--danger)' }}>Operational Alert</span>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="primary"
          style={{
            backgroundColor: 'var(--danger)',
            color: '#000',
            fontWeight: 'bold',
            minHeight: 'var(--min-touch)',
            cursor: 'pointer'
          }}
        >
          Retry Request
        </button>
      )}
    </div>
  );
}
