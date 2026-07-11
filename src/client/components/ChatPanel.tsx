import { useState } from 'react';

interface ChatPanelProps {
  digest: any;
}

export function ChatPanel({ digest }: ChatPanelProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!digest) {
      alert('Please analyze your risk profile first to provide context for the assistant.');
      return;
    }

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          profileDigest: digest,
          history
        })
      });

      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'model', text: data.text }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'model', text: 'Failed to connect. Please follow standard safety measures and local bulletins.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
        💬 Chat Assistant
      </h3>

      <div style={{
        height: '220px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingRight: '0.25rem'
      }}>
        {messages.length === 0 && (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', marginTop: '3rem' }}>
            Ask VarshaMitra any monsoon safety or travel preparedness questions.
          </p>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
              color: '#f8fafc',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              maxWidth: '85%',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              wordBreak: 'break-word'
            }}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', paddingLeft: '0.25rem' }}>
            VarshaMitra is formulating safety advice...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{ flex: 1, backgroundColor: '#0f172a', color: '#f8fafc' }}
        />
        <button type="button" onClick={sendMessage} className="primary" style={{ padding: '0 1rem' }}>
          Send
        </button>
      </div>
    </div>
  );
}
export default ChatPanel;
