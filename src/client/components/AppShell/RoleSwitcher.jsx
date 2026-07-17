import React from 'react';
import { useRole } from '../../context/RoleContext.jsx';

const ROLES = [
  { id: 'fan', label: 'Fan', emoji: '📣' },
  { id: 'organizer', label: 'Organizer', emoji: '📋' },
  { id: 'volunteer', label: 'Volunteer', emoji: '🙋‍♂️' },
  { id: 'staff', label: 'Venue Staff', emoji: '🛡️' }
];

/**
 * RoleSwitcher renders a radio-button fieldset to switch client operations context.
 * Meets WCAG touch size targets of >=44px.
 * 
 * @returns {React.ReactElement}
 */
export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <fieldset
      style={{
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-12)',
        padding: 'var(--space-12) var(--space-16)',
        display: 'flex',
        gap: 'var(--space-12)',
        alignItems: 'center'
      }}
    >
      <legend style={{ padding: '0 var(--space-8)', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
        Select Operations Role
      </legend>
      <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
        {ROLES.map((r) => {
          const isChecked = role === r.id;
          return (
            <label
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-8)',
                cursor: 'pointer',
                minHeight: 'var(--min-touch)',
                padding: '0 var(--space-12)',
                backgroundColor: isChecked ? 'var(--surface-2)' : 'transparent',
                border: `1px solid ${isChecked ? 'var(--accent)' : 'transparent'}`,
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}
            >
              <input
                type="radio"
                name="user-role"
                value={r.id}
                checked={isChecked}
                onChange={() => setRole(r.id)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer'
                }}
              />
              <span aria-hidden="true">{r.emoji}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: isChecked ? '600' : '400' }}>
                {r.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
