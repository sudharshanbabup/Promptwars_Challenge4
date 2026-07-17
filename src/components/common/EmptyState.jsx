import React from 'react';

/**
 * EmptyState component prompting the user to run their initial AI request.
 * 
 * @param {object} props
 * @param {string} props.title - Main instruction.
 * @param {string} props.description - Supportive text description.
 * @returns {React.ReactElement}
 */
export function EmptyState({ title, description }) {
  return (
    <div
      style={{
        padding: 'var(--space-32)',
        textAlign: 'center',
        border: '1px dashed rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-12)',
        backgroundColor: 'rgba(255, 255, 255, 0.01)'
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '2rem', display: 'block', marginBottom: 'var(--space-8)' }}>
        ⚙️
      </span>
      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)', marginBottom: 'var(--space-4)' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
        {description}
      </p>
    </div>
  );
}
