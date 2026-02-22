import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DOC_TYPES = [
  { key: 'petition',  icon: '📜', name: 'Petition',  desc: 'Court filing' },
  { key: 'contract',  icon: '📋', name: 'Contract',  desc: 'Agreements' },
  { key: 'notice',    icon: '✉️',  name: 'Notice',    desc: 'Legal notice' },
  { key: 'affidavit', icon: '🔏', name: 'Affidavit', desc: 'Sworn statement' },
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
    <div style={styles.card}>
      {/* Decorative scale */}
      <div style={styles.decor}>⚖</div>

      <div style={styles.title}>✦ Quick Draft</div>
      <div style={styles.sub}>Select type and describe your case</div>

      {/* Doc type grid */}
      <div style={styles.grid}>
        {DOC_TYPES.map((t) => (
          <div
            key={t.key}
            style={{ ...styles.typeBtn, ...(docType === t.key ? styles.typeBtnActive : {}) }}
            onClick={() => setDocType(t.key)}
          >
            <div style={styles.typeIcon}>{t.icon}</div>
            <div style={styles.typeName}>{t.name}</div>
            <div style={styles.typeDesc}>{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Brief textarea */}
      <textarea
        style={styles.input}
        rows={3}
        placeholder="Describe your case briefly…&#10;e.g. Petition for stay of eviction against illegal demolition by local authority…"
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
      />

      {/* Court selector */}
      <select
        style={{ ...styles.input, cursor: 'pointer', marginBottom: 10 }}
        value={court}
        onChange={(e) => setCourt(e.target.value)}
      >
        <option value="">Select Court Level…</option>
        {COURTS.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <button
        style={{ ...styles.genBtn, opacity: brief.trim() ? 1 : 0.5 }}
        onClick={handleGenerate}
        disabled={!brief.trim()}
      >
        ✦ Generate Draft with AI
      </button>
    </div>
  );
};

const styles = {
  card: {
    background: 'linear-gradient(135deg, rgba(139,26,26,0.15), rgba(201,168,76,0.08))',
    border: '1px solid rgba(201,168,76,0.15)',
    borderRadius: 14,
    padding: 22,
    position: 'relative',
    overflow: 'hidden',
  },
  decor: {
    position: 'absolute', right: -20, bottom: -20,
    fontSize: 80, opacity: 0.04, transform: 'rotate(-15deg)',
    pointerEvents: 'none', userSelect: 'none',
  },
  title: { fontFamily: 'var(--font-heading)', fontSize: 16, color: 'var(--paper)', marginBottom: 4 },
  sub: { fontSize: 12, color: 'var(--muted)', marginBottom: 18 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 },
  typeBtn: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, padding: '10px 12px',
    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
    userSelect: 'none',
  },
  typeBtnActive: { background: 'rgba(201,168,76,0.08)', borderColor: 'rgba(201,168,76,0.2)' },
  typeIcon: { fontSize: 16, marginBottom: 4 },
  typeName: { fontSize: 12, fontWeight: 500, color: 'var(--paper)' },
  typeDesc: { fontSize: 10, color: 'var(--muted)', marginTop: 1 },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13, color: 'var(--paper)',
    fontFamily: 'var(--font-body)',
    resize: 'none', outline: 'none',
    marginBottom: 10,
    transition: 'border-color 0.2s',
  },
  genBtn: {
    width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '11px 16px',
    background: 'linear-gradient(135deg, var(--gold), #a87c2a)',
    color: 'var(--ink)',
    border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'var(--font-body)',
    transition: 'all 0.2s',
  },
};

export default QuickDraft;
