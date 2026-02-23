import React, { useState, useEffect, useRef } from 'react';
import useGemini from '../../hooks/useGemini';
import { AiThinking, AiError } from './GeminiPanel';

const S = {
  toggleRow: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
  },
  toggleBtn: (on) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 100,
    border: on ? 'none' : '1px solid #e8e8e4',
    background: on ? '#111' : '#fff',
    color: on ? '#fff' : '#888',
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
  }),
  panel: {
    marginTop: 10, padding: '16px 18px',
    background: '#fafaf8', border: '1px solid #e8e8e4',
    borderRadius: 14,
    animation: 'lm-slideDown 0.25s ease',
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12,
  },
  card: {
    background: '#fff', border: '1px solid #e8e8e4',
    borderRadius: 12, padding: '12px 14px',
  },
  cardLabel: {
    fontSize: 11, fontWeight: 600, color: '#888',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
  },
  cardContent: {
    fontSize: 13, color: '#111', lineHeight: 1.6,
  },
};

function parseAssistantResponse(text) {
  const get = (label) => {
    const re = new RegExp(`${label}[:\\s]+([\\s\\S]+?)(?=(?:1\\)|2\\)|3\\)|4\\)|📋|⚖️|💡|❓|$))`, 'i');
    const m = text.match(re);
    return m ? m[1].trim() : '';
  };

  // Try numbered format
  const docType = get('1\\)') || get('document type') || get('best document type');
  const sections = get('2\\)') || get('applicable ipc') || get('ipc') || get('sections');
  const arguments_ = get('3\\)') || get('key arguments') || get('arguments');
  const missing = get('4\\)') || get('missing information') || get('missing');

  return { docType, sections, arguments: arguments_, missing };
}

export default function DraftAssistant({ facts, caseType, documentType }) {
  const [on, setOn] = useState(false);
  const [result, setResult] = useState(null);
  const { ask, loading, error } = useGemini();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!on || !facts || facts.length < 30) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const prompt = `Based on these case facts, suggest: 1) The best document type 2) Top 5 applicable IPC/CrPC sections with reasons 3) Key arguments to include 4) One sentence of missing information to ask the client.\n\nFacts: ${facts}`;
      const res = await ask(prompt);
      if (res) setResult(parseAssistantResponse(res));
    }, 1200);
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facts, on]);

  const cards = result
    ? [
        { icon: '📋', label: 'Doc Type', content: result.docType },
        { icon: '⚖️', label: 'Sections', content: result.sections },
        { icon: '💡', label: 'Arguments', content: result.arguments },
        { icon: '❓', label: 'Missing Info', content: result.missing },
      ]
    : [];

  return (
    <div>
      <div style={S.toggleRow}>
        <button style={S.toggleBtn(on)} onClick={() => setOn((v) => !v)}>
          <span>{on ? '●' : '○'}</span>
          AI Assist {on ? 'ON' : 'OFF'}
        </button>
        {on && facts && facts.length < 30 && (
          <span style={{ fontSize: 12, color: '#888' }}>Type 30+ characters to activate…</span>
        )}
      </div>

      {on && (
        <div style={S.panel}>
          {loading && <AiThinking />}
          <AiError error={error} />
          {!loading && !result && !error && facts.length >= 30 && (
            <span style={{ fontSize: 12, color: '#aaa' }}>Analysing facts…</span>
          )}
          {result && (
            <div style={S.grid}>
              {cards.map((c) => (
                <div key={c.label} style={S.card}>
                  <div style={S.cardLabel}>{c.icon} {c.label}</div>
                  <div style={S.cardContent}>{c.content || '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes lm-slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
