import React, { useState, useMemo, useCallback } from 'react';
import { useRole } from '../../context/RoleContext.jsx';
import { useAssist } from '../../hooks/useAssist.js';
import { getCongestion } from '../../lib/crowdModel.js';
import { parseRoute } from '../../lib/routeFormat.js';
import { Spinner } from '../common/Spinner.jsx';
import { ErrorNote } from '../common/ErrorNote.jsx';

const DESTINATIONS = ['Restroom', 'Exit', 'First Aid', 'Food Court'];
const ZONES = ['Zone A (Gates)', 'Zone B (Concourse)', 'Zone C (Food Court)', 'Zone D (Seating)'];

/**
 * Navigation & Crowd Flow panel.
 * 
 * @returns {React.ReactElement}
 */
export default function Navigation() {
  const { role } = useRole();
  const { loading, error, data, run } = useAssist();
  const [query, setQuery] = useState('');
  const [avoidCrowds, setAvoidCrowds] = useState(false);

  const mockHour = 19;
  const congestionSnapshot = useMemo(() => {
    return ZONES.map(zone => ({ name: zone, level: getCongestion(zone, mockHour) }));
  }, [mockHour]);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    await run('navigation', role, { query: query.trim(), avoidCrowds, congestion: congestionSnapshot });
  }, [query, avoidCrowds, role, congestionSnapshot, run]);

  const formattedResult = useMemo(() => {
    return data ? parseRoute(data) : {
      steps: ['Proceed along the main concourse corridor.', 'Follow green overhead signs.', 'Use left-side lanes.'],
      tip: 'Deterministic Fallback. Monitor overhead screens.'
    };
  }, [data]);

  return (
    <section aria-labelledby="nav-title" className="glass-panel flex-col gap-16">
      <h2 id="nav-title" style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>📍 Navigation & Crowd Flow</h2>
      
      <div className="card-metric flex-col gap-8">
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Live Zone Congestion</h3>
        <div className="grid-4">
          {congestionSnapshot.map((z) => (
            <div key={z.name} className="flex-col gap-4">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{z.name}</span>
              <div 
                role="img" aria-label={`${z.name} is ${z.level}`}
                style={{ height: '8px', borderRadius: '4px', backgroundColor: z.level === 'High' ? 'var(--danger)' : z.level === 'Medium' ? 'var(--warn)' : 'var(--ok)' }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{z.level}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-col gap-12">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {DESTINATIONS.map((d) => (
            <button key={d} type="button" onClick={() => setQuery(`Route to nearest ${d}`)} style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)', borderRadius: '20px', padding: '4px 12px', minHeight: '36px' }}>
              +{d}
            </button>
          ))}
        </div>
        <label htmlFor="nav-query" style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Where do you want to go?</label>
        <textarea id="nav-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Exit from Section 112..." style={{ height: '70px', resize: 'vertical' }} />
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minHeight: 'var(--min-touch)' }}>
          <input type="checkbox" checked={avoidCrowds} onChange={(e) => setAvoidCrowds(e.target.checked)} style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '0.9rem' }}>Reroute to avoid high congestion</span>
        </label>
        <button type="submit" disabled={loading} className="primary" style={{ alignSelf: 'flex-start' }}>
          {loading ? 'Finding path...' : '🔍 Map Path'}
        </button>
      </form>

      {loading && <Spinner />}
      {error && <ErrorNote message={error} onRetry={handleSubmit} />}

      {(data || !loading) && (
        <div aria-live="polite" className="flex-col gap-12" style={{ marginTop: '8px' }}>
          <h3 style={{ fontSize: '0.95rem' }}>Suggested Path:</h3>
          <ol className="flex-col gap-4" style={{ paddingLeft: '16px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
            {formattedResult.steps.map((step, idx) => <li key={idx}>{step}</li>)}
          </ol>
          <div style={{ backgroundColor: 'rgba(79, 209, 161, 0.05)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '12px', fontSize: '0.85rem', color: 'var(--accent)' }}>
            <strong>Advice: </strong>{formattedResult.tip}
          </div>
        </div>
      )}
    </section>
  );
}
