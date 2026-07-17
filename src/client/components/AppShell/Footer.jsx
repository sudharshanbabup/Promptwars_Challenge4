import React from 'react';

/**
 * Main application footer layout.
 * 
 * @returns {React.ReactElement}
 */
export function Footer() {
  return (
    <footer
      style={{
        padding: 'var(--space-16) var(--space-24)',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: 'var(--surface)',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        minHeight: 'var(--min-touch)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <p>
        FIFA World Cup 2026 Stadium Operations Assistant • AI guidance — always follow local authority instructions.
      </p>
    </footer>
  );
}
