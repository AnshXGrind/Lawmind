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
    width: '100%', minHeight: 90, border: '1px solid #e8e8e4',
    borderRadius: 12, padding: '12px 14px', fontSize: 13,
    fontFamily: "'DM Sans', sans-serif", color: '#111', resize: 'vertical',
    outline: 'none', lineHeight: 1.6, background: '#fafaf8',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  },
  generateBtn: {
    marginTop: 10, padding: '9px 22px', borderRadius: 100,
    background: '#111', color: '#fff', border: 'none',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.2s',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12, marginTop: 16,
  },
  card: {
    background: '#fff', border: '1px solid #e8e8e4', borderRadius: 14,
    padding: '16px', transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  counterNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22, color: '#ddd', lineHeight: 1,
  },
  counterText: {
    fontSize: 13, color: '#111', lineHeight: 1.6, fontWeight: 500,
  },
  metaLabel: {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#888', marginTop: 4,
  },
  metaValue: { fontSize: 12, color: '#555', lineHeight: 1.5 },
  addBtn: {
    marginTop: 'auto', padding: '7px 14px', borderRadius: 100,
    background: '#111', color: '#fff', border: 'none',
    fontSize: 12, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.2s',
  },
  ghostBtn: {
    padding: '9px 20px', borderRadius: 100,
    background: '#fff', color: '#888', border: '1px solid #e8e8e4',
    fontSize: 13, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", marginTop: 12,
  },
  label: { fontSize: 13, color: '#888', marginBottom: 8 },
};

function parseCounters(text) {
  // Try to split on || delimiter or numbered blocks
  const blocks = text.split(/\|\|/).map(b => b.trim()).filter(Boolean);
  return blocks.slice(0, 3).map((block, i) => {
    const counter = (block.match(/COUNTER_\d\s*:\s*([\s\S]+?)(?=SECTION:|CASE:|$)/i) || block.match(/^([\s\S]+?)(?=SECTION:|CASE:|$)/i) || [])[1]?.trim() || block;
    const section = (block.match(/SECTION\s*:\s*([\s\S]+?)(?=CASE:|$)/i) || [])[1]?.trim() || '';
    const caseRef = (block.match(/CASE\s*:\s*([\s\S]+?)$/i) || [])[1]?.trim() || '';
    return { num: i + 1, counter, section, case: caseRef };
  });
}

export default function CounterArgumentGenerator({ content, onAddToDraft }) {
  const [open, setOpen] = useState(false);
  const [argument, setArgument] = useState('');
  const [counters, setCounters] = useState([]);
  const { ask, loading, error } = useGemini();

  const generate = async () => {
    setCounters([]);
    const prompt = `The opposing counsel has argued: ${argument}\n\nGenerate 3 strong legal counter-arguments for an Indian court. For each: state the counter-argument, cite the relevant section or precedent, and suggest 1 supporting case.\n\nFormat as:\nCOUNTER_1: | SECTION: | CASE: || COUNTER_2: | SECTION: | CASE: || COUNTER_3: | SECTION: | CASE:`;
    const res = await ask(prompt);
    if (res) setCounters(parseCounters(res));
  };

  const handleAdd = (c) => {
    const block = `\n\n---\nCOUNTER-ARGUMENT ${c.num}\n\n${c.counter}\n\nSection: ${c.section}\nCase: ${c.case}\n---\n`;
    onAddToDraft && onAddToDraft(block);
  };

  return (
    <>
      <button style={S.triggerBtn} onClick={() => setOpen(true)} title="Generate counter-arguments">
        ⚔ Counter Args
      </button>

      <GeminiModal
        open={open}
        onClose={() => { setOpen(false); setCounters([]); setArgument(''); }}
        title="Counter-Argument Generator"
      >
        <p style={S.label}>Enter the opposing counsel's argument below.</p>
        <textarea
          style={S.inputArea}
          placeholder="The opposing counsel argues that…"
          value={argument}
          onChange={(e) => { setArgument(e.target.value); setCounters([]); }}
        />
        <button
          style={{ ...S.generateBtn, opacity: !argument.trim() || loading ? 0.4 : 1 }}
          onClick={generate}
          disabled={!argument.trim() || loading}
        >
          Generate Counter-Arguments
        </button>

        {loading && <AiThinking text="Generating counter-arguments…" />}
        <AiError error={error} onRetry={generate} />

        {counters.length > 0 && (
          <>
            <div style={S.grid}>
              {counters.map((c) => (
                <div
                  key={c.num}
                  style={S.card}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={S.counterNum}>0{c.num}</div>
                  <div style={S.counterText}>{c.counter}</div>
                  {c.section && (
                    <>
                      <div style={S.metaLabel}>Section</div>
                      <div style={S.metaValue}>{c.section}</div>
                    </>
                  )}
                  {c.case && (
                    <>
                      <div style={S.metaLabel}>Supporting Case</div>
                      <div style={S.metaValue}>{c.case}</div>
                    </>
                  )}
                  <button style={S.addBtn} onClick={() => handleAdd(c)}>
                    Add to Draft
                  </button>
                </div>
              ))}
            </div>
            <button style={S.ghostBtn} onClick={() => setOpen(false)}>Close</button>
          </>
        )}
      </GeminiModal>
    </>
  );
}
