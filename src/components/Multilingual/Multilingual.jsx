import React, { useState, useMemo, useCallback } from 'react';
import { useRole } from '../../context/RoleContext.jsx';
import { useAssist } from '../../hooks/useAssist.js';
import { SUPPORTED_LANGUAGES, validateLangPair } from '../../lib/languages.js';
import { Spinner } from '../common/Spinner.jsx';
import { ErrorNote } from '../common/ErrorNote.jsx';
import { Toast } from '../common/Toast.jsx';

const SCENARIOS = [
  { id: 'lost_child', label: 'Lost Child', text: 'Lost child: wearing blue cap near Section 110.' },
  { id: 'medical', label: 'Medical Alert', text: 'Medical responder needed at Gate B.' },
  { id: 'gate_change', label: 'Gate Alert', text: 'Attention: Gate change from Gate C to Gate E.' },
  { id: 'ticket_issue', label: 'Ticket Issue', text: 'Ticket barcode scan failed at turnstile.' }
];

/**
 * Multilingual Assistant panel.
 * 
 * @returns {React.ReactElement}
 */
export default function Multilingual() {
  const { role } = useRole();
  const { loading, error, data, run } = useAssist();
  const [sourceLang, setSourceLang] = useState('EN');
  const [targetLang, setTargetLang] = useState('ES');
  const [text, setText] = useState('');
  const [copiedMsg, setCopiedMsg] = useState(null);

  const handleTranslate = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    try {
      validateLangPair(sourceLang, targetLang);
      await run('multilingual', role, { text: text.trim(), sourceLang, targetLang });
    } catch (err) {
      alert(err.message);
    }
  }, [text, sourceLang, targetLang, role, run]);

  const handleCopy = useCallback(() => {
    if (!data) return;
    navigator.clipboard.writeText(data)
      .then(() => setCopiedMsg('Translation copied!'))
      .catch(() => {});
  }, [data]);

  const outputText = useMemo(() => {
    return data ? data : text.trim() 
      ? `[Offline translation: ${sourceLang} -> ${targetLang}]\nTranslation: "${text}"\nService offline.` 
      : 'Select a scenario or type custom text below.';
  }, [data, text, sourceLang, targetLang]);

  return (
    <section aria-labelledby="lang-title" className="glass-panel flex-col gap-16">
      <h2 id="lang-title" style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>🌐 Multilingual Assistant</h2>

      <div className="flex-col gap-8">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Quick Emergency Scenarios:</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SCENARIOS.map((sc) => (
            <button key={sc.id} type="button" onClick={() => setText(sc.text)} style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)', borderRadius: '8px', padding: '4px 12px', minHeight: '38px' }}>
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleTranslate} className="flex-col gap-12">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="flex-col gap-4" style={{ flex: 1, minWidth: '120px' }}>
            <label htmlFor="source-lang" style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>From</label>
            <select id="source-lang" value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
              {SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex-col gap-4" style={{ flex: 1, minWidth: '120px' }}>
            <label htmlFor="target-lang" style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>To</label>
            <select id="target-lang" value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
              {SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-col gap-4">
          <label htmlFor="translation-input" style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Phrase to Translate</label>
          <textarea id="translation-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type message..." style={{ height: '70px', resize: 'vertical' }} />
        </div>
        <button type="submit" disabled={loading} className="primary" style={{ alignSelf: 'flex-start' }}>
          {loading ? 'Translating...' : '🌐 Translate'}
        </button>
      </form>

      {loading && <Spinner />}
      {error && <ErrorNote message={error} onRetry={handleTranslate} />}

      <div aria-live="polite" className="flex-col gap-12" style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem' }}>Result:</h3>
          {data && <button type="button" onClick={handleCopy} style={{ backgroundColor: 'var(--surface-2)', color: 'var(--accent)', border: '1px solid var(--accent)', fontSize: '0.8rem', padding: '4px 12px', minHeight: '36px', borderRadius: '8px' }}>📋 Copy</button>}
        </div>
        <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-12)', padding: '16px', fontSize: '0.95rem', color: 'var(--text-dim)', whiteSpace: 'pre-wrap', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          {outputText}
        </div>
      </div>
      {copiedMsg && <Toast message={copiedMsg} onClose={() => setCopiedMsg(null)} />}
    </section>
  );
}
