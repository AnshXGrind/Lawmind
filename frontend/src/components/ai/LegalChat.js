import React, { useState, useRef, useEffect } from 'react';
import useGemini from '../../hooks/useGemini';
import { AiThinking, AiError } from './GeminiPanel';

const S = {
  fab: {
    position: 'fixed', bottom: 28, right: 28, zIndex: 500,
    width: 52, height: 52, borderRadius: '50%',
    background: '#111', color: '#fff', border: 'none',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s, opacity 0.2s',
  },
  window: (open) => ({
    position: 'fixed', bottom: 92, right: 28, zIndex: 499,
    width: 380, height: 520,
    background: '#fff', borderRadius: 16,
    border: '1px solid #e8e8e4',
    boxShadow: '0 16px 64px rgba(0,0,0,0.12)',
    display: 'flex', flexDirection: 'column',
    transform: open ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
    opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
    transition: 'transform 0.25s ease, opacity 0.25s ease',
    transformOrigin: 'bottom right',
    '@media (max-width:480px)': {
      width: '100vw', height: '100vh', bottom: 0, right: 0, borderRadius: 0,
    },
  }),
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', borderBottom: '1px solid #e8e8e4', flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  headerTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 15, fontWeight: 500, color: '#111',
  },
  headerSub: { fontSize: 11, color: '#888', marginTop: 1 },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#888', fontSize: 18, lineHeight: 1, padding: '2px 5px',
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  msg: (role) => ({
    maxWidth: '85%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    background: role === 'user' ? '#111' : '#fafaf8',
    color: role === 'user' ? '#fff' : '#111',
    border: role === 'user' ? 'none' : '1px solid #e8e8e4',
    borderRadius: role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
    padding: '10px 13px',
    fontSize: 13, lineHeight: 1.6,
  }),
  ts: { fontSize: 10, color: '#bbb', marginTop: 4, textAlign: 'right' },
  inputRow: {
    borderTop: '1px solid #e8e8e4', padding: '10px 12px',
    display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0,
  },
  textarea: {
    flex: 1, border: '1px solid #e8e8e4', borderRadius: 10,
    padding: '9px 12px', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    resize: 'none', outline: 'none', lineHeight: 1.5, maxHeight: 100,
    overflow: 'hidden', transition: 'border-color 0.2s',
  },
  sendBtn: {
    width: 34, height: 34, borderRadius: '50%',
    background: '#111', color: '#fff', border: 'none',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'opacity 0.2s',
  },
};

const ScalesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22"/>
    <path d="M5 6l7-4 7 4"/>
    <path d="M5 6v4a7 7 0 0 0 7 7 7 7 0 0 0 7-7V6"/>
  </svg>
);

export default function LegalChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Namaste. I am LawMind, your AI legal assistant. Ask me anything about Indian law — bail eligibility, IPC sections, case strategy, or document drafting.',
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const { ask, loading, error } = useGemini();
  const bottomRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: 'user', text, time: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    if (taRef.current) taRef.current.style.height = 'auto';

    const prompt = `You are a legal assistant. Answer this question with relevant Indian law sections and precedents: ${text}`;
    const result = await ask(prompt);
    if (result) {
      setMessages((m) => [...m, { role: 'assistant', text: result, time: new Date() }]);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Floating button */}
      <button
        style={S.fab}
        onClick={() => setOpen((o) => !o)}
        title="Open Legal Chat"
        aria-label="Open AI legal chat"
      >
        {open ? '✕' : <ScalesIcon />}
      </button>

      {/* Chat window */}
      <div style={S.window(open)} aria-live="polite">
        <div style={S.header}>
          <div style={S.headerLeft}>
            <div>
              <div style={S.headerTitle}>LawMind Chat</div>
              <div style={S.headerSub}>AI Legal Assistant</div>
            </div>
          </div>
          <button style={S.closeBtn} onClick={() => setOpen(false)}>✕</button>
        </div>

        <div style={S.messages}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={S.msg(m.role)}>{m.text}</div>
              <div style={S.ts}>{fmt(m.time)}</div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start' }}>
              <AiThinking />
            </div>
          )}
          {error && <AiError error={error} onRetry={handleSend} />}
          <div ref={bottomRef} />
        </div>

        <div style={S.inputRow}>
          <textarea
            ref={taRef}
            style={S.textarea}
            placeholder="Ask about Indian law…"
            value={input}
            rows={1}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={handleKey}
          />
          <button style={{ ...S.sendBtn, opacity: loading || !input.trim() ? 0.4 : 1 }} onClick={handleSend} aria-label="Send">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
