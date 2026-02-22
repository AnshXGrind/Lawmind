import React from 'react';

const STATS = [
  {
    icon: '📄',
    valueKey: 'total',
    label: 'Total Drafts Created',
    change: '↑ this month',
    changeType: 'up',
  },
  {
    icon: '⚡',
    valueKey: 'week',
    label: 'Drafts This Week',
    change: '↑ from last week',
    changeType: 'up',
  },
  {
    icon: '⚖️',
    valueKey: 'citations',
    label: 'Citations Used',
    change: 'IPC · CrPC · CPC',
    changeType: 'neutral',
  },
  {
    icon: '⏱',
    valueKey: 'timeSaved',
    label: 'Time Saved Per Draft',
    change: '↑ vs manual drafting',
    changeType: 'up',
  },
];

const StatsRow = ({ drafts = [] }) => {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const values = {
    total: drafts.length,
    week: drafts.filter((d) => new Date(d.created_at) > weekAgo).length,
    citations: drafts.reduce((acc, d) => acc + (d.sections?.length || 0), 0),
    timeSaved: '~4h',
  };

  return (
    <div style={styles.row}>
      {STATS.map((s) => (
        <div key={s.label} style={styles.card}>
          <div style={styles.cardInner}>
            <span style={styles.icon}>{s.icon}</span>
            <div>
              <div style={styles.value}>{values[s.valueKey]}</div>
              <div style={styles.label}>{s.label}</div>
              <span
                style={{
                  ...styles.change,
                  ...(s.changeType === 'up' ? styles.changeUp : styles.changeNeutral),
                }}
              >
                {s.change}
              </span>
            </div>
          </div>
          <div style={styles.topLine} />
        </div>
      ))}
    </div>
  );
};

const styles = {
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 28,
  },
  card: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: '20px 20px 18px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  topLine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)',
  },
  cardInner: { display: 'flex', flexDirection: 'column', gap: 6 },
  icon: { fontSize: 20, marginBottom: 6 },
  value: {
    fontFamily: 'var(--font-heading)',
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--paper)',
    lineHeight: 1,
  },
  label: { fontSize: 12, color: 'var(--muted)', marginTop: 4 },
  change: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 7px',
    borderRadius: 20,
    fontSize: 11,
    marginTop: 8,
  },
  changeUp: { background: 'rgba(72,187,120,0.12)', color: '#68d391' },
  changeNeutral: { background: 'rgba(201,168,76,0.12)', color: 'var(--gold-light)' },
};

// Responsive override via CSS class
export default StatsRow;
