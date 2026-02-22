import React from 'react';

const DEFAULT_CITATIONS = [
  { code: 'IPC §420',  name: 'Cheating and dishonestly inducing delivery of property', year: '1860' },
  { code: 'CPC §80',   name: 'Notice to government before suit',                       year: '1908' },
  { code: 'Art. 226',  name: 'Power of High Courts to issue writs',                    year: '1950' },
  { code: 'CrPC §438', name: 'Anticipatory bail',                                      year: '1973' },
];

const CitationBox = ({ citations = DEFAULT_CITATIONS }) => (
  <div style={styles.box}>
    <div style={styles.title}>📚 Recently Used Citations</div>
    {citations.map((c) => (
      <div key={c.code} style={styles.item}>
        <span style={styles.code}>{c.code}</span>
        <span style={styles.name}>{c.name}</span>
        <span style={styles.year}>{c.year}</span>
      </div>
    ))}
  </div>
);

const styles = {
  box: {
    background: 'rgba(139,26,26,0.08)',
    border: '1px solid rgba(139,26,26,0.20)',
    borderRadius: 10,
    padding: '14px 16px',
  },
  title: {
    fontSize: 11, fontWeight: 600, color: '#fc8181',
    marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  item: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 0',
    borderBottom: '1px solid rgba(139,26,26,0.10)',
    fontSize: 12,
  },
  code: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10, color: '#fc8181', fontWeight: 500,
    flexShrink: 0, minWidth: 72,
  },
  name: { color: 'rgba(245,240,232,0.70)', flex: 1 },
  year: { color: 'var(--muted)', fontSize: 11, flexShrink: 0 },
};

export default CitationBox;
