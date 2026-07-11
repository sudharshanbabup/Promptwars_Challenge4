import { useState, useEffect } from 'react';
import { LanguageCode } from '../../domain/types.ts';

interface ActionChecklistProps {
  plan: {
    summary: string;
    urgencyLine: string;
    actions: { title: string; why: string; howLong: string }[];
    kit: { item: string; quantity: string; note: string }[];
    doNots: string[];
    localisedRiskLabel: string;
  } | null;
  language: LanguageCode;
}

export function ActionChecklist({ plan, language }: ActionChecklistProps) {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [speakingItem, setSpeakingItem] = useState<string | null>(null);

  // Sync completion state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('varshamitra_checklist_state');
      if (stored) {
        setCompletedItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load checklist state from localStorage:', e);
    }
  }, []);

  const toggleItem = (title: string) => {
    const nextState = { ...completedItems, [title]: !completedItems[title] };
    setCompletedItems(nextState);
    try {
      localStorage.setItem('varshamitra_checklist_state', JSON.stringify(nextState));
    } catch (e) {
      console.warn('Failed to persist checklist state:', e);
    }
  };

  /**
   * Reads an action out loud using browser Text-to-Speech (TTS).
   */
  const handleSpeak = (textToSpeak: string, itemKey: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text to speech is not supported in this browser.');
      return;
    }

    if (speakingItem === itemKey) {
      window.speechSynthesis.cancel();
      setSpeakingItem(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Map language code to standard Indian BCP47 locales
    const langLocales: Record<LanguageCode, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      ml: 'ml-IN',
      kn: 'kn-IN',
      gu: 'gu-IN',
      or: 'or-IN',
      as: 'as-IN'
    };

    const targetLocale = langLocales[language] || 'en-IN';
    utterance.lang = targetLocale;

    // Fetch matching voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(targetLocale) || v.lang.replace('_', '-').startsWith(targetLocale));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => setSpeakingItem(null);
    utterance.onerror = () => setSpeakingItem(null);

    setSpeakingItem(itemKey);
    window.speechSynthesis.speak(utterance);
  };

  if (!plan) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Plan Header */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
          Personalized Safety Action Plan
        </h2>
        <p style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          {plan.localisedRiskLabel}
        </p>
        <p style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: '0.5rem' }}>{plan.summary}</p>
        <p style={{ fontSize: '0.85rem', color: '#f97316', fontWeight: 'bold' }}>⚠️ {plan.urgencyLine}</p>
      </div>

      {/* Action Items List */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Required Actions</h3>
        {plan.actions.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No immediate hazard actions required.</p>
        ) : (
          <div>
            {plan.actions.map((act) => {
              const isDone = !!completedItems[act.title];
              const speakText = `${act.title}. ${act.why}. Estimated time: ${act.howLong}.`;
              return (
                <div className="checklist-item" key={act.title} style={{ opacity: isDone ? 0.6 : 1 }}>
                  <input
                    type="checkbox"
                    className="checklist-checkbox"
                    checked={isDone}
                    onChange={() => toggleItem(act.title)}
                  />
                  <div className="checklist-text">
                    <div className="checklist-title" style={{ textDecoration: isDone ? 'line-through' : 'none' }}>
                      {act.title}
                    </div>
                    <div className="checklist-desc" style={{ marginTop: '0.2rem' }}>{act.why}</div>
                    <div style={{ fontSize: '0.75rem', color: '#a855f7', marginTop: '0.25rem', fontWeight: '500' }}>
                      ⏱️ Duration: {act.howLong}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSpeak(speakText, act.title)}
                    style={{
                      minHeight: '36px',
                      height: '36px',
                      padding: '0 0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      backgroundColor: speakingItem === act.title ? '#ef4444' : 'rgba(255,255,255,0.05)',
                      color: speakingItem === act.title ? '#fff' : '#f8fafc',
                      borderColor: speakingItem === act.title ? 'transparent' : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    {speakingItem === act.title ? '⏹️ Stop' : '🔊 Speak'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Do Nots (Danger list) */}
      {plan.doNots.length > 0 && (
        <div className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fca5a5', marginBottom: '0.5rem' }}>
            🚫 Crucial Do Nots
          </h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {plan.doNots.map((str, idx) => (
              <li key={idx} style={{ fontSize: '0.9rem', color: '#fca5a5' }}>{str}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Emergency Kit Checkoff */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>🎒 Emergency Kit Checklist</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {plan.kit.map((k) => {
            const isDone = !!completedItems[k.item];
            return (
              <label
                key={k.item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  opacity: isDone ? 0.6 : 1
                }}
              >
                <input
                  type="checkbox"
                  className="checklist-checkbox"
                  checked={isDone}
                  onChange={() => toggleItem(k.item)}
                  style={{ width: '20px', height: '20px', minHeight: '20px' }}
                />
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {k.item}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                    ({k.quantity}) - {k.note}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default ActionChecklist;
