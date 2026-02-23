import React, { useState, useEffect, useRef } from 'react';
import useGemini from '../../hooks/useGemini';
import { AiThinking, AiError } from './GeminiPanel';

const S = {
  wrap: { marginTop: 12 },
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 100,
    background: '#111', color: '#fff', border: 'none',
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s',
  },
  chips: {
    display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12,
  },
  chip: (sel) => ({
    borderRadius: 100, padding: '6px 14px',
    background: sel ? '#111' : '#fff',
    color: sel ? '#fff' : '#111',
    border: sel ? 'none' : '1px solid #e8e8e4',
    fontSize: 12, cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
  }),
  tooltip: {
    position: 'absolute', bottom: '110%', left: '50%',
    transform: 'translateX(-50%)',
    background: '#111', color: '#fff', borderRadius: 8,
    padding: '6px 10px', fontSize: 11, lineHeight: 1.5,
    whiteSpace: 'nowrap', maxWidth: 220, whiteSpace: 'normal',
    zIndex: 99, pointerEvents: 'none',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  },
};

function parseSection(line) {
  const parts = line.split('|').map((s) => s.trim());
  if (parts.length >= 3) {
    return { section: parts[0], act: parts[1], description: parts[2] };
  }
  if (parts.length === 2) {
    return { section: parts[0], act: parts[1], description: '' };
  }
  return { section: line.trim(), act: '', description: '' };
}

export default function SectionSuggester({ caseType, documentType, facts, onSelect, selected = [] }) {
  const [suggestions, setSuggestions] = useState([]);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const { ask, loading, error } = useGemini();
  const prevKey = useRef('');

  const load = async () => {
    if (!caseType || !documentType || !facts || facts.length < 20) return;
    const key = `${caseType}|${documentType}|${facts.slice(0, 60)}`;
    if (key === prevKey.current) return;
    prevKey.current = key;

    const prompt = `For a ${documentType} in a ${caseType} case with these facts: ${facts} — list exactly 6 applicable Indian legal sections. Format each as: SECTION_NAME | ACT | ONE_LINE_DESCRIPTION. Only output the 6 lines, nothing else.`;
    const res = await ask(prompt);
    if (!res) return;
    const lines = res.split('\n').map((l) => l.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean).slice(0, 6);
    setSuggestions(lines.map(parseSection));
  };

  // Auto-fetch when facts change enough
  useEffect(() => {
    if (facts && facts.length >= 20) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseType, documentType]);

  const isSelected = (sec) => selected.some((s) => s.section === sec.section);

  return (
    <div style={S.wrap}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          style={{ ...S.btn, opacity: loading ? 0.5 : 1 }}
          onClick={load}
          disabled={loading}
        >
          ✦ AI Section Suggestions
        </button>
        {loading && <AiThinking text="Fetching sections…" />}
      </div>
      <AiError error={error} />

      {suggestions.length > 0 && (
        <div style={S.chips}>
          {suggestions.map((sec, i) => (
            <div
              key={i}
              style={{ position: 'relative', display: 'inline-block' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div style={S.chip(isSelected(sec))} onClick={() => onSelect(sec)}>
                {sec.section} {sec.act ? `— ${sec.act}` : ''}
                {isSelected(sec) && ' ✓'}
              </div>
              {hoveredIdx === i && sec.description && (
                <div style={S.tooltip}>{sec.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
