import React from 'react';

/**
 * Access skip-to-content helper component targeting main layout landmarks.
 * 
 * @returns {React.ReactElement}
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      style={{
        position: 'absolute',
        top: '-100px',
        left: '20px',
        background: 'var(--accent)',
        color: 'var(--accent-ink)',
        padding: 'var(--space-8) var(--space-16)',
        borderRadius: 'var(--radius-12)',
        fontWeight: 'bold',
        zIndex: 9999,
        transition: 'top 0.2s ease',
        textDecoration: 'none'
      }}
      onFocus={(e) => {
        e.target.style.top = '20px';
      }}
      onBlur={(e) => {
        e.target.style.top = '-100px';
      }}
    >
      Skip to main content
    </a>
  );
}
