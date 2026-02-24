import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DOC_TYPES = [
  { key: 'petition',  name: 'Petition',  desc: 'Court filing' },
  { key: 'contract',  name: 'Contract',  desc: 'Agreements' },
  { key: 'notice',    name: 'Notice',    desc: 'Legal notice' },
  { key: 'affidavit', name: 'Affidavit', desc: 'Sworn statement' },
];

const COURTS = [
  'District Court', 'Sessions Court', 'Family Court',
  'High Court', 'Supreme Court of India',
  'National Green Tribunal', 'NCLT', 'ITAT',
];

const QuickDraft = () => {
  const navigate = useNavigate();
  const [docType, setDocType] = useState('petition');
  const [court, setCourt] = useState('');
  const [brief, setBrief] = useState('');

  const handleGenerate = () => {
    if (!brief.trim()) return;
    const params = new URLSearchParams({ doc_type: docType, court, brief });
    navigate(`/draft/new?${params.toString()}`);
  };

  return (
    <div style={Q.card}>
      <div style={Q.title}>Quick Draft</div>
      <div style={Q.sub}>Describe your case, AI does the rest</div>

      {/* Doc type chips */}
      <div style={Q.chipRow}>
        {DOC_TYPES.map((t) => (
          <button
            key={t.key}
            style={{ ...Q.chip, ...(docType === t.key ? Q.chipActive : {}) }}
            onClick={() => setDocType(t.key)}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Brief */}
      <textarea
        style={Q.textarea}
        rows={3}
        placeholder="Describe your case briefly…"
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
      />

      {/* Court */}
      <select style={Q.select} value={court} onChange={(e) => setCourt(e.target.value)}>
        <option value="">Select court…</option>
        {COURTS.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <button
        style={{ ...Q.genBtn, opacity: brief.trim() ? 1 : 0.45 }}
        onClick={handleGenerate}
        disabled={!brief.trim()}
      >
        Generate with AI
      </button>
    </div>
  );
};

const Q = {
  card: {
    background: '#fff',
    border: '1px solid #e8e8e4',
    borderRadius: 14,
    padding: '24px',
    fontFamily: "'DM Sans', sans-serif",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18, fontWeight: 400, color: '#111', marginBottom: 4,
  },
  sub: { fontSize: 12, color: '#aaa', marginBottom: 18 },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  chip: {
    padding: '5px 13px',
    borderRadius: 100,
    border: '1px solid #e0dfdb',
    background: '#fff',
    color: '#777',
    fontSize: 12,
    fontWeight: 400,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s',
  },
  chipActive: {
    background: '#111',
    color: '#fff',
    borderColor: '#111',
  },
  textarea: {
    width: '100%',
    border: '1px solid #e8e8e4',
    borderRadius: 10,
    padding: '10px 13px',
    fontSize: 13,
    color: '#111',
    fontFamily: "'DM Sans', sans-serif",
    resize: 'none',
    outline: 'none',
    marginBottom: 10,
    background: '#faf9f7',
    lineHeight: 1.6,
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    border: '1px solid #e8e8e4',
    borderRadius: 10,
    padding: '9px 13px',
    fontSize: 13,
    color: '#111',
    fontFamily: "'DM Sans', sans-serif",
    background: '#faf9f7',
    outline: 'none',
    marginBottom: 14,
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  genBtn: {
    width: '100%',
    padding: '11px',
    borderRadius: 100,
    background: '#111',
    color: '#fff',
    border: 'none',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s',
  },
};

export default QuickDraft;
