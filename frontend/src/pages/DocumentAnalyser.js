import React, { useState } from 'react';
import useGemini from '../hooks/useGemini';
import { AiThinking, AiError } from '../components/ai/GeminiPanel';

const S = {
  page: {
    minHeight: '100vh', background: '#fafaf8',
    fontFamily: "'DM Sans', sans-serif", padding: '40px 24px',
  },
  inner: { maxWidth: 860, margin: '0 auto' },
  heading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 400,
    color: '#111', marginBottom: 6, lineHeight: 1.2,
  },
  sub: { fontSize: 14, color: '#888', marginBottom: 32 },
  uploadRow: {
    display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap',
  },
  fileBtn: {
    padding: '8px 18px', borderRadius: 100,
    border: '1px solid #e8e8e4', background: '#fff',
    color: '#888', fontSize: 13, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
  },
  textarea: {
    width: '100%', minHeight: 180, border: '1px solid #e8e8e4',
    borderRadius: 14, padding: '14px 16px',
    fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    color: '#111', resize: 'vertical', outline: 'none',
    background: '#fff', lineHeight: 1.6,
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  analyseBtn: {
    marginTop: 12, padding: '11px 26px', borderRadius: 100,
    background: '#111', color: '#fff', border: 'none',
    fontSize: 14, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 14, marginTop: 28,
  },
  card: (variant) => {
    const colors = {
      default: { bg: '#fff', border: '#e8e8e4', label: '#888' },
      amber: { bg: '#fffbeb', border: '#fde68a', label: '#92400e' },
      red: { bg: '#fff5f5', border: '#fecaca', label: '#dc2626' },
      green: { bg: '#f0fdf4', border: '#bbf7d0', label: '#166534' },
    };
    const c = colors[variant] || colors.default;
    return {
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 14, padding: '16px 18px',
      transition: 'transform 0.25s, box-shadow 0.25s',
    };
  },
  cardLabel: (variant) => {
    const colors = {
      default: '#888', amber: '#92400e', red: '#dc2626', green: '#166534',
    };
    return {
      fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: colors[variant] || '#888',
      marginBottom: 8,
    };
  },
  cardContent: {
    fontSize: 13, color: '#111', lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
  },
  score: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28, fontWeight: 400, color: '#111',
  },
};

function parseAnalysis(text) {
  const get = (key) => {
    const re = new RegExp(`${key}\\s*:\\s*([\\s\\S]+?)(?=\\bSUMMARY\\b|\\bRISK_FLAGS\\b|\\bMISSING_CLAUSES\\b|\\bTONE_SCORE\\b|\\bPLAIN_ENGLISH\\b|$)`, 'i');
    const m = text.match(re);
    return m ? m[1].replace(/\|/g, '').trim() : '';
  };
  return {
    summary: get('SUMMARY'),
    riskFlags: get('RISK_FLAGS'),
    missingClauses: get('MISSING_CLAUSES'),
    toneScore: get('TONE_SCORE'),
    plainEnglish: get('PLAIN_ENGLISH'),
  };
}

export default function DocumentAnalyser() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const { ask, loading, error } = useGemini();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target.result);
    reader.readAsText(file);
  };

  const handleAnalyse = async () => {
    if (!text.trim()) return;
    const prompt = `Analyse this legal document and return exactly:\nSUMMARY: (2 sentences) | RISK_FLAGS: (bullet list of issues) | MISSING_CLAUSES: (what's absent) | TONE_SCORE: (1-10 with reason) | PLAIN_ENGLISH: (client-friendly version under 100 words).\n\nDocument:\n${text.slice(0, 4000)}`;
    const res = await ask(prompt);
    if (res) setResult(parseAnalysis(res));
  };

  const cards = result
    ? [
        { key: 'summary', label: 'Summary', content: result.summary, variant: 'default' },
        { key: 'risk', label: 'Risk Flags', content: result.riskFlags, variant: 'amber' },
        { key: 'missing', label: 'Missing Clauses', content: result.missingClauses, variant: 'red' },
        { key: 'tone', label: 'Tone Score', content: result.toneScore, variant: 'green' },
        { key: 'plain', label: 'Plain English', content: result.plainEnglish, variant: 'default' },
      ]
    : [];

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <h1 style={S.heading}>Document Analyser</h1>
        <p style={S.sub}>Paste a legal document or upload a .txt file to get an instant AI analysis.</p>

        <div style={S.uploadRow}>
          <label style={S.fileBtn}>
            ⊕ Upload .txt
            <input type="file" accept=".txt" style={{ display: 'none' }} onChange={handleFile} />
          </label>
          {text && (
            <span style={{ fontSize: 12, color: '#aaa', alignSelf: 'center' }}>
              {text.length.toLocaleString()} characters
            </span>
          )}
        </div>

        <textarea
          style={S.textarea}
          placeholder="Paste your contract, petition, agreement or any legal document here…"
          value={text}
          onChange={(e) => { setText(e.target.value); setResult(null); }}
        />

        <button
          style={{ ...S.analyseBtn, opacity: loading || !text.trim() ? 0.4 : 1 }}
          onClick={handleAnalyse}
          disabled={loading || !text.trim()}
        >
          {loading ? 'Analysing…' : 'Analyse Document'}
        </button>

        {loading && <AiThinking text="LawMind is analysing your document…" />}
        <AiError error={error} onRetry={handleAnalyse} />

        {result && (
          <div style={S.grid}>
            {cards.map((c) => (
              <div
                key={c.key}
                style={S.card(c.variant)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.07)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={S.cardLabel(c.variant)}>{c.label}</div>
                <div style={S.cardContent}>{c.content || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
