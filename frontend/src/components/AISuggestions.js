import React from 'react';

const SUGGESTIONS = [
  {
    text: 'Add IPC §405 — Criminal breach of trust to your stay order petition',
    tag: 'Strong precedent · 94% match',
  },
  {
    text: 'Similar case: Maneka Gandhi vs Union of India (1978) — Article 21',
    tag: 'Constitutional · Supreme Court',
  },
  {
    text: 'Your rent recovery notice may need the mandatory 60-day period clause',
    tag: 'Required · Transfer of Property Act',
  },
];

const AISuggestions = () => (
  <div style={A.card}>
    <div style={A.header}>
      <span style={A.dot} />
      <span style={A.title}>AI Insights</span>
      <span style={A.sub}>Based on your drafts</span>
    </div>

    {SUGGESTIONS.map((s, i) => (
      <div key={i} style={A.item}>
        <div style={A.text}>{s.text}</div>
        <div style={A.tag}>{s.tag}</div>
      </div>
    ))}
  </div>
);

const A = {
  card: {
    background: '#fff',
    border: '1px solid #e8e8e4',
    borderRadius: 14,
    padding: '20px 22px',
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 7,
    marginBottom: 14,
  },
  dot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#4ade80',
    flexShrink: 0,
  },
  title: { fontSize: 13, fontWeight: 600, color: '#111' },
  sub: { fontSize: 10.5, color: '#bbb', marginLeft: 'auto' },
  item: {
    padding: '11px 0',
    borderBottom: '1px solid #f4f3f0',
    cursor: 'pointer',
  },
  text: { fontSize: 12.5, color: '#444', lineHeight: 1.45 },
  tag: {
    fontSize: 10.5,
    color: '#aaa',
    marginTop: 4,
    fontStyle: 'italic',
  },
};

export default AISuggestions;
