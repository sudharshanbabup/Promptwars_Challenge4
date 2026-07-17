import React, { useState, useMemo, useCallback } from 'react';
import { useRole } from '../../context/RoleContext.jsx';
import { useAssist } from '../../hooks/useAssist.js';
import { getSignals } from '../../lib/opsFeed.js';
import { sortBySeverity, topN } from '../../lib/prioritize.js';
import { Spinner } from '../common/Spinner.jsx';
import { ErrorNote } from '../common/ErrorNote.jsx';

/**
 * Ops Intelligence panel.
 * 
 * @returns {React.ReactElement}
 */
export default function OpsIntelligence() {
  const { role } = useRole();
  const { loading, error, data, run } = useAssist();
  const [question, setQuestion] = useState('');

  const mockHour = 19;
  const rawSignals = useMemo(() => getSignals(mockHour), [mockHour]);
  const prioritizedSignals = useMemo(() => sortBySeverity(rawSignals), [rawSignals]);

  const handleAction = useCallback(async (type) => {
    if (type === 'brief') {
      await run('ops', role, { action: 'generate_brief', signals: topN(rawSignals, 3) });
    } else {
      if (!question.trim()) return;
      await run('ops', role, { action: 'query', question: question.trim(), signals: rawSignals });
    }
  }, [rawSignals, question, role, run]);

  const outputBrief = useMemo(() => {
    return data ? data : `[Offline Ops Command Brief]\n` +
      `1. REDIRECT STAFF to high congestion gates.\n` +
      `2. ACTIVATE emergency relief teams near Section 114.\n` +
      `3. MONITOR dynamic weather updates closely.`;
  }, [data]);

  return (
    <section aria-labelledby="ops-title" className="glass-panel flex-col gap-16">
      <h2 id="ops-title" style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>🛡️ Ops Intelligence & Control</h2>

      <div className="flex-col gap-8">
        <h3 style={{ fontSize: '0.9rem' }}>Active Incidents ({prioritizedSignals.length})</h3>
        <div className="flex-col gap-8">
          {prioritizedSignals.map((sig) => (
            <div
              key={sig.id}
              className="card-metric"
              style={{
                borderLeft: `4px solid ${sig.severity === 'High' ? 'var(--danger)' : sig.severity === 'Medium' ? 'var(--warn)' : 'var(--ok)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem'
              }}
            >
              <div>
                <p style={{ fontWeight: '600' }}>{sig.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Location: {sig.zone} • {sig.timestamp}</span>
              </div>
              <span className="badge-severity" style={{
                backgroundColor: sig.severity === 'High' ? 'rgba(255, 138, 138, 0.1)' : 'rgba(255, 212, 102, 0.1)',
                color: sig.severity === 'High' ? 'var(--danger)' : 'var(--warn)'
              }}>{sig.severity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-row gap-12">
        <button type="button" onClick={() => handleAction('brief')} disabled={loading} className="primary">
          {loading ? 'Synthesizing...' : '📋 Synthesize Operations Brief'}
        </button>
      </div>

      <div className="flex-col gap-8">
        <label htmlFor="ops-query" style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Ask Tactical Command Question</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input id="ops-query" type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. How should we allocate volunteers?" style={{ flex: 1 }} />
          <button type="button" onClick={() => handleAction('query')} disabled={loading} className="primary" style={{ whiteSpace: 'nowrap' }}>Ask AI</button>
        </div>
      </div>

      {loading && <Spinner />}
      {error && <ErrorNote message={error} onRetry={() => handleAction('brief')} />}

      <div aria-live="polite">
        <h3 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Tactical Advisory Response:</h3>
        <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-12)', padding: '16px', fontSize: '0.9rem', color: 'var(--text-dim)', whiteSpace: 'pre-wrap', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          {outputBrief}
        </div>
      </div>
    </section>
  );
}
