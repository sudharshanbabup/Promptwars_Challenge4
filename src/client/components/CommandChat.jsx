import React, { useState } from 'react';

/**
 * CommandChat component for conversational queries with operations AI.
 * 
 * @param {object} props
 * @param {object} props.digest - Dynamic safety digest.
 * @returns {React.ReactElement}
 */
export default function CommandChat({ digest }) {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'FIFA 2026 Operations Center online. How can I assist you at the stadium today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const newMsgs = [...messages, { role: 'user', text }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          profileDigest: digest,
          history: newMsgs.slice(-5)
        })
      });

      if (!response.ok) {
        throw new Error('Operations chat API returned an error');
      }

      const json = await response.json();
      setMessages([...newMsgs, { role: 'model', text: json.text }]);
    } catch (error) {
      setMessages([...newMsgs, { role: 'model', text: 'Offline mode: Please follow local stewards or watch overhead monitors.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = (text) => {
    sendMessage(text);
  };

  return (
    <div className="card" style={{ padding: 'var(--space-20)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
      <h2 style={{ marginTop: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        💬 Command Chat
      </h2>

      {/* Messages Window */}
      <div style={{ flex: 1, minHeight: '200px', maxHeight: '300px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--rounded-md)', padding: 'var(--space-12)', marginBottom: 'var(--space-12)' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            textAlign: msg.role === 'user' ? 'right' : 'left',
            marginBottom: 'var(--space-8)'
          }}>
            <div style={{
              display: 'inline-block',
              padding: 'var(--space-8) var(--space-12)',
              borderRadius: 'var(--rounded-md)',
              background: msg.role === 'user' ? 'var(--primary-container)' : 'rgba(255,255,255,0.08)',
              color: msg.role === 'user' ? 'var(--on-primary-container)' : 'inherit',
              maxWidth: '85%',
              fontSize: '0.85rem',
              textAlign: 'left'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operations Bot is writing...</div>}
      </div>

      {/* Quick Prompts Suggestions */}
      <div style={{ marginBottom: 'var(--space-12)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>Quick queries:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <button onClick={() => handleSuggest('Find nearest first aid station')} className="btn-secondary" style={{ padding: '4px var(--space-8)', fontSize: '0.7rem' }}>
            🏥 First Aid
          </button>
          <button onClick={() => handleSuggest('Which transit gates are less busy?')} className="btn-secondary" style={{ padding: '4px var(--space-8)', fontSize: '0.7rem' }}>
            🚆 Transit wait
          </button>
          <button onClick={() => handleSuggest('How do I recycle my beverage cups?')} className="btn-secondary" style={{ padding: '4px var(--space-8)', fontSize: '0.7rem' }}>
            ♻️ Recycling
          </button>
        </div>
      </div>

      {/* Input bar */}
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} style={{ display: 'flex', gap: 'var(--space-8)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask operations AI..."
          style={{ flex: 1 }}
          aria-label="Ask operations AI input"
        />
        <button type="submit" disabled={loading || !input.trim()}>Send</button>
      </form>
    </div>
  );
}
