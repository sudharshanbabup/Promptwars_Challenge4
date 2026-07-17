import React, { useState, useMemo, useCallback } from 'react';
import { useRole } from '../../context/RoleContext.jsx';
import { useAssist } from '../../hooks/useAssist.js';
import { getMetrics } from '../../lib/sustainMetrics.js';
import { rankModes } from '../../lib/co2Rank.js';
import { Spinner } from '../common/Spinner.jsx';
import { ErrorNote } from '../common/ErrorNote.jsx';

const TRAVEL_MODES = [
  { id: 'walk', label: 'Walk' },
  { id: 'transit', label: 'Transit' },
  { id: 'bike', label: 'Bicycle' },
  { id: 'ev', label: 'Electric Vehicle' },
  { id: 'car', label: 'Combustion Car' },
  { id: 'rideshare', label: 'Rideshare' }
];

/**
 * Sustainability & Transport Advisory panel.
 * 
 * @returns {React.ReactElement}
 */
export default function Sustainability() {
  const { role } = useRole();
  const { loading, error, data, run } = useAssist();
  const [selectedModes, setSelectedModes] = useState({ walk: true, transit: true, bike: false, ev: false, car: false, rideshare: false });

  const mockHour = 19;
  const metrics = useMemo(() => getMetrics(mockHour), [mockHour]);
  const activeModes = useMemo(() => Object.keys(selectedModes).filter(m => selectedModes[m]), [selectedModes]);
  const localRanks = useMemo(() => rankModes(activeModes), [activeModes]);

  const handleRankModes = useCallback(async () => {
    await run('sustainability', role, { selectedModes: activeModes, metrics });
  }, [activeModes, metrics, role, run]);

  const advisoryResult = useMemo(() => {
    return data ? data : '[Offline Carbon Advisory]\nGreenest Travel Suggestion: Walk or take Public Transit.\nThese transport options yield a "Zero" or "Low" CO2 footprint.';
  }, [data]);

  return (
    <section aria-labelledby="sustain-title" className="glass-panel flex-col gap-16">
      <h2 id="sustain-title" style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>♻️ Sustainability & Transport</h2>

      <div className="flex-col gap-8">
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Stadium Environmental Metrics</h3>
        <div className="grid-4">
          <div className="card-metric"><span>Waste Diverted</span><div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{metrics.wasteDivertedPercent}%</div></div>
          <div className="card-metric"><span>Water Saved</span><div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{metrics.waterSavedPercent}%</div></div>
          <div className="card-metric"><span>Renewable Power</span><div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{metrics.renewableEnergyPercent}%</div></div>
          <div className="card-metric"><span>Transit Share</span><div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{metrics.transitSharePercent}%</div></div>
        </div>
      </div>

      <fieldset style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-12)', padding: '16px' }}>
        <legend style={{ padding: '0 8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>Compare Modes</legend>
        <div className="grid-2">
          {TRAVEL_MODES.map((mode) => (
            <label key={mode.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minHeight: 'var(--min-touch)', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={selectedModes[mode.id]} onChange={() => setSelectedModes(p => ({ ...p, [mode.id]: !p[mode.id] }))} style={{ width: '20px', height: '20px' }} />
              {mode.label}
            </label>
          ))}
        </div>
      </fieldset>

      <button type="button" onClick={handleRankModes} disabled={loading} className="primary" style={{ alignSelf: 'flex-start' }}>
        {loading ? 'Evaluating...' : '♻️ Analyze Footprint'}
      </button>

      {loading && <Spinner />}
      {error && <ErrorNote message={error} onRetry={handleRankModes} />}

      <div className="grid-2" style={{ marginTop: '8px' }}>
        <div className="card-metric flex-col gap-8">
          <h3 style={{ fontSize: '0.9rem' }}>Carbon Ranks</h3>
          <div className="flex-col gap-4">
            {localRanks.map((r, idx) => (
              <div key={r.mode} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px' }}>
                <span>{idx + 1}. {r.mode.toUpperCase()}</span>
                <span style={{ color: r.co2 === 'Zero' ? 'var(--ok)' : r.co2 === 'Low' ? 'var(--accent)' : r.co2 === 'Medium' ? 'var(--warn)' : 'var(--danger)', fontWeight: 'bold' }}>{r.co2}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-col gap-8">
          <h3 style={{ fontSize: '0.9rem' }}>{role === 'organizer' ? 'AI Recommendations:' : 'Advisory Notes:'}</h3>
          <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-12)', padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-dim)', whiteSpace: 'pre-wrap', flex: 1 }}>
            {advisoryResult}
          </div>
        </div>
      </div>
    </section>
  );
}
