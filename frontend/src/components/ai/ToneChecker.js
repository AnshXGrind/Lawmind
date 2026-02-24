import React, { useState } from 'react';
import useGemini from '../../hooks/useGemini';
import { GeminiPanel, AiThinking, AiError } from './GeminiPanel';

const S = {
  triggerBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 100,
    background: '#fff', color: '#111', border: '1px solid #e8e8e4',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  scoreRow: {
    display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 18,
  },
  scoreNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 48, fontWeight: 400, lineHeight: 1, color: '#111',
  },
  scoreLabel: { fontSize: 13, color: '#888', marginBottom: 8 },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#888', marginBottom: 8,
  },
  issue: {
    background: '#fffbeb', border: '1px solid #fde68a',
    borderRadius: 10, padding: '8px 12px', fontSize: 13,
    color: '#92400e', marginBottom: 6, lineHeight: 1.5,
  },
  rewriteBox: {
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 12, padding: '12px 14px', fontSize: 13,
    color: '#111', lineHeight: 1.7, whiteSpace: 'pre-wrap',
    marginBottom: 12,
  },
  replaceBtn: {
    padding: '9px 20px', borderRadius: 100,
    background: '#111', color: '#fff', border: 'none',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.2s',
  },
  ghostBtn: {
    padding: '9px 20px', borderRadius: 100,
    background: '#fff', color: '#888', border: '1px solid #e8e8e4',
    fontSize: 13, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
    marginLeft: 8,
  },
};

function parseTone(text) {
  const score = (text.match(/TONE_SCORE\s*:\s*(\d+)/i) || [])[1] || '—';
  const issuesRaw = (text.match(/ISSUES\s*:\s*([\s\S]+?)(?=REWRITE|$)/i) || [])[1] || '';
  const rewrite = (text.match(/REWRITE\s*:\s*([\s\S]+?)$/i) || [])[1] || '';
  const issues = issuesRaw
    .split('\n')
    .map(l => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
  return { score, issues, rewrite: rewrite.trim() };
}

export default function ToneChecker({ content, selectedText, onReplace }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(null);
  const { ask, loading, error } = useGemini();

  const check = async () => {
    setOpen(true);
    setResult(null);
    const text = selectedText || content || '';
    const prompt = `Analyse this legal text for court appropriateness. Return:\nTONE_SCORE: X/10 | ISSUES: (list informal phrases found) | REWRITE: (formally rewritten version).\n\nText:\n${text.slice(0, 3000)}`;
    const res = await ask(prompt);
    if (res) setResult(parseTone(res));
  };

  return (
    <>
      <button style={S.triggerBtn} onClick={check} title="Check legal tone">
        ⚖ Check Tone
      </button>

      <GeminiPanel open={open} onClose={() => setOpen(false)} title="Tone Checker">
        {loading && <AiThinking text="Analysing tone…" />}
        <AiError error={error} onRetry={check} />

        {result && (
          <>
            <div style={S.scoreRow}>
              <div style={S.scoreNum}>{result.score}</div>
              <div style={S.scoreLabel}>/ 10<br />Tone Score</div>
            </div>

            {result.issues.length > 0 && (
              <div style={S.section}>
                <div style={S.sectionLabel}>Informal Phrases Found</div>
                {result.issues.map((iss, i) => (
                  <div key={i} style={S.issue}>{iss}</div>
                ))}
              </div>
            )}

            {result.rewrite && (
              <div style={S.section}>
                <div style={S.sectionLabel}>Formally Rewritten</div>
                <div style={S.rewriteBox}>{result.rewrite}</div>
                <div>
                  <button
                    style={S.replaceBtn}
                    onClick={() => { onReplace && onReplace(result.rewrite); setOpen(false); }}
                  >
                    Replace Draft
                  </button>
                  <button style={S.ghostBtn} onClick={() => setOpen(false)}>Dismiss</button>
                </div>
              </div>
            )}
          </>
        )}
      </GeminiPanel>
    </>
  );
}
