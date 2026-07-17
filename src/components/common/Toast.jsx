import React, { useEffect } from 'react';

/**
 * Toast notification popup. Fully accessible via aria-live polite logs.
 * 
 * @param {object} props
 * @param {string} props.message - Toast message.
 * @param {() => void} props.onClose - Close callback.
 * @returns {React.ReactElement}
 */
export function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: 'var(--surface-2)',
        color: 'var(--accent)',
        border: '1px solid var(--accent)',
        borderRadius: '8px',
        padding: 'var(--space-12) var(--space-16)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-8)'
      }}
    >
      <span aria-hidden="true">✓</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{message}</span>
    </div>
  );
}
