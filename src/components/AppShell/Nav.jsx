import React, { useEffect } from 'react';
import { useRole } from '../../context/RoleContext.jsx';
import { useTablist } from '../../hooks/useTablist.js';

export const ALL_TABS = [
  { id: 'ops', label: 'Ops Intelligence', roles: ['organizer', 'volunteer', 'staff'] },
  { id: 'navigation', label: 'Navigation & Crowd Flow', roles: ['fan', 'organizer', 'staff'] },
  { id: 'accessibility', label: 'Accessibility Assistant', roles: ['fan', 'volunteer', 'staff'] },
  { id: 'multilingual', label: 'Multilingual Assistant', roles: ['fan', 'volunteer'] },
  { id: 'sustainability', label: 'Sustainability & Transport', roles: ['fan', 'organizer'] }
];

/**
 * Tab-list navigation component containing roving tabindex for accessibility.
 * Filtered by user operations role context.
 * 
 * @param {object} props
 * @param {string} props.activeTabId - Active tab string identifier.
 * @param {(id: string) => void} props.setActiveTabId - Set active tab identifier.
 * @returns {React.ReactElement}
 */
export function Nav({ activeTabId, setActiveTabId }) {
  const { role } = useRole();

  // Filter tabs dynamically based on user role
  const visibleTabs = ALL_TABS.filter(tab => tab.roles.includes(role));
  const activeIndex = Math.max(0, visibleTabs.findIndex(tab => tab.id === activeTabId));

  // Reset tab selection if the current active tab is filtered out by role change
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some(tab => tab.id === activeTabId)) {
      setActiveTabId(visibleTabs[0].id);
    }
  }, [role, activeTabId, visibleTabs, setActiveTabId]);

  const handleSetActiveIndex = (index) => {
    if (visibleTabs[index]) {
      setActiveTabId(visibleTabs[index].id);
    }
  };

  const { handleKeyDown } = useTablist(
    activeIndex,
    handleSetActiveIndex,
    visibleTabs.length
  );

  return (
    <nav
      aria-label="Command panels"
      style={{
        padding: 'var(--space-12) var(--space-24)',
        backgroundColor: 'var(--surface-2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div
        role="tablist"
        onKeyDown={handleKeyDown}
        style={{
          display: 'flex',
          gap: 'var(--space-12)',
          alignItems: 'center'
        }}
      >
        {visibleTabs.map((tab, idx) => {
          const isSelected = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTabId(tab.id)}
              style={{
                backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                color: isSelected ? 'var(--accent-ink)' : 'var(--text-dim)',
                border: 'none',
                borderRadius: '8px',
                padding: 'var(--space-8) var(--space-16)',
                fontWeight: isSelected ? '600' : '400',
                fontSize: '0.9rem',
                minHeight: 'var(--min-touch)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
