import React from 'react';

const SUGGESTIONS = [
  {
    icon: '⚡',
    text: 'Add IPC §405 — Criminal breach of trust to your stay order petition',
    tag: 'Strong precedent · 94% match',
  },
  {
    icon: '📖',
    text: 'Similar case: Maneka Gandhi vs Union of India (1978) — Article 21',
    tag: 'Constitutional · Supreme Court',
  },
  {
    icon: '✏️',
    text: 'Your rent recovery notice may need the mandatory 60-day period clause',
    tag: 'Required · Transfer of Property Act',
  },
];

const AISuggestions = () => (
  <div style={styles.card}>
    <div style={styles.header}>
      <div style={styles.pulse} />
      <span style={styles.title}>AI Suggestions</span>
      <span style={styles.sub}>Based on your drafts</span>
    </div>

    {SUGGESTIONS.map((s, i) => (
      <div key={i} style={styles.item}>
        <div style={styles.icon}>{s.icon}</div>
        <div>
          <div style={styles.text}>{s.text}</div>
          <div style={styles.tag}>{s.tag}</div>
        </div>
      </div>
    ))}
  </div>
);

const pulseKeyframes = `
@keyframes lm-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}
`;

// Inject keyframes once
if (!document.querySelector('#lm-pulse-style')) {
  const el = document.createElement('style');
  el.id = 'lm-pulse-style';
  el.textContent = pulseKeyframes;
  document.head.appendChild(el);
}

const styles = {
  card: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 20,
  },
  header: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
  pulse: {
    width: 8, height: 8, borderRadius: '50%',
    background: 'var(--gold)',
    boxShadow: '0 0 8px rgba(201,168,76,0.6)',
    animation: 'lm-pulse 2s infinite',
    flexShrink: 0,
  },
  title: { fontSize: 13, fontWeight: 600, color: 'var(--paper)' },
  sub: { fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' },
  item: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    cursor: 'pointer',
    transition: 'padding-left 0.15s',
  },
  icon: {
    width: 28, height: 28,
    background: 'rgba(201,168,76,0.10)',
    borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, flexShrink: 0,
  },
  text: { fontSize: 12.5, color: 'rgba(245,240,232,0.75)', lineHeight: 1.4 },
  tag: { fontSize: 10, color: 'var(--gold)', marginTop: 2, fontWeight: 500 },
};

export default AISuggestions;
