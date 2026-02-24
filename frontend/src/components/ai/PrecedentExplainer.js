import React, { useState } from 'react';
import useGemini from '../../hooks/useGemini';
import { GeminiModal, AiThinking, AiError } from './GeminiPanel';

const S = {
  triggerBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 100,
    background: '#fff', color: '#111', border: '1px solid #e8e8e4',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  inputArea: {
    width: '100%', minHeight: 100, border: '1px solid #e8e8e4',
    borderRadius: 12, padding: '12px 14px', fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", color: '#111', resize: 'vertical',
    outline: 'none', lineHeight: 1.6, background: '#fafaf8',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  },
  askBtn: {
    marginTop: 10, padding: '9px 22px', borderRadius: 100,
    background: '#111', color: '#fff', border: 'none',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.2s',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 12, marginTop: 16,
  },
  card: (color) => ({
    background: color.bg, border: `1px solid ${color.border}`,
    borderRadius: 12, padding: '14px 16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }),
  cardLabel: (color) => ({
    fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: color.label, marginBottom: 8,
  }),
  cardContent: {
    fontSize: 13, color: '#111', lineHeight: 1.65,
  },
  insertBtn: {
    display: 'block', marginTop: 16, padding: '9px 22px', borderRadius: 100,
    background: '#111', color: '#fff', border: 'none',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.2s',
  },
  ghostBtn: {
    padding: '9px 20px', borderRadius: 100,
    background: '#fff', color: '#888', border: '1px solid #e8e8e4',
    fontSize: 13, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", marginLeft: 8,
  },
  label: { fontSize: 13, color: '#888', marginBottom: 8 },
};

const COLORS = [
  { bg: '#fafaf8', border: '#e8e8e4', label: '#888' },
  { bg: '#eff6ff', border: '#bfdbfe', label: '#1e40af' },
  { bg: '#fef3c7', border: '#fde68a', label: '#92400e' },
];

function parsePrecedent(text) {
  const get = (n) => (text.match(new RegExp(`${n}[:\\s)]+([\\s\\S]+?)(?=(?:1\\)|2\\)|3\\)|$))`, 'i')) || [])[1]?.trim() || '';
  return {
    explanation: get('1'),
    howToUse: get('2'),
    limitations: get('3'),
  };
}

export default function PrecedentExplainer({ caseType, onInsert }) {
  const [open, setOpen] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [result, setResult] = useState(null);
  const { ask, loading, error } = useGemini();

  const explain = async () => {
    setResult(null);
    const prompt = `Explain this Indian court judgment excerpt in simple terms. Then state: 1) What legal principle it establishes 2) How it can be used in a ${caseType || 'civil'} case 3) Any limitations or opposing precedents.\n\nExcerpt:\n${excerpt}`;
    const res = await ask(prompt);
    if (res) setResult(parsePrecedent(res));
  };

  const handleInsert = () => {
    if (!result) return;
    const citation = `\n\n---\nPRECEDENT NOTE\n\n${result.explanation}\n\nApplication: ${result.howToUse}\n\nLimitations: ${result.limitations}\n---\n`;
    onInsert && onInsert(citation);
    setOpen(false);
  };

  const cards = result
    ? [
        { label: 'Explanation', content: result.explanation, color: COLORS[0] },
        { label: 'How to Use', content: result.howToUse, color: COLORS[1] },
        { label: 'Limitations', content: result.limitations, color: COLORS[2] },
      ]
    : [];

  return (
    <>
      <button style={S.triggerBtn} onClick={() => setOpen(true)} title="Explain a precedent">
        📚 Precedent
      </button>

      <GeminiModal open={open} onClose={() => { setOpen(false); setResult(null); }} title="Precedent Explainer">
        <p style={S.label}>Paste a court judgment excerpt to get a plain-language explanation.</p>
        <textarea
          style={S.inputArea}
          placeholder="Paste judgment excerpt here…"
          value={excerpt}
          onChange={(e) => { setExcerpt(e.target.value); setResult(null); }}
        />
        <button
          style={{ ...S.askBtn, opacity: !excerpt.trim() || loading ? 0.4 : 1 }}
          onClick={explain}
          disabled={!excerpt.trim() || loading}
        >
          Explain Precedent
        </button>

        {loading && <AiThinking text="Analysing judgment…" />}
        <AiError error={error} onRetry={explain} />

        {result && (
          <>
            <div style={S.grid}>
              {cards.map((c) => (
                <div
                  key={c.label}
                  style={S.card(c.color)}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={S.cardLabel(c.color)}>{c.label}</div>
                  <div style={S.cardContent}>{c.content || '—'}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button style={S.insertBtn} onClick={handleInsert}>Insert into Draft</button>
              <button style={S.ghostBtn} onClick={() => setOpen(false)}>Close</button>
            </div>
          </>
        )}
      </GeminiModal>
    </>
  );
}
